const DockerfileTemplates = require('../../src/templates/dockerfile-templates');

describe('DockerfileTemplates', () => {
  let templates;

  beforeEach(() => {
    templates = new DockerfileTemplates();
  });

  describe('render', () => {
    test('должен рендерить базовый шаблон', () => {
      const data = {
        nodeVersion: '18',
        packageManager: 'npm',
        port: 3000,
        buildCommand: 'build',
        startCommand: 'start'
      };

      const result = templates.render('basic', data);

      expect(result).toContain('FROM node:18-alpine');
      expect(result).toContain('npm install --frozen-lockfile');
      expect(result).toContain('EXPOSE 3000');
      expect(result).toContain('npm run build');
    });

    test('должен рендерить React шаблон с nginx', () => {
      const data = {
        nodeVersion: '16',
        packageManager: 'yarn',
        buildCommand: 'build'
      };

      const result = templates.render('react', data);

      expect(result).toContain('FROM node:16-alpine');
      expect(result).toContain('yarn install --frozen-lockfile');
      expect(result).toContain('nginx:alpine');
      expect(result).toContain('yarn run build');
      expect(result).toContain('/usr/share/nginx/html');
    });

    test('должен рендерить Next.js шаблон', () => {
      const data = {
        nodeVersion: '18',
        packageManager: 'npm',
        port: 3000,
        buildCommand: 'build'
      };

      const result = templates.render('nextjs', data);

      expect(result).toContain('NEXT_TELEMETRY_DISABLED 1');
      expect(result).toContain('.next/standalone');
      expect(result).toContain('server.js');
    });

    test('должен рендерить API шаблон с health check', () => {
      const data = {
        nodeVersion: '16',
        packageManager: 'yarn',
        port: 5000,
        startCommand: 'start'
      };

      const result = templates.render('api', data);

      expect(result).toContain('HEALTHCHECK');
      expect(result).toContain('curl -f http://localhost:5000/');
      expect(result).toContain('apk add --no-cache curl');
    });

    test('должен обрабатывать отсутствующую build команду', () => {
      const data = {
        nodeVersion: '18',
        packageManager: 'npm',
        buildCommand: null
      };

      const result = templates.render('basic', data);

      expect(result).toContain('# No build step required');
    });

    test('должен бросать ошибку для несуществующего шаблона', () => {
      const data = { nodeVersion: '18' };

      expect(() => templates.render('nonexistent', data))
        .toThrow('Шаблон nonexistent не найден');
    });
  });

  describe('replaceVariables', () => {
    test('должен заменять все переменные', () => {
      const template = 'FROM node:{{nodeVersion}} EXPOSE {{port}}';
      const data = { nodeVersion: '18', port: 3000 };

      const result = templates.replaceVariables(template, data);

      expect(result).toBe('FROM node:18 EXPOSE 3000');
    });

    test('должен использовать значения по умолчанию', () => {
      const template = 'FROM node:{{nodeVersion}} PORT {{port}}';
      const data = {};

      const result = templates.replaceVariables(template, data);

      expect(result).toBe('FROM node:18 PORT 3000');
    });
  });
});