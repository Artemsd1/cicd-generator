const CICDGenerator = require('../../src/index');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('Full Generation Integration', () => {
  let generator;
  let tempDir;

  beforeEach(async () => {
    generator = new CICDGenerator();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cicd-test-'));
  });

  afterEach(async () => {
    // Cleanup temp directory
    await fs.rmdir(tempDir, { recursive: true });
  });

  test('должен генерировать полный набор файлов для React проекта', async () => {
    // Create test React project
    const projectPath = path.join(tempDir, 'react-project');
    await fs.mkdir(projectPath);
    
    const packageJson = {
      name: 'test-react-app',
      dependencies: { react: '^18.0.0' },
      scripts: { build: 'react-scripts build', start: 'react-scripts start' }
    };
    
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const outputPath = path.join(tempDir, 'output');
    const options = { path: projectPath, output: outputPath };

    const result = await generator.generate(options);

    // Check generated files exist
    expect(result).toHaveLength(3);
    
    const dockerfilePath = path.join(outputPath, 'Dockerfile');
    const gitlabCIPath = path.join(outputPath, '.gitlab-ci.yml');
    const dockerignorePath = path.join(outputPath, '.dockerignore');

    expect(await fs.access(dockerfilePath).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(gitlabCIPath).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(dockerignorePath).then(() => true).catch(() => false)).toBe(true);

    // Check content
    const dockerfileContent = await fs.readFile(dockerfilePath, 'utf8');
    expect(dockerfileContent).toContain('nginx');
    expect(dockerfileContent).toContain('npm run build');
  });

  test('должен обрабатывать ошибки некорректного проекта', async () => {
    const options = { path: '/nonexistent/path' };

    await expect(generator.generate(options)).rejects.toThrow();
  });
});
