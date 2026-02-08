# АСИТ Дейли - Backend

REST API для приложения АСИТ Дейли.

## Технологии

- Node.js + Express + TypeScript
- PostgreSQL
- JWT аутентификация
- Web Push API для уведомлений
- bcryptjs для хеширования паролей

## Установка

```bash
npm install
```

## Настройка

1. Создайте PostgreSQL базу данных
2. Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`
4. Сгенерируйте VAPID ключи для push-уведомлений:

```bash
npx web-push generate-vapid-keys
```

## Запуск

### Разработка

```bash
npm run dev
```

### Продакшн

```bash
npm run build
npm start
```

## API Эндпоинты

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Терапия

- `GET /api/therapy/current` - Текущая сессия терапии
- `POST /api/therapy/start` - Начать новую терапию
- `GET /api/therapy/current-dose` - Текущая доза
- `POST /api/therapy/take-dose` - Отметить приём
- `PUT /api/therapy/skip-dose` - Пропустить приём
- `GET /api/therapy/history` - История приёмов
- `PUT /api/therapy/maintenance-dose` - Обновить поддерживающую дозу
- `POST /api/therapy/side-effect` - Добавить побочный эффект
- `GET /api/therapy/side-effects` - Список побочных эффектов

### Уведомления

- `POST /api/notifications/subscribe` - Подписаться на push
- `POST /api/notifications/unsubscribe` - Отписаться от push

## База данных

База данных автоматически инициализируется при первом запуске сервера.

### Таблицы

- `users` - Пользователи
- `therapy_sessions` - Сессии терапии
- `doses` - История приёмов
- `side_effects` - Побочные эффекты
- `push_subscriptions` - Подписки на уведомления
