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
      return packageJson.engines.node.replace(/[^\d.]/g, '');
    }
    return '18'; // По умолчанию
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
    if (scripts.build) return 'build';
    if (scripts.compile) return 'compile';
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
