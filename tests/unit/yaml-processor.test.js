const YamlProcessor = require('../../src/utils/yaml-processor');

describe('YamlProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new YamlProcessor();
  });

  describe('parse', () => {
    test('должен парсить валидный YAML', () => {
      const yamlString = `
name: test
version: 1.0.0
dependencies:
  - express
  - jest
`;

      const result = processor.parse(yamlString);

      expect(result).toEqual({
        name: 'test',
        version: '1.0.0',
        dependencies: ['express', 'jest']
      });
    });

    test('должен бросать ошибку при невалидном YAML', () => {
      const invalidYaml = `
name: test
version: [
  invalid: structure
`;

      expect(() => processor.parse(invalidYaml))
        .toThrow('Ошибка парсинга YAML:');
    });
  });

  describe('stringify', () => {
    test('должен конвертировать объект в YAML', () => {
      const object = {
        image: 'node:18',
        stages: ['test', 'build'],
        variables: {
          NODE_ENV: 'production'
        }
      };

      const result = processor.stringify(object);

      expect(result).toContain('image: node:18');
      expect(result).toContain('stages:');
      expect(result).toContain('- test');
      expect(result).toContain('- build');
      expect(result).toContain('NODE_ENV: production');
    });

    test('должен использовать переданные опции', () => {
      const object = { test: 'value' };
      const options = { indent: 4 };

      const result = processor.stringify(object, options);

      expect(result).toBe('test: value\n');
    });

    test('должен бросать ошибку при некорректном объекте', () => {
      const circularObject = {};
      circularObject.self = circularObject;

      expect(() => processor.stringify(circularObject))
        .toThrow('Ошибка конвертации в YAML:');
    });
  });

  describe('validate', () => {
    test('должен возвращать валидный результат для корректного YAML', () => {
      const validYaml = 'name: test\nversion: 1.0.0';

      const result = processor.validate(validYaml);

      expect(result).toEqual({ valid: true });
    });

    test('должен возвращать ошибку для некорректного YAML', () => {
      const invalidYaml = 'name: test\nversion: [invalid';

      const result = processor.validate(invalidYaml);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});