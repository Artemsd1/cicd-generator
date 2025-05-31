const yaml = require('js-yaml');

class YamlProcessor {
  parse(yamlString) {
    try {
      return yaml.load(yamlString);
    } catch (error) {
      throw new Error(`Ошибка парсинга YAML: ${error.message}`);
    }
  }

  stringify(object, options = {}) {
    try {
      return yaml.dump(object, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        ...options
      });
    } catch (error) {
      throw new Error(`Ошибка конвертации в YAML: ${error.message}`);
    }
  }

  validate(yamlString) {
    try {
      yaml.load(yamlString);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = YamlProcessor;
