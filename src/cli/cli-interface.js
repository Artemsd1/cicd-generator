const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');

class CLIInterface {
  constructor() {
    this.setupCommands();
  }

  setupCommands() {
    program
      .name('cicd-gen')
      .description('Генератор CI/CD конфигураций для Node.js проектов')
      .version('1.0.0');

    program
      .command('generate')
      .alias('gen')
      .description('Генерация CI/CD конфигураций')
      .option('-p, --path <path>', 'путь к проекту', process.cwd())
      .option('-o, --output <path>', 'папка для вывода', './generated')
      .option('-t, --type <type>', 'тип проекта (auto, react, express, nextjs)')
      .option('-v, --verbose', 'подробный вывод')
      .option('-i, --interactive', 'интерактивный режим')
      .action(this.handleGenerate.bind(this));

    program
      .command('analyze')
      .description('Анализ проекта без генерации')
      .option('-p, --path <path>', 'путь к проекту', process.cwd())
      .option('-v, --verbose', 'подробный вывод')
      .action(this.handleAnalyze.bind(this));

    program
      .command('validate')
      .description('Валидация существующих конфигураций')
      .option('-p, --path <path>', 'путь к конфигурациям', process.cwd())
      .action(this.handleValidate.bind(this));
  }

  async handleGenerate(options) {
    try {
      if (options.interactive) {
        options = await this.runInteractiveMode(options);
      }

      console.log(chalk.blue.bold('CI/CD Generator'));
      console.log(chalk.gray('Генерация конфигураций CI/CD для Node.js проектов\n'));

      const CICDGenerator = require('../index');
      const generator = new CICDGenerator();
      
      await generator.generate(options);
    } catch (error) {
      console.error(chalk.red('Ошибка генерации:'), error.message);
      process.exit(1);
    }
  }

  async handleAnalyze(options) {
    try {
      const ProjectAnalyzer = require('../core/project-analyzer');
      const analyzer = new ProjectAnalyzer();
      
      console.log(chalk.blue('Анализ проекта...'));
      const projectData = await analyzer.analyze(options.path);
      
      console.log(chalk.green('\n Анализ завершен:'));
      console.log(chalk.gray('Тип проекта:'), chalk.cyan(projectData.type));
      console.log(chalk.gray('Фреймворк:'), chalk.cyan(projectData.framework));
      console.log(chalk.gray('Менеджер пакетов:'), chalk.cyan(projectData.packageManager));
      console.log(chalk.gray('Версия Node.js:'), chalk.cyan(projectData.nodeVersion));
      console.log(chalk.gray('Порт:'), chalk.cyan(projectData.port));
      
      if (options.verbose) {
        console.log(chalk.gray('\nПолные данные:'));
        console.log(JSON.stringify(projectData, null, 2));
      }
    } catch (error) {
      console.error(chalk.red('Ошибка анализа:'), error.message);
      process.exit(1);
    }
  }

  async handleValidate(options) {
    try {
      const YamlValidator = require('../validators/yaml-validator');
      const DockerfileValidator = require('../validators/dockerfile-validator');
      const FileManager = require('../utils/file-manager');
      
      const yamlValidator = new YamlValidator();
      const dockerfileValidator = new DockerfileValidator();
      const fileManager = new FileManager();
      
      console.log(chalk.blue('Валидация конфигураций...'));
      
      // Проверка .gitlab-ci.yml
      const gitlabCIPath = path.join(options.path, '.gitlab-ci.yml');
      if (await fileManager.exists(gitlabCIPath)) {
        const gitlabCIContent = await fileManager.readFile(gitlabCIPath);
        await yamlValidator.validate(gitlabCIContent);
      }
      
      // Проверка Dockerfile
      const dockerfilePath = path.join(options.path, 'Dockerfile');
      if (await fileManager.exists(dockerfilePath)) {
        const dockerfileContent = await fileManager.readFile(dockerfilePath);
        await dockerfileValidator.validate(dockerfileContent);
      }
      
      console.log(chalk.green('\n Валидация завершена'));
    } catch (error) {
      console.error(chalk.red('Ошибка валидации:'), error.message);
      process.exit(1);
    }
  }

  async runInteractiveMode(options) {
    console.log(chalk.blue.bold('\n Интерактивный режим генерации\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Путь к проекту:',
        default: options.path
      },
      {
        type: 'input',
        name: 'output',
        message: 'Папка для вывода:',
        default: options.output
      },
      {
        type: 'list',
        name: 'type',
        message: 'Тип проекта:',
        choices: [
          { name: 'Автоопределение', value: 'auto' },
          { name: 'React приложение', value: 'react' },
          { name: 'Express API', value: 'express' },
          { name: 'Next.js приложение', value: 'nextjs' }
        ],
        default: 'auto'
      },
      {
        type: 'confirm',
        name: 'verbose',
        message: 'Подробный вывод?',
        default: false
      }
    ]);
    
    return { ...options, ...answers };
  }

  run() {
    program.parse();
  }
}

module.exports = CLIInterface;

