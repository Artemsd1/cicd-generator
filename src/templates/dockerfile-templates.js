class DockerfileTemplates {
  constructor() {
    this.templates = {
      basic: this.getBasicTemplate(),
      react: this.getReactTemplate(),
      nextjs: this.getNextjsTemplate(),
      api: this.getApiTemplate()
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
    let result = template
      .replace(/\{\{nodeVersion\}\}/g, data.nodeVersion || '18')
      .replace(/\{\{packageManager\}\}/g, data.packageManager || 'npm')
      .replace(/\{\{port\}\}/g, data.port || 3000)
      .replace(/\{\{buildCommand\}\}/g, data.buildCommand || 'build')
      .replace(/\{\{startCommand\}\}/g, data.startCommand || 'start');

    // Условные блоки для build команды
    if (data.buildCommand) {
      result = result.replace(/\{\{buildStep\}\}/g, `RUN ${data.packageManager} run ${data.buildCommand}`);
    } else {
      result = result.replace(/\{\{buildStep\}\}/g, '# No build step required');
    }

    return result;
  }

  getBasicTemplate() {
    return `# Multi-stage build для Node.js приложения
FROM node:{{nodeVersion}}-alpine AS builder

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка зависимостей
RUN {{packageManager}} install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Сборка приложения (если есть build команда)
{{buildStep}}

# Production stage
FROM node:{{nodeVersion}}-alpine AS production

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка только production зависимостей
RUN {{packageManager}} install --only=production && {{packageManager}} cache clean --force

# Копирование собранного приложения
COPY --from=builder /app .

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE {{port}}

CMD ["{{packageManager}}", "run", "{{startCommand}}"]`;
  }

  getReactTemplate() {
    return `# Multi-stage build для React приложения
FROM node:{{nodeVersion}}-alpine AS builder

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка зависимостей
RUN {{packageManager}} install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN {{packageManager}} run {{buildCommand}}

# Production stage с nginx
FROM nginx:alpine AS production

# Копирование собранного приложения
COPY --from=builder /app/build /usr/share/nginx/html

# Создание базовой конфигурации nginx
RUN echo 'server { \\
    listen 80; \\
    location / { \\
        root /usr/share/nginx/html; \\
        index index.html index.htm; \\
        try_files $$uri $$uri/ /index.html; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;
  }

  getNextjsTemplate() {
    return `# Multi-stage build для Next.js приложения
FROM node:{{nodeVersion}}-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN {{packageManager}} install --frozen-lockfile

FROM node:{{nodeVersion}}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключение телеметрии Next.js
ENV NEXT_TELEMETRY_DISABLED 1

RUN {{packageManager}} run {{buildCommand}}

FROM node:{{nodeVersion}}-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Копирование собранного приложения
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE {{port}}

ENV PORT {{port}}

CMD ["node", "server.js"]`;
  }

  getApiTemplate() {
    return `# Multi-stage build для API приложения
FROM node:{{nodeVersion}}-alpine AS builder

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка зависимостей
RUN {{packageManager}} install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Сборка приложения (если требуется)
{{buildStep}}

# Production stage
FROM node:{{nodeVersion}}-alpine AS production

WORKDIR /app

# Установка curl для health check
RUN apk add --no-cache curl

# Копирование package files
COPY package*.json ./

# Установка только production зависимостей
RUN {{packageManager}} install --only=production && {{packageManager}} cache clean --force

# Копирование приложения
COPY --from=builder /app .

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE {{port}}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:{{port}}/health || exit 1

CMD ["{{packageManager}}", "run", "{{startCommand}}"]`;
  }
}

module.exports = DockerfileTemplates;