const DockerfileGenerator = require('../../src/generators/dockerfile-generator');

describe('DockerfileGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new DockerfileGenerator();
  });

  test('должен генерировать Dockerfile для React приложения', async () => {
    const projectData = {
      framework: 'react',
      nodeVersion: '18',
      packageManager: 'npm',
      port: 3000
    };

    const dockerfile = await generator.generate(projectData);
    
    expect(dockerfile).toContain('FROM node:18-alpine');
    expect(dockerfile).toContain('nginx');
    expect(dockerfile).toContain('EXPOSE 80');
  });

  test('должен генерировать Dockerfile для API', async () => {
    const projectData = {
      framework: 'express',
      nodeVersion: '18',
      packageManager: 'yarn',
      port: 5000
    };

    const dockerfile = await generator.generate(projectData);
    
    expect(dockerfile).toContain('FROM node:18-alpine');
    expect(dockerfile).toContain('EXPOSE 5000');
    expect(dockerfile).toContain('HEALTHCHECK');
  });
});
