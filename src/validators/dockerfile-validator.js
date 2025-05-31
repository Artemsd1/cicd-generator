class DockerfileValidator {
  async validate(dockerfileContent) {
    const errors = [];
    const warnings = [];

    // Проверка базового образа
    if (!dockerfileContent.includes('FROM ')) {
      errors.push('Dockerfile должен содержать инструкцию FROM');
    }

    // Проверка WORKDIR
    if (!dockerfileContent.includes('WORKDIR ')) {
      warnings.push('Рекомендуется использовать WORKDIR');
    }

    // Проверка EXPOSE
    if (!dockerfileContent.includes('EXPOSE ')) {
      warnings.push('Рекомендуется указать EXPOSE для порта');
    }

    // Проверка CMD или ENTRYPOINT
    if (!dockerfileContent.includes('CMD ') && !dockerfileContent.includes('ENTRYPOINT ')) {
      errors.push('Dockerfile должен содержать CMD или ENTRYPOINT');
    }

    // Проверка multi-stage build для Node.js
    if (dockerfileContent.includes('node:') && !dockerfileContent.includes('AS ')) {
      warnings.push('Рекомендуется использовать multi-stage build для оптимизации');
    }

    // Проверка безопасности
    if (dockerfileContent.includes('USER root') || !dockerfileContent.includes('USER ')) {
      warnings.push('Рекомендуется создать непривилегированного пользователя');
    }

    if (errors.length > 0) {
      console.error('Ошибки в Dockerfile:', errors);
      return false;
    }

    if (warnings.length > 0) {
      console.warn('Предупреждения для Dockerfile:', warnings);
    }

    console.log('Dockerfile валидация прошла успешно');
    return true;
  }
}

module.exports = DockerfileValidator;