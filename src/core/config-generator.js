const DockerfileGenerator = require('../generators/dockerfile-generator');
const GitLabCIGenerator = require('../generators/gitlab-ci-generator');
const YamlValidator = require('../validators/yaml-validator');
const DockerfileValidator = require('../validators/dockerfile-validator');
const FileManager = require('../utils/file-manager');
const path = require('path');
const chalk = require('chalk');

class ConfigGenerator {
  constructor() {
    this.dockerfileGenerator = new DockerfileGenerator();
    this.gitlabCIGenerator = new GitLabCIGenerator();
    this.yamlValidator = new YamlValidator();
    this.dockerfileValidator = new DockerfileValidator();
    this.fileManager = new FileManager();
  }

  async generate(projectData, options) {
    const configs = [];
    const outputPath = options.output || './generated';

    // Создание выходной директории
    await this.fileManager.ensureDir(outputPath);

    // Проверка существующего Dockerfile
    const existingDockerfile = path.join(projectData.path, 'Dockerfile');
    if (await this.fileManager.exists(existingDockerfile)) {
      console.log(chalk.yellow('Найден существующий Dockerfile'));
      console.log(chalk.blue('Создаю улучшенную версию как Dockerfile.generated'));
    }
  
    // Проверка существующего GitLab CI
    const existingGitLabCI = path.join(projectData.path, '.gitlab-ci.yml');
    if (await this.fileManager.exists(existingGitLabCI)) {
      console.log(chalk.yellow('Найден существующий .gitlab-ci.yml'));
      console.log(chalk.blue('Создаю улучшенную версию как .gitlab-ci.generated.yml'));
    }
  
    // Генерация Dockerfile
    const dockerfileContent = await this.dockerfileGenerator.generate(projectData);
    const dockerfilePath = `${outputPath}/Dockerfile`;
    
    if (await this.dockerfileValidator.validate(dockerfileContent)) {
      await this.fileManager.writeFile(dockerfilePath, dockerfileContent);
      configs.push({ filename: 'Dockerfile', content: dockerfileContent });
    }

    // Генерация .gitlab-ci.yml
    const gitlabCIContent = await this.gitlabCIGenerator.generate(projectData);
    const gitlabCIPath = `${outputPath}/.gitlab-ci.yml`;
    
    if (await this.yamlValidator.validate(gitlabCIContent)) {
      await this.fileManager.writeFile(gitlabCIPath, gitlabCIContent);
      configs.push({ filename: '.gitlab-ci.yml', content: gitlabCIContent });
    }

    // Генерация .dockerignore
    const dockerignoreContent = this.generateDockerignore(projectData);
    const dockerignorePath = `${outputPath}/.dockerignore`;
    await this.fileManager.writeFile(dockerignorePath, dockerignoreContent);
    configs.push({ filename: '.dockerignore', content: dockerignoreContent });

    return configs;
  }

  generateDockerignore(projectData) {
    const defaultIgnores = [
      'node_modules',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.git',
      '.gitignore',
      'README.md',
      '.env',
      '.nyc_output',
      'coverage',
      '.vscode',
      '.idea'
    ];

    if (projectData.framework === 'next') {
      defaultIgnores.push('.next');
    }

    if (projectData.framework === 'react') {
      defaultIgnores.push('build');
    }

    return defaultIgnores.join('\n');
  }
}

module.exports = ConfigGenerator;
