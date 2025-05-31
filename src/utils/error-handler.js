const chalk = require('chalk');

class ErrorHandler {
  handle(error) {
    if (error.code === 'ENOENT') {
      console.error(chalk.red('Файл или директория не найдены:'), error.path);
    } else if (error.code === 'EACCES') {
      console.error(chalk.red('Нет прав доступа:'), error.path);
    } else if (error.name === 'SyntaxError') {
      console.error(chalk.red('Синтаксическая ошибка:'), error.message);
    } else {
      console.error(chalk.red('Ошибка:'), error.message);
    }

    if (process.env.DEBUG) {
      console.error(chalk.gray('Stack trace:'), error.stack);
    }
  }

  warn(message) {
    console.warn(chalk.yellow('Предупреждение:'), message);
  }

  info(message) {
    console.info(chalk.blue('Информация:'), message);
  }

  success(message) {
    console.log(chalk.green('Успешно:'), message);
  }
}

module.exports = ErrorHandler;
