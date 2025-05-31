const ErrorHandler = require('../../src/utils/error-handler');

describe('ErrorHandler', () => {
  let errorHandler;
  let consoleSpy;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('должен обрабатывать ENOENT ошибки', () => {
    const error = new Error('File not found');
    error.code = 'ENOENT';
    error.path = '/test/path';

    errorHandler.handle(error);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Файл или директория не найдены:'),
      '/test/path'
    );
  });

  test('должен обрабатывать синтаксические ошибки', () => {
    const error = new SyntaxError('Unexpected token');

    errorHandler.handle(error);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Синтаксическая ошибка:'),
      'Unexpected token'
    );
  });

  test('должен обрабатывать общие ошибки', () => {
    const error = new Error('General error');

    errorHandler.handle(error);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ошибка:'),
      'General error'
    );
  });
});