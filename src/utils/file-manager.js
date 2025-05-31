const fs = require('fs').promises;
const path = require('path');

class FileManager {
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Ошибка чтения файла ${filePath}: ${error.message}`);
    }
  }

  async writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Файл сохранен: ${filePath}`);
    } catch (error) {
      throw new Error(`Ошибка записи файла ${filePath}: ${error.message}`);
    }
  }

  async readJson(filePath) {
    try {
      const content = await this.readFile(filePath);
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Ошибка чтения JSON файла ${filePath}: ${error.message}`);
    }
  }

  async readDir(dirPath) {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      throw new Error(`Ошибка чтения директории ${dirPath}: ${error.message}`);
    }
  }

  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Ошибка создания директории ${dirPath}: ${error.message}`);
    }
  }
}

module.exports = FileManager;
