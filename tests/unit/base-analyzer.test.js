const BaseAnalyzer = require('../../src/plugins/base-analyzer');

describe('BaseAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new BaseAnalyzer();
  });

  test('должен бросать ошибку при вызове detect', async () => {
    await expect(analyzer.detect('/test/path'))
      .rejects.toThrow('Метод detect должен быть переопределен');
  });

  test('должен бросать ошибку при вызове analyze', async () => {
    await expect(analyzer.analyze('/test/path'))
      .rejects.toThrow('Метод analyze должен быть переопределен');
  });

  test('должен бросать ошибку при вызове getName', () => {
    expect(() => analyzer.getName())
      .toThrow('Метод getName должен быть переопределен');
  });
});