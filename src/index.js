const ProjectAnalyzer = require('./core/project-analyzer');
const ConfigGenerator = require('./core/config-generator');
const ErrorHandler = require('./utils/error-handler');
const chalk = require('chalk');

class CICDGenerator {
  constructor() {
    this.analyzer = new ProjectAnalyzer();
    this.generator = new ConfigGenerator();
    this.errorHandler = new ErrorHandler();
  }

  async generate(options) {
    try {
      console.log(chalk.blue('🚀 Запуск генератора CI/CD конфигураций...'));
      
      // Анализ проекта
      console.log(chalk.yellow('📊 Анализ проекта...'));
      const projectData = await this.analyzer.analyze(options.path);
      
      if (options.verbose) {
        console.log('Данные проекта:', JSON.stringify(projectData, null, 2));
      }
      
      // Генерация конфигураций
      console.log(chalk.yellow('⚙️  Генерация конфигураций...'));
      const configs = await this.generator.generate(projectData, options);
      
      console.log(chalk.green('✅ Генерация завершена успешно!'));
      console.log(chalk.blue('📁 Сгенерированные файлы:'));
      configs.forEach(config => {
        console.log(chalk.gray(`  - ${config.filename}`));
      });
      
      return configs;
    } catch (error) {
      this.errorHandler.handle(error);
      throw error;
    }
  }
}

module.exports = CICDGenerator;
