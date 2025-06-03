const ConfigGenerator = require("../../src/core/config-generator");
const FileManager = require("../../src/utils/file-manager");

jest.mock("../../src/utils/file-manager");
jest.mock("../../src/generators/dockerfile-generator");
jest.mock("../../src/generators/gitlab-ci-generator");
jest.mock("../../src/validators/yaml-validator");
jest.mock("../../src/validators/dockerfile-validator");

describe("ConfigGenerator", () => {
  let generator;
  let mockFileManager;

  beforeEach(() => {
    generator = new ConfigGenerator();
    mockFileManager = new FileManager();
    generator.fileManager = mockFileManager;

    generator.yamlValidator.validate.mockResolvedValue(true);
    generator.dockerfileValidator.validate.mockResolvedValue(true);

    generator.dockerfileGenerator.generate.mockResolvedValue("FROM node:18");
    generator.gitlabCIGenerator.generate.mockResolvedValue("image: node:18");

    mockFileManager.ensureDir.mockResolvedValue();
    mockFileManager.writeFile.mockResolvedValue();
  });

  test("должен создавать выходную директорию", async () => {
    const projectData = {
      framework: "react",
      path: "/test/project", 
      name: "test-app",
    };
    const options = { output: "./test-output" };

    await generator.generate(projectData, options);

    expect(mockFileManager.ensureDir).toHaveBeenCalledWith("./test-output");
  });

  test("должен генерировать все необходимые файлы", async () => {
    const projectData = { framework: "react",
            path: "/test/project"
     };
    const options = { output: "./test-output" };

    const result = await generator.generate(projectData, options);

    expect(result).toHaveLength(3); 
    expect(result[0].filename).toBe("Dockerfile");
    expect(result[1].filename).toBe(".gitlab-ci.yml");
    expect(result[2].filename).toBe(".dockerignore");
  });

  test("должен валидировать сгенерированные файлы", async () => {
    const projectData = { framework: "express", path: "/test/project"};
    const options = { output: "./test-output" };

    await generator.generate(projectData, options);

    expect(generator.dockerfileValidator.validate).toHaveBeenCalled();
    expect(generator.yamlValidator.validate).toHaveBeenCalled();
  });

  test("должен генерировать правильный dockerignore для React", async () => {
    const projectData = {
      framework: "react",
      path: "/test/project", 
      name: "test-app",
    };
    const options = { output: "./test-output" };

    await generator.generate(projectData, options);

    const dockerignoreCall = mockFileManager.writeFile.mock.calls.find((call) =>
      call[0].includes(".dockerignore")
    );
    expect(dockerignoreCall[1]).toContain("build");
  });

  test("должен генерировать правильный dockerignore для Next.js", async () => {
    const projectData = { framework: "next", path: "/test/project" };
    const options = { output: "./test-output" };

    await generator.generate(projectData, options);

    const dockerignoreCall = mockFileManager.writeFile.mock.calls.find((call) =>
      call[0].includes(".dockerignore")
    );
    expect(dockerignoreCall[1]).toContain(".next");
  });
});
