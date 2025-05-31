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
      port: 3000,
      buildCommand: 'build'
    };

    const dockerfile = await generator.generate(projectData);
    
    expect(dockerfile).toContain('FROM node:18-alpine');
    expect(dockerfile).toContain('nginx');
    expect(dockerfile).toContain('EXPOSE 80');
    expect(dockerfile).toContain('npm install --frozen-lockfile');
    expect(dockerfile).toContain('npm run build');
    expect(dockerfile).toContain('/usr/share/nginx/html');
  });

  test('должен генерировать Dockerfile для API с health check', async () => {
    const projectData = {
      framework: 'express',
      nodeVersion: '16',
      packageManager: 'yarn',
      port: 5000,
      buildCommand: null
    };

    const dockerfile = await generator.generate(projectData);
    
    expect(dockerfile).toContain('FROM node:16-alpine');
    expect(dockerfile).toContain('EXPOSE 5000');
    expect(dockerfile).toContain('HEALTHCHECK');
    expect(dockerfile).toContain('curl -f http://localhost:5000/');
    expect(dockerfile).toContain('yarn install');
    expect(dockerfile).toContain('# No build step required');
  });

  test('должен генерировать Dockerfile для Next.js', async () => {
    const projectData = {
      framework: 'next',
      nodeVersion: '18',
      packageManager: 'yarn',
      port: 3000,
      buildCommand: 'build'
    };

    const dockerfile = await generator.generate(projectData);
    
    expect(dockerfile).toContain('NEXT_TELEMETRY_DISABLED');
    expect(dockerfile).toContain('yarn run build');
    expect(dockerfile).toContain('.next/standalone');
    expect(dockerfile).toContain('CMD ["node", "server.js"]');
  });

  test('должен использовать правильный package manager', async () => {
    const yarnProject = {
      framework: 'react',
      packageManager: 'yarn',
      nodeVersion: '18'
    };

    const npmProject = {
      framework: 'react', 
      packageManager: 'npm',
      nodeVersion: '18'
    };

    const yarnDockerfile = await generator.generate(yarnProject);
    const npmDockerfile = await generator.generate(npmProject);
    
    expect(yarnDockerfile).toContain('yarn install');
    expect(yarnDockerfile).toContain('yarn run');
    
    expect(npmDockerfile).toContain('npm install');
    expect(npmDockerfile).toContain('npm run');
  });
});