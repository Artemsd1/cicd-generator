const GitLabCITemplates = require('../templates/gitlab-ci-templates');

class GitLabCIGenerator {
  constructor() {
    this.templates = new GitLabCITemplates();
  }

  async generate(projectData) {
    const template = this.selectTemplate(projectData);
    return this.templates.render(template, projectData);
  }

  selectTemplate(projectData) {
    if (projectData.framework === 'react' || projectData.framework === 'vue') {
      return 'frontend';
    }
    if (projectData.framework === 'express' || projectData.framework === 'fastify') {
      return 'backend';
    }
    if (projectData.framework === 'next') {
      return 'fullstack';
    }
    return 'basic';
  }
}

module.exports = GitLabCIGenerator;
