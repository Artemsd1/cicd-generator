class BaseAnalyzer {
  async detect(projectPath) {
    throw new Error('Метод detect должен быть переопределен');
  }

  async analyze(projectPath) {
    throw new Error('Метод analyze должен быть переопределен');
  }

  getName() {
    throw new Error('Метод getName должен быть переопределен');
  }
}

module.exports = BaseAnalyzer;
