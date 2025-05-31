# Multi-stage build для Node.js приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка зависимостей
RUN npm install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Сборка приложения (если есть build команда)
# No build step required

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка только production зависимостей
RUN npm install --only=production && npm cache clean --force

# Копирование собранного приложения
COPY --from=builder /app .

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["npm", "run", "start"]