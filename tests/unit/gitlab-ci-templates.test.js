const GitLabCITemplates = require('../../src/templates/gitlab-ci-templates');

describe('GitLabCITemplates', () => {
  let templates;

  beforeEach(() => {
    templates = new GitLabCITemplates();
  });

  describe('render', () => {
    test('должен рендерить базовый шаблон', () => {
      const data = {
        packageManager: 'npm',
        buildCommand: 'build',
        name: 'test-app',
        nodeVersion: '18',
        port: 3000
      };

      const result = templates.render('basic', data);

      expect(result).toContain('image: node:18');
      expect(result).toContain('npm install --frozen-lockfile');
      expect(result).toContain('npm run build');
      expect(result).toContain('https://test-app.example.com');
      expect(result).toContain('stages:');
    });

    test('должен рендерить frontend шаблон', () => {
      const data = {
        packageManager: 'yarn',
        buildCommand: 'build',
        name: 'react-app',
        nodeVersion: '16'
      };

      const result = templates.render('frontend', data);

      expect(result).toContain('yarn install --frozen-lockfile');
      expect(result).toContain('lint_code:');
      expect(result).toContain('staging-react-app');
      expect(result).toContain('deploy_staging:');
    });

    test('должен рендерить backend шаблон', () => {
      const data = {
        packageManager: 'npm',
        name: 'api',
        nodeVersion: '18',
        port: 5000
      };

      const result = templates.render('backend', data);

      expect(result).toContain('security_scan:');
      expect(result).toContain('npm audit');
      expect(result).toContain('api-api.example.com');
      expect(result).toContain('80:5000');
    });

    test('должен рендерить fullstack шаблон', () => {
      const data = {
        packageManager: 'yarn',
        buildCommand: 'build',
        name: 'nextjs-app',
        nodeVersion: '18'
      };

      const result = templates.render('fullstack', data);

      expect(result).toContain('type_check:');
      expect(result).toContain('.next/cache/');
      expect(result).toContain('yarn run type-check');
    });

    test('должен бросать ошибку для несуществующего шаблона', () => {
      const data = { packageManager: 'npm' };

      expect(() => templates.render('nonexistent', data))
        .toThrow('Шаблон nonexistent не найден');
    });
  });

  describe('replaceVariables', () => {
    test('должен заменять все переменные', () => {
      const template = 'image: node:{{nodeVersion}}\napp: {{appName}}';
      const data = { nodeVersion: '18', name: 'test-app' };

      const result = templates.replaceVariables(template, data);

      expect(result).toContain('image: node:18');
      expect(result).toContain('app: test-app');
    });
  });
});