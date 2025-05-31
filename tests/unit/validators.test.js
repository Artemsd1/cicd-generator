const YamlValidator = require('../../src/validators/yaml-validator');
const DockerfileValidator = require('../../src/validators/dockerfile-validator');

describe('YamlValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new YamlValidator();
  });

  test('должен валидировать корректный YAML', async () => {
    const validYaml = `
image: node:18
stages:
  - test
  - build
test:
  script: npm test
`;

    const result = await validator.validate(validYaml);
    expect(result).toBe(true);
  });

  test('должен отклонять некорректный YAML', async () => {
    const invalidYaml = `
image: node:18
stages:
  - test
  - build
test:
  script: npm test
  invalid_indent: wrong
`;

    const result = await validator.validate(invalidYaml);
    expect(result).toBe(false);
  });

  test('должен валидировать структуру с обязательными полями', () => {
    const yamlWithRequiredFields = `
image: node:18
stages:
  - test
`;

    const result = validator.validateStructure(yamlWithRequiredFields, ['image', 'stages']);
    expect(result).toBe(true);
  });
});

describe('DockerfileValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new DockerfileValidator();
  });

  test('должен валидировать корректный Dockerfile', async () => {
    const validDockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
CMD ["npm", "start"]
`;

    const result = await validator.validate(validDockerfile);
    expect(result).toBe(true);
  });

  test('должен отклонять Dockerfile без FROM', async () => {
    const invalidDockerfile = `
WORKDIR /app
COPY package.json .
RUN npm install
`;

    const result = await validator.validate(invalidDockerfile);
    expect(result).toBe(false);
  });

  test('должен отклонять Dockerfile без CMD/ENTRYPOINT', async () => {
    const invalidDockerfile = `
FROM node:18
WORKDIR /app
COPY package.json .
`;

    const result = await validator.validate(invalidDockerfile);
    expect(result).toBe(false);
  });
});