const CICDGenerator = require('../../src/index');
const ProjectAnalyzer = require('../../src/core/project-analyzer');
const ConfigGenerator = require('../../src/core/config-generator');
const ErrorHandler = require('../../src/utils/error-handler');

jest.mock('../../src/core/project-analyzer');
jest.mock('../../src/core/config-generator');
jest.mock('../../src/utils/error-handler');

describe('CICDGenerator (Main Index)', () => {
  let generator;
  let mockAnalyzer;
  let mockConfigGenerator;
  let mockErrorHandler;

  beforeEach(() => {
    mockAnalyzer = {
      analyze: jest.fn()
    };
    mockConfigGenerator = {
      generate: jest.fn()
    };
    mockErrorHandler = {
      handle: jest.fn()
    };

    ProjectAnalyzer.mockImplementation(() => mockAnalyzer);
    ConfigGenerator.mockImplementation(() => mockConfigGenerator);
    ErrorHandler.mockImplementation(() => mockErrorHandler);

    generator = new CICDGenerator();
  });

  test('должен инициализироваться с правильными компонентами', () => {
    expect(generator.analyzer).toBe(mockAnalyzer);
    expect(generator.generator).toBe(mockConfigGenerator);
    expect(generator.errorHandler).toBe(mockErrorHandler);
  });

  test('должен выполнять полный цикл генерации', async () => {
    const projectData = {
      path: '/test/project',
      type: 'nodejs',
      framework: 'react',
      name: 'test-app'
    };

    const configs = [
      { filename: 'Dockerfile', content: 'FROM node:18' },
      { filename: '.gitlab-ci.yml', content: 'image: node:18' }
    ];

    mockAnalyzer.analyze.mockResolvedValue(projectData);
    mockConfigGenerator.generate.mockResolvedValue(configs);

    const options = { path: '/test/project', verbose: false };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const result = await generator.generate(options);

    expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/test/project');
    expect(mockConfigGenerator.generate).toHaveBeenCalledWith(projectData, options);
    expect(result).toBe(configs);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Запуск генератора CI/CD конфигураций...')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Генерация завершена успешно!')
    );

    consoleSpy.mockRestore();
  });

  test('должен выводить подробную информацию в verbose режиме', async () => {
    const projectData = {
      type: 'nodejs',
      framework: 'express',
      dependencies: { express: '^4.18.0' }
    };

    mockAnalyzer.analyze.mockResolvedValue(projectData);
    mockConfigGenerator.generate.mockResolvedValue([]);

    const options = { path: '/test', verbose: true };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await generator.generate(options);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Данные проекта:',
      JSON.stringify(projectData, null, 2)
    );

    consoleSpy.mockRestore();
  });

  test('должен выводить список сгенерированных файлов', async () => {
    const configs = [
      { filename: 'Dockerfile', content: 'content1' },
      { filename: '.gitlab-ci.yml', content: 'content2' },
      { filename: '.dockerignore', content: 'content3' }
    ];

    mockAnalyzer.analyze.mockResolvedValue({});
    mockConfigGenerator.generate.mockResolvedValue(configs);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await generator.generate({ path: '/test' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Сгенерированные файлы:')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('- Dockerfile')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('- .gitlab-ci.yml')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('- .dockerignore')
    );

    consoleSpy.mockRestore();
  });

  test('должен обрабатывать ошибки через ErrorHandler', async () => {
    const testError = new Error('Test error');
    mockAnalyzer.analyze.mockRejectedValue(testError);

    await expect(generator.generate({ path: '/test' }))
      .rejects.toThrow('Test error');

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(testError);
  });
});