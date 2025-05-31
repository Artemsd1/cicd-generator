class GitLabCITemplates {
  constructor() {
    this.templates = {
      basic: this.getBasicTemplate(),
      frontend: this.getFrontendTemplate(),
      backend: this.getBackendTemplate(),
      fullstack: this.getFullstackTemplate()
    };
  }

  render(templateName, data) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Шаблон ${templateName} не найден`);
    }
    
    return this.replaceVariables(template, data);
  }

  replaceVariables(template, data) {
    return template
      .replace(/\{\{packageManager\}\}/g, data.packageManager)
      .replace(/\{\{buildCommand\}\}/g, data.buildCommand || 'build')
      .replace(/\{\{appName\}\}/g, data.name || 'app')
      .replace(/\{\{nodeVersion\}\}/g, data.nodeVersion)
      .replace(/\{\{port\}\}/g, data.port || 3000);
  }

  getBasicTemplate() {
    return `# GitLab CI/CD для Node.js проекта
image: node:{{nodeVersion}}

stages:
  - install
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

before_script:
  - apt-get update -qq && apt-get install -y -qq git curl

install_dependencies:
  stage: install
  script:
    - {{packageManager}} install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 day

run_tests:
  stage: test
  script:
    - {{packageManager}} run test
  coverage: '/Statements\\s*:\\s*(\\d+\\.?\\d*)%/'
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
    - echo "docker run -d -p 80:{{port}} $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
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
  stage: build
  script:
    - {{packageManager}} run {{buildCommand}}
  artifacts:
    paths:
      - .next/
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

deploy_production:
  stage: deploy
  script:
    - echo "Deploying fullstack app to production..."
    - echo "docker run -d -p 80:{{port}} $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
  environment:
    name: production
    url: https://{{appName}}.example.com
  only:
    - master
  when: manual`;
  }
}

module.exports = GitLabCITemplates;