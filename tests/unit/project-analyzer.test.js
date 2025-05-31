const ProjectAnalyzer = require('../../src/core/project-analyzer');
const FileManager = require('../../src/utils/file-manager');

jest.mock('../../src/utils/file-manager');

describe('ProjectAnalyzer', () => {
  let analyzer;
  let mockFileManager;

  beforeEach(() => {
    analyzer = new ProjectAnalyzer();
    mockFileManager = new FileManager();
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
