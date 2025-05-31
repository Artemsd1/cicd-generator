const PluginManager = require('./plugin-manager');
const FileManager = require('../utils/file-manager');
const ErrorHandler = require('../utils/error-handler');

class ProjectAnalyzer {
  constructor() {
    this.pluginManager = new PluginManager();
    this.fileManager = new FileManager();
    this.errorHandler = new ErrorHandler();
  }

  async analyze(projectPath) {
    try {
      // Проверка существования проекта
      if (!await this.fileManager.exists(projectPath)) {
        throw new Error(`Проект не найден по пути: ${projectPath}`);
      }

      // Загрузка плагинов
      await this.pluginManager.loadPlugins();

      // Определение типа проекта
      const projectType = await this.detectProjectType(projectPath);
      
      // Получение анализатора для типа проекта
      const analyzer = this.pluginManager.getAnalyzer(projectType);
      
      if (!analyzer) {
        throw new Error(`Анализатор для типа проекта "${projectType}" не найден`);
      }

      // Анализ проекта
      const projectData = await analyzer.analyze(projectPath);
      
      return {
        path: projectPath,
        type: projectType,
        ...projectData
      };
    } catch (error) {
      this.errorHandler.handle(error);
      throw error;
    }
  }

  async detectProjectType(projectPath) {
    const plugins = this.pluginManager.getPlugins();
    
    for (const plugin of plugins) {
      if (await plugin.detect(projectPath)) {
        return plugin.getName();
      }
    }
    
    throw new Error('Не удалось определить тип проекта');
  }
}

module.exports = ProjectAnalyzer;
