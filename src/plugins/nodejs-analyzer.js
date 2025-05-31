const BaseAnalyzer = require('./base-analyzer');
const FileManager = require('../utils/file-manager');
const path = require('path');

class NodeJSAnalyzer extends BaseAnalyzer {
  constructor() {
    super();
    this.fileManager = new FileManager();
  }

  async detect(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    return await this.fileManager.exists(packageJsonPath);
  }

  async analyze(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = await this.fileManager.readJson(packageJsonPath);

    const projectData = {
      name: packageJson.name || 'app',
      version: packageJson.version || '1.0.0',
      nodeVersion: this.detectNodeVersion(packageJson),
      packageManager: await this.detectPackageManager(projectPath),
      framework: this.detectFramework(packageJson),
      hasTests: this.hasTests(packageJson),
      scripts: packageJson.scripts || {},
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      port: this.detectPort(packageJson),
      buildCommand: this.detectBuildCommand(packageJson),
      startCommand: this.detectStartCommand(packageJson)
    };

    return projectData;
  }

  detectNodeVersion(packageJson) {
    if (packageJson.engines && packageJson.engines.node) {
      // Извлекаем версию из engines
      let engineVersion = packageJson.engines.node;
      
      // Обрабатываем разные форматы: ">=14", "^16.0.0", "14.x"
      const versionMatch = engineVersion.match(/(\d+)\.?(\d+)?\.?(\d+)?/);
      if (versionMatch) {
        const major = parseInt(versionMatch[1]);
        const minor = parseInt(versionMatch[2] || '0');
        
        // Если версия слишком старая (< 14), предупреждаем но используем минимальную поддерживаемую
        if (major < 14) {
          console.warn(`Проект требует Node.js ${major}, но рекомендуется минимум 14. Используем 14.`);
          return '14';
        }
        
        // Если версия указана как диапазон (>=14), берем указанную
        if (engineVersion.includes('>=')) {
          return `${major}`;
        }
        
        // Точная версия
        return `${major}.${minor}`;
      }
    }
    
    // Если версия не указана, используем современную LTS
    console.log('Версия Node.js не указана в проекте, используем LTS 18');
    return '18';
  }

  async detectPackageManager(projectPath) {
    if (await this.fileManager.exists(path.join(projectPath, 'yarn.lock'))) {
      return 'yarn';
    }
    if (await this.fileManager.exists(path.join(projectPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    return 'npm';
  }

  detectFramework(packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next) return 'next';
    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps.express) return 'express';
    if (deps.fastify) return 'fastify';
    if (deps.koa) return 'koa';
    
    return 'node';
  }

  hasTests(packageJson) {
    const scripts = packageJson.scripts || {};
    return !!(scripts.test && scripts.test !== 'echo "Error: no test specified" && exit 1');
  }

  detectPort(packageJson) {
    const scripts = packageJson.scripts || {};
    
    for (const script of Object.values(scripts)) {
      const portMatch = script.match(/PORT[=\s]+(\d+)/i);
      if (portMatch) return parseInt(portMatch[1]);
    }
    
    return 3000; // По умолчанию
  }

  detectBuildCommand(packageJson) {
    const scripts = packageJson.scripts || {};
    
    // Проверяем наличие build скриптов
    if (scripts.build) return 'build';
    if (scripts.compile) return 'compile';
    if (scripts['build:prod']) return 'build:prod';
    
    // Для API проектов часто нет build команды
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps.express || deps.fastify || deps.koa) {
      // API проект - обычно не требует сборки
      return null;
    }
    
    return null;
  }

  detectStartCommand(packageJson) {
    const scripts = packageJson.scripts || {};
    if (scripts.start) return 'start';
    if (scripts.serve) return 'serve';
    return null;
  }

  getName() {
    return 'nodejs';
  }
}

module.exports = NodeJSAnalyzer;
