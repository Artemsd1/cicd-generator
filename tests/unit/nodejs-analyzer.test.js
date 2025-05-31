const NodeJSAnalyzer = require('../../src/plugins/nodejs-analyzer');
const FileManager = require('../../src/utils/file-manager');

jest.mock('../../src/utils/file-manager');

describe('NodeJSAnalyzer', () => {
  let analyzer;
  let mockFileManager;

  beforeEach(() => {
    analyzer = new NodeJSAnalyzer();
    mockFileManager = new FileManager();
    analyzer.fileManager = mockFileManager;
  });

  test('должен определять React проект', async () => {
    const packageJson = {
      name: 'react-app',
      dependencies: { react: '^18.0.0' },
      scripts: { start: 'react-scripts start', build: 'react-scripts build' }
    };

    mockFileManager.readJson.mockResolvedValue(packageJson);
    mockFileManager.exists.mockResolvedValue(true);

    const result = await analyzer.analyze('/test/path');
    
    expect(result.framework).toBe('react');
    expect(result.hasTests).toBe(false);
    expect(result.port).toBe(3000);
    expect(result.buildCommand).toBe('build');
    expect(result.packageManager).toBe('npm');
  });

  test('должен определять Express API проект', async () => {
    const packageJson = {
      name: 'api',
      dependencies: { express: '^4.18.0' },
      scripts: { 
        start: 'node server.js',
        test: 'jest',
        dev: 'nodemon server.js'
      }
    };

    mockFileManager.readJson.mockResolvedValue(packageJson);
    mockFileManager.exists.mockImplementation((path) => {
      return Promise.resolve(!path.includes('yarn.lock')); // npm project
    });

    const result = await analyzer.analyze('/test/path');
    
    expect(result.framework).toBe('express');
    expect(result.packageManager).toBe('npm');
    expect(result.hasTests).toBe(true);
    expect(result.buildCommand).toBe(null); // API usually no build
  });

  test('должен определять Next.js проект', async () => {
    const packageJson = {
      name: 'nextjs-app',
      dependencies: { next: '^13.0.0', react: '^18.0.0' },
      scripts: { 
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      }
    };

    mockFileManager.readJson.mockResolvedValue(packageJson);
    mockFileManager.exists.mockResolvedValue(true);

    const result = await analyzer.analyze('/test/path');
    
    expect(result.framework).toBe('next');
    expect(result.buildCommand).toBe('build');
    expect(result.startCommand).toBe('start');
  });

  test('должен определять версию Node.js из engines', async () => {
    const packageJson = {
      name: 'app-with-engines',
      engines: { node: '>=16.0.0' },
      dependencies: { express: '^4.18.0' }
    };

    mockFileManager.readJson.mockResolvedValue(packageJson);
    mockFileManager.exists.mockResolvedValue(true);

    const result = await analyzer.analyze('/test/path');
    
    expect(result.nodeVersion).toBe('16.0.0');
  });

  test('должен использовать yarn если есть yarn.lock', async () => {
    const packageJson = {
      name: 'yarn-project',
      dependencies: { react: '^18.0.0' }
    };

    mockFileManager.readJson.mockResolvedValue(packageJson);
    mockFileManager.exists.mockImplementation((path) => {
      return Promise.resolve(path.includes('yarn.lock'));
    });

    const result = await analyzer.analyze('/test/path');
    
    expect(result.packageManager).toBe('yarn');
  });

  test('должен определять порт из scripts', async () => {
    const packageJson = {
      name: 'custom-port-app',
      scripts: {
        start: 'node server.js --port 8080',
        dev: 'PORT=5000 nodemon app.js'
      }
    };

    mockFileManager.readJson.mockResolvedValue(packageJson);
    mockFileManager.exists.mockResolvedValue(true);

    const result = await analyzer.analyze('/test/path');
    
    expect([8080, 5000]).toContain(result.port);
  });
});