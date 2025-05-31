const FileManager = require('../../src/utils/file-manager');
const fs = require('fs').promises;
const path = require('path');

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn()
  }
}));

describe('FileManager', () => {
  let fileManager;

  beforeEach(() => {
    fileManager = new FileManager();
    jest.clearAllMocks();
  });

  describe('exists', () => {
    test('должен возвращать true если файл существует', async () => {
      fs.access.mockResolvedValue();

      const result = await fileManager.exists('/test/file.txt');

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith('/test/file.txt');
    });

    test('должен возвращать false если файл не существует', async () => {
      fs.access.mockRejectedValue(new Error('File not found'));

      const result = await fileManager.exists('/nonexistent/file.txt');

      expect(result).toBe(false);
    });
  });

  describe('readFile', () => {
    test('должен читать файл успешно', async () => {
      const mockContent = 'file content';
      fs.readFile.mockResolvedValue(mockContent);

      const result = await fileManager.readFile('/test/file.txt');

      expect(result).toBe(mockContent);
      expect(fs.readFile).toHaveBeenCalledWith('/test/file.txt', 'utf8');
    });

    test('должен бросать ошибку при неудачном чтении', async () => {
      fs.readFile.mockRejectedValue(new Error('Permission denied'));

      await expect(fileManager.readFile('/test/file.txt'))
        .rejects.toThrow('Ошибка чтения файла /test/file.txt: Permission denied');
    });
  });

  describe('writeFile', () => {
    test('должен записывать файл успешно', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      fs.writeFile.mockResolvedValue();

      await fileManager.writeFile('/test/file.txt', 'content');

      expect(fs.writeFile).toHaveBeenCalledWith('/test/file.txt', 'content', 'utf8');
      expect(consoleSpy).toHaveBeenCalledWith('Файл сохранен: /test/file.txt');
      
      consoleSpy.mockRestore();
    });

    test('должен бросать ошибку при неудачной записи', async () => {
      fs.writeFile.mockRejectedValue(new Error('No space left'));

      await expect(fileManager.writeFile('/test/file.txt', 'content'))
        .rejects.toThrow('Ошибка записи файла /test/file.txt: No space left');
    });
  });

  describe('readJson', () => {
    test('должен читать и парсить JSON файл', async () => {
      const mockJson = { name: 'test', version: '1.0.0' };
      fs.readFile.mockResolvedValue(JSON.stringify(mockJson));

      const result = await fileManager.readJson('/test/package.json');

      expect(result).toEqual(mockJson);
    });

    test('должен бросать ошибку при невалидном JSON', async () => {
      fs.readFile.mockResolvedValue('invalid json {');

      await expect(fileManager.readJson('/test/package.json'))
        .rejects.toThrow('Ошибка чтения JSON файла');
    });
  });

  describe('readDir', () => {
    test('должен читать содержимое директории', async () => {
      const mockFiles = ['file1.js', 'file2.js'];
      fs.readdir.mockResolvedValue(mockFiles);

      const result = await fileManager.readDir('/test/dir');

      expect(result).toEqual(mockFiles);
      expect(fs.readdir).toHaveBeenCalledWith('/test/dir');
    });

    test('должен бросать ошибку при неудачном чтении директории', async () => {
      fs.readdir.mockRejectedValue(new Error('Directory not found'));

      await expect(fileManager.readDir('/nonexistent/dir'))
        .rejects.toThrow('Ошибка чтения директории');
    });
  });

  describe('ensureDir', () => {
    test('должен создавать директорию', async () => {
      fs.mkdir.mockResolvedValue();

      await fileManager.ensureDir('/test/new/dir');

      expect(fs.mkdir).toHaveBeenCalledWith('/test/new/dir', { recursive: true });
    });

    test('должен бросать ошибку при неудачном создании директории', async () => {
      fs.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(fileManager.ensureDir('/test/dir'))
        .rejects.toThrow('Ошибка создания директории');
    });
  });
});