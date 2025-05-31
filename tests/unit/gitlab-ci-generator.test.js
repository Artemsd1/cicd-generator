const GitLabCIGenerator = require('../../src/generators/gitlab-ci-generator');

describe('GitLabCIGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new GitLabCIGenerator();
  });

  test('должен генерировать базовый GitLab CI', async () => {
    const projectData = {
      framework: 'node',
      packageManager: 'npm',
      nodeVersion: '18',
      name: 'test-app',
      hasTests: true
    };

    const gitlabCI = await generator.generate(projectData);
    
    expect(gitlabCI).toContain('image: node:18');
    expect(gitlabCI).toContain('npm install --frozen-lockfile');
    expect(gitlabCI).toContain('stages:');
    expect(gitlabCI).toContain('docker build');
    expect(gitlabCI).toContain('install_dependencies:');
    expect(gitlabCI).toContain('run_tests:');
  });

  test('должен генерировать frontend конфигурацию', async () => {
    const projectData = {
      framework: 'react',
      packageManager: 'yarn',
      buildCommand: 'build',
      name: 'react-app',
      nodeVersion: '18',
      hasTests: true
    };

    const gitlabCI = await generator.generate(projectData);
    
    expect(gitlabCI).toContain('yarn install --frozen-lockfile');
    expect(gitlabCI).toContain('yarn run build');
    expect(gitlabCI).toContain('lint_code:');
    expect(gitlabCI).toContain('coverage');
    expect(gitlabCI).toContain('staging-react-app');
  });

  test('должен генерировать backend конфигурацию', async () => {
    const projectData = {
      framework: 'express',
      packageManager: 'npm',
      port: 5000,
      name: 'api-app',
      nodeVersion: '16',
      hasTests: true
    };

    const gitlabCI = await generator.generate(projectData);
    
    expect(gitlabCI).toContain('security_scan:');
    expect(gitlabCI).toContain('npm audit');
    expect(gitlabCI).toContain('api-api-app');
    expect(gitlabCI).toContain('image: node:16');
  });

  test('должен генерировать fullstack конфигурацию для Next.js', async () => {
    const projectData = {
      framework: 'next',
      packageManager: 'yarn',
      buildCommand: 'build',
      name: 'nextjs-app',
      nodeVersion: '18'
    };

    const gitlabCI = await generator.generate(projectData);
    
    expect(gitlabCI).toContain('type_check:');
    expect(gitlabCI).toContain('yarn run type-check');
    expect(gitlabCI).toContain('.next/cache/');
  });
});