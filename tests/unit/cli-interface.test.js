const CLIInterface = require('../../src/cli/cli-interface');
const inquirer = require('inquirer');

jest.mock('inquirer');
jest.mock('../../src/index');
jest.mock('../../src/core/project-analyzer');
jest.mock('../../src/validators/yaml-validator');
jest.mock('../../src/validators/dockerfile-validator');

describe('CLIInterface', () => {
  let cli;
  let mockExit;

  beforeEach(() => {
    cli = new CLIInterface();
    mockExit = jest.spyOn(process, 'exit').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  describe('runInteractiveMode', () => {
    test('должен запрашивать пользовательский ввод', async () => {
      const mockAnswers = {
        path: './test-project',
        output: './test-output',
        type: 'react',
        verbose: true
      };

      inquirer.prompt.mockResolvedValue(mockAnswers);

      const options = { path: './', output: './generated' };
      const result = await cli.runInteractiveMode(options);

      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'path',
            message: 'Путь к проекту:'
          }),
          expect.objectContaining({
            name: 'output',
            message: 'Папка для вывода:'
          }),
          expect.objectContaining({
            name: 'type',
            message: 'Тип проекта:'
          }),
          expect.objectContaining({
            name: 'verbose',
            message: 'Подробный вывод?'
          })
        ])
      );

      expect(result).toEqual({
        ...options,
        ...mockAnswers
      });
    });

    test('должен предоставлять варианты выбора типа проекта', async () => {
      inquirer.prompt.mockResolvedValue({});

      await cli.runInteractiveMode({});

      const typeQuestion = inquirer.prompt.mock.calls[0][0].find(q => q.name === 'type');
      expect(typeQuestion.choices).toEqual([
        { name: 'Автоопределение', value: 'auto' },
        { name: 'React приложение', value: 'react' },
        { name: 'Express API', value: 'express' },
        { name: 'Next.js приложение', value: 'nextjs' }
      ]);
    });
  });

  describe('handleGenerate', () => {
    test('должен вызывать генератор с переданными опциями', async () => {
      const CICDGenerator = require('../../src/index');
      const mockGenerator = {
        generate: jest.fn().mockResolvedValue()
      };
      CICDGenerator.mockImplementation(() => mockGenerator);

      const options = {
        path: './test-project',
        output: './test-output',
        verbose: true
      };

      await cli.handleGenerate(options);

      expect(mockGenerator.generate).toHaveBeenCalledWith(options);
    });

    test('должен запускать интерактивный режим если указан флаг', async () => {
      const CICDGenerator = require('../../src/index');
      const mockGenerator = {
        generate: jest.fn().mockResolvedValue()
      };
      CICDGenerator.mockImplementation(() => mockGenerator);

      inquirer.prompt.mockResolvedValue({
        path: './interactive-project'
      });

      const options = {
        interactive: true,
        path: './default-path'
      };

      await cli.handleGenerate(options);

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(mockGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: './interactive-project'
        })
      );
    });

    test('должен обрабатывать ошибки генерации', async () => {
      const CICDGenerator = require('../../src/index');
      const mockGenerator = {
        generate: jest.fn().mockRejectedValue(new Error('Generation failed'))
      };
      CICDGenerator.mockImplementation(() => mockGenerator);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await cli.handleGenerate({});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Ошибка генерации:'),
        'Generation failed'
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
    });
  });

  describe('handleAnalyze', () => {
    test('должен анализировать проект и выводить результаты', async () => {
      const ProjectAnalyzer = require('../../src/core/project-analyzer');
      const mockAnalyzer = {
        analyze: jest.fn().mockResolvedValue({
          type: 'nodejs',
          framework: 'react',
          packageManager: 'npm',
          nodeVersion: '18',
          port: 3000
        })
      };
      ProjectAnalyzer.mockImplementation(() => mockAnalyzer);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const options = { path: './test-project', verbose: false };

      await cli.handleAnalyze(options);

      expect(mockAnalyzer.analyze).toHaveBeenCalledWith('./test-project');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Тип проекта:'),
        expect.stringContaining('nodejs')
      );

      consoleSpy.mockRestore();
    });

    test('должен показывать подробную информацию в verbose режиме', async () => {
      const ProjectAnalyzer = require('../../src/core/project-analyzer');
      const projectData = {
        type: 'nodejs',
        framework: 'express',
        dependencies: { express: '^4.18.0' }
      };
      const mockAnalyzer = {
        analyze: jest.fn().mockResolvedValue(projectData)
      };
      ProjectAnalyzer.mockImplementation(() => mockAnalyzer);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.handleAnalyze({ path: './test', verbose: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Полные данные:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        JSON.stringify(projectData, null, 2)
      );

      consoleSpy.mockRestore();
    });
  });
});
