# Деплой АСИТ Дейли

## Frontend (Vercel)

### Шаг 1: Подготовка

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Установите Vercel CLI: `npm i -g vercel`

### Шаг 2: Деплой

```bash
# Из корневой директории проекта
vercel

# Для production деплоя
vercel --prod
```

### Шаг 3: Настройка переменных окружения

В Vercel Dashboard добавьте переменную окружения:
- `VITE_API_URL` = URL вашего backend API (например, `https://your-backend.railway.app/api`)

## Backend (Railway)

### Шаг 1: Подготовка

1. Создайте аккаунт на [Railway](https://railway.app)
2. Установите Railway CLI: `npm i -g @railway/cli`

### Шаг 2: Создание проекта

```bash
cd backend
railway login
railway init
```

### Шаг 3: Добавление PostgreSQL

1. В Railway Dashboard откройте ваш проект
2. Нажмите "New" → "Database" → "PostgreSQL"
3. Railway автоматически создаст переменную `DATABASE_URL`

### Шаг 4: Настройка переменных окружения

В Railway Dashboard добавьте переменные:
- `PORT` = 3000
- `DATABASE_URL` = (автоматически создаётся)
- `JWT_SECRET` = (сгенерируйте безопасный ключ)
- `VAPID_PUBLIC_KEY` = (сгенерируйте VAPID ключи)
- `VAPID_PRIVATE_KEY` = (сгенерируйте VAPID ключи)
- `VAPID_EMAIL` = `mailto:your-email@example.com`

### Генерация VAPID ключей

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### Шаг 5: Деплой

```bash
railway up
```

## Альтернатива: Docker

### Frontend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Проверка деплоя

1. Frontend: откройте URL Vercel и проверьте загрузку приложения
2. Backend: проверьте health endpoint: `https://your-backend.railway.app/health`
3. Проверьте подключение к базе данных через Railway Dashboard
4. Протестируйте регистрацию и вход в приложение
5. Протестируйте push-уведомления (требуется HTTPS)

## Troubleshooting

### Frontend не подключается к Backend

- Проверьте правильность `VITE_API_URL` в Vercel
- Убедитесь, что backend работает: `curl https://your-backend/health`
- Проверьте CORS настройки в backend

### Push-уведомления не работают

- Убедитесь, что сайт работает по HTTPS
- Проверьте правильность VAPID ключей
- Протестируйте в Chrome/Edge (лучшая поддержка)

### Ошибки базы данных

- Проверьте `DATABASE_URL` в Railway
- Убедитесь, что миграции выполнены (они запускаются при старте сервера)
- Проверьте логи в Railway Dashboard
