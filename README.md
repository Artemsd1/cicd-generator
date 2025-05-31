# CI/CD Generator

Автоматический генератор конфигураций CI/CD для Node.js проектов с поддержкой Docker контейнеризации.

## Возможности

- **Автоматический анализ** Node.js проектов
- **Генерация Dockerfile** с оптимизациями
- **GitLab CI пайплайны** с полным циклом CI/CD
- **Плагинная архитектура** для расширения
- **Валидация** сгенерированных конфигураций
- **CLI интерфейс** с интерактивным режимом

## Установка

```bash
npm install -g cicd-generator
```

## Использование

### Генерация конфигураций

```bash
# Базовая генерация
cicd-gen generate -p /path/to/project

# Интерактивный режим
cicd-gen generate --interactive

# С указанием выходной папки
cicd-gen generate -p ./my-app -o ./configs
```

### Анализ проекта

```bash
# Анализ без генерации
cicd-gen analyze -p /path/to/project

# Подробный анализ
cicd-gen analyze -p ./my-app --verbose
```

### Валидация конфигураций

```bash
# Валидация существующих файлов
cicd-gen validate -p /path/to/configs
```

## Поддерживаемые проекты

- **React** приложения
- **Next.js** приложения
- **Express** API
- **Vue.js** приложения
- Базовые **Node.js** приложения

## Генерируемые файлы

- `Dockerfile` - контейнеризация приложения
- `.gitlab-ci.yml` - CI/CD пайплайн
- `.dockerignore` - исключения для Docker

## Архитектура

Система построена на плагинной архитектуре, что позволяет легко добавлять поддержку новых языков и фреймворков.

### Основные компоненты

- **ProjectAnalyzer** - анализ проектов
- **PluginManager** - управление плагинами
- **ConfigGenerator** - генерация конфигураций
- **Validators** - валидация результатов

## Разработка

### Запуск тестов

```bash
npm test
```

### Добавление нового плагина

Создайте класс, наследующий от `BaseAnalyzer`:

```javascript
const BaseAnalyzer = require('./base-analyzer');

class PythonAnalyzer extends BaseAnalyzer {
  async detect(projectPath) {
    // Логика определения Python проекта
  }

  async analyze(projectPath) {
    // Логика анализа Python проекта
  }

  getName() {
    return 'python';
  }
}

module.exports = PythonAnalyzer;
```

## Лицензия

MIT
  stage: build
  script:
    - {{packageManager}} run {{buildCommand}}
  artifacts:
    paths:
      - build/
      - dist/
      - .next/
    expire_in: 1 day
  only:
    - master
    - develop

docker_build:
  stage: docker-build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - master

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    - echo "docker run -d -p 80:3000 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
  environment:
    name: production
    url: https://{{appName}}.example.com
  only:
    - master
  when: manual`;
  }

  getFrontendTemplate() {
    return `# GitLab CI/CD для Frontend приложения
image: node:{{nodeVersion}}

stages:
  - install
  - lint
  - test
  - build
  - docker-build
  - deploy

variables:
  NODE_ENV: "production"
  DOCKER_DRIVER: overlay2

cache:
  paths:
    - node_modules/

install_dependencies:
  stage: install
  script:
    - {{packageManager}} install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 day

lint_code:
  stage: lint
  script:
    - {{packageManager}} run lint
  allow_failure: true

run_tests:
  stage: test
  script:
    - {{packageManager}} run test -- --coverage --watchAll=false
  coverage: '/All files[^|]*\\|[^|]*\\s+([\\d\\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build_application:
  stage: build
  script:
    - {{packageManager}} run {{buildCommand}}
  artifacts:
    paths:
      - build/
      - dist/
    expire_in: 1 day

docker_build:
  stage: docker-build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - master

deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
  environment:
    name: staging
    url: https://staging-{{appName}}.example.com
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
  environment:
    name: production
    url: https://{{appName}}.example.com
  only:
    - master
  when: manual`;
  }

  getBackendTemplate() {
    return `# GitLab CI/CD для Backend API
image: node:{{nodeVersion}}

stages:
  - install
  - lint
  - test
  - security
  - build
  - docker-build
  - deploy

variables:
  NODE_ENV: "production"
  DOCKER_DRIVER: overlay2

cache:
  paths:
    - node_modules/

install_dependencies:
  stage: install
  script:
    - {{packageManager}} install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 day

lint_code:
  stage: lint
  script:
    - {{packageManager}} run lint
  allow_failure: true

run_tests:
  stage: test
  script:
    - {{packageManager}} run test
  coverage: '/Statements\\s*:\\s*(\\d+\\.?\\d*)%/'

security_scan:
  stage: security
  script:
    - {{packageManager}} audit --audit-level moderate
  allow_failure: true

build_application:
  stage: build
  script:
    - echo "Building API application..."
    - {{packageManager}} run {{buildCommand}}
  artifacts:
    paths:
      - build/
      - dist/
    expire_in: 1 day
  only:
    - master
    - develop

docker_build:
  stage: docker-build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - master

deploy_production:
  stage: deploy
  script:
    - echo "Deploying API to production..."
    - echo "docker run -d -p 80:{{port}} $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
  environment:
    name: production
    url: https://api-{{appName}}.example.com
  only:
    - master
  when: manual`;
  }

  getFullstackTemplate() {
    return `# GitLab CI/CD для Fullstack приложения (Next.js)
image: node:{{nodeVersion}}

stages:
  - install
  - lint
  - test
  - build
  - docker-build
  - deploy

variables:
  NODE_ENV: "production"
  DOCKER_DRIVER: overlay2

cache:
  paths:
    - node_modules/
    - .next/cache/

install_dependencies:
  stage: install
  script:
    - {{packageManager}} install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 day

lint_code:
  stage: lint
  script:
    - {{packageManager}} run lint
  allow_failure: true

type_check:
  stage: lint
  script:
    - {{packageManager}} run type-check
  allow_failure: true

run_tests:
  stage: test
  script:
    - {{packageManager}} run test -- --coverage --watchAll=false
  coverage: '/All files[^|]*\\|[^|]*\\s+([\\d\\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build_application: