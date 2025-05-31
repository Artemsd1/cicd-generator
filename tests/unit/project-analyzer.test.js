const ProjectAnalyzer = require('../../src/core/project-analyzer');
const FileManager = require('../../src/utils/file-manager');

jest.mock('../../src/utils/file-manager');
jest.mock('../../src/core/plugin-manager');

describe('ProjectAnalyzer', () => {
  let analyzer;
  let mockFileManager;

  beforeEach(() => {
    analyzer = new ProjectAnalyzer();
    mockFileManager = new FileManager();
    analyzer.fileManager = mockFileManager;
    
    // ЗАМЕНИТЬ весь блок mockPluginManager на:
    const mockPlugin = {
      detect: jest.fn().mockResolvedValue(true),
      getName: jest.fn().mockReturnValue('nodejs'),
      analyze: jest.fn().mockResolvedValue({
        framework: 'react',
        type: 'nodejs',
        name: 'test-app'
      })
    };
    
    const mockPluginManager = {
      loadPlugins: jest.fn(),
      getPlugins: jest.fn().mockReturnValue([mockPlugin]),
      getAnalyzer: jest.fn().mockReturnValue(mockPlugin)  // ← ЭТА СТРОКА ИСПРАВЛЯЕТ ОШИБКУ
    };
    
    analyzer.pluginManager = mockPluginManager;
    mockFileManager.exists.mockResolvedValue(true);
  });

  test('должен анализировать Node.js проект', async () => {
    mockFileManager.exists.mockResolvedValue(true);
    mockFileManager.readJson.mockResolvedValue({
      name: 'test-app',
      version: '1.0.0',
      dependencies: {
        react: '^18.0.0'
      }
    });

    const result = await analyzer.analyze('/test/path');
    
    expect(result.type).toBe('nodejs');
    expect(result.framework).toBe('react');
  });

  test('должен обрабатывать ошибку отсутствующего проекта', async () => {
    mockFileManager.exists.mockResolvedValue(false);

    await expect(analyzer.analyze('/nonexistent')).rejects.toThrow();
  });
});
