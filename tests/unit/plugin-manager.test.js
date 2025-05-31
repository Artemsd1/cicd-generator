const PluginManager = require('../../src/core/plugin-manager');
const FileManager = require('../../src/utils/file-manager');

jest.mock('../../src/utils/file-manager');

describe('PluginManager', () => {
  let pluginManager;
  let mockFileManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
    mockFileManager = new FileManager();
    pluginManager.fileManager = mockFileManager;
  });

  test('должен загружать плагины из директории', async () => {
    mockFileManager.readDir.mockResolvedValue([
      'nodejs-analyzer.js',
      'base-analyzer.js', // должен игнорироваться
      'python-analyzer.js'
    ]);

    // Mock successful plugin loading
    jest.mock('../../src/plugins/nodejs-analyzer', () => {
      return class {
        detect() { return true; }
        analyze() { return {}; }
        getName() { return 'nodejs'; }
      };
    }, { virtual: true });

    await pluginManager.loadPlugins();

    expect(mockFileManager.readDir).toHaveBeenCalled();
  });

  test('должен валидировать плагины', () => {
    const validPlugin = {
      detect: jest.fn(),
      analyze: jest.fn(),
      getName: jest.fn()
    };

    const invalidPlugin = {
      detect: jest.fn()
      // missing analyze and getName
    };

    expect(pluginManager.validatePlugin(validPlugin)).toBe(true);
    expect(pluginManager.validatePlugin(invalidPlugin)).toBe(false);
  });

  test('должен получать плагин по имени', () => {
    const testPlugin = {
      detect: jest.fn(),
      analyze: jest.fn(),
      getName: () => 'test'
    };

    pluginManager.plugins.set('test', testPlugin);

    expect(pluginManager.getPlugin('test')).toBe(testPlugin);
    expect(pluginManager.getPlugin('nonexistent')).toBeUndefined();
  });

  test('должен возвращать все плагины', () => {
    const plugin1 = { getName: () => 'plugin1' };
    const plugin2 = { getName: () => 'plugin2' };

    pluginManager.plugins.set('plugin1', plugin1);
    pluginManager.plugins.set('plugin2', plugin2);

    const allPlugins = pluginManager.getPlugins();

    expect(allPlugins).toHaveLength(2);
    expect(allPlugins).toContain(plugin1);
    expect(allPlugins).toContain(plugin2);
  });
});
