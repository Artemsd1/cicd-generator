const yaml = require('js-yaml');

class YamlValidator {
  async validate(yamlContent) {
    try {
      yaml.load(yamlContent);
      console.log('YAML валидация прошла успешно');
      return true;
    } catch (error) {
      console.error('YAML валидация не пройдена:', error.message);
      return false;
    }
  }

  validateStructure(yamlContent, requiredFields = []) {
    try {
      const parsed = yaml.load(yamlContent);
      
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Отсутствует обязательное поле: ${field}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Валидация структуры YAML:', error.message);
      return false;
    }
  }
}

module.exports = YamlValidator;
