const path = require('path');
const FileManager = require('../utils/file-manager');

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.fileManager = new FileManager();
  }

  async loadPlugins() {
    const pluginsDir = path.join(__dirname, '../plugins');
    const pluginFiles = await this.fileManager.readDir(pluginsDir);
    
    for (const file of pluginFiles) {
      if (file.endsWith('.js') && !file.startsWith('base-')) {
        await this.loadPlugin(path.join(pluginsDir, file));
      }
    }
  }

  async loadPlugin(pluginPath) {
    try {
      const PluginClass = require(pluginPath);
      const plugin = new PluginClass();
      
      if (!this.validatePlugin(plugin)) {
        throw new Error(`Плагин ${pluginPath} не соответствует интерфейсу`);
      }
      
      this.plugins.set(plugin.getName(), plugin);
      console.log(`Плагин "${plugin.getName()}" загружен`);
    } catch (error) {
      console.warn(`Ошибка загрузки плагина ${pluginPath}:`, error.message);
    }
  }

  validatePlugin(plugin) {
    const requiredMethods = ['detect', 'analyze', 'getName'];
    return requiredMethods.every(method => typeof plugin[method] === 'function');
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  getAnalyzer(type) {
    return this.getPlugin(type);
  }

  getPlugins() {
    return Array.from(this.plugins.values());
  }
}

module.exports = PluginManager;
