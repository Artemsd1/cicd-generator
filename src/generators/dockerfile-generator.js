const DockerfileTemplates = require('../templates/dockerfile-templates');

class DockerfileGenerator {
  constructor() {
    this.templates = new DockerfileTemplates();
  }

  async generate(projectData) {
    const template = this.selectTemplate(projectData);
    return this.templates.render(template, projectData);
  }

  selectTemplate(projectData) {
    switch (projectData.framework) {
      case 'next':
        return 'nextjs';
      case 'react':
        return 'react';
      case 'express':
      case 'fastify':
      case 'koa':
        return 'api';
      default:
        return 'basic';
    }
  }
}

module.exports = DockerfileGenerator;
