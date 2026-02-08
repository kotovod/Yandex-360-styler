# Краткая инструкция по запуску проекта

## Требования
- Node.js 18+
- PostgreSQL 14+

## Шаг 1: Установка зависимостей

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

## Шаг 2: Настройка Backend

1. Создайте базу данных PostgreSQL:
```sql
CREATE DATABASE asit_daily;
```

2. Создайте файл `backend/.env`:
```env
PORT=3000
DATABASE_URL=postgresql://localhost:5432/asit_daily
JWT_SECRET=change-this-secret-key-in-production
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:your-email@example.com
```

3. Сгенерируйте VAPID ключи для push-уведомлений:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Скопируйте полученные ключи в `.env` файл.

## Шаг 3: Настройка Frontend

Создайте файл `.env` в корневой директории:
```env
VITE_API_URL=http://localhost:3000/api
```

## Шаг 4: Запуск

Откройте два терминала:

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Терминал 2 - Frontend:**
```bash
npm run dev
```

## Шаг 5: Открытие приложения

Откройте браузер и перейдите на http://localhost:5173

## Первое использование

1. Зарегистрируйтесь в приложении
2. Перейдите в "Настройки"
3. Укажите дату начала терапии и параметры
4. Нажмите "Сохранить"
5. Включите уведомления (опционально)

Готово! Теперь можно отмечать приёмы препарата.

## Проблемы?

- **Backend не запускается**: Проверьте, что PostgreSQL запущен и DATABASE_URL корректный
- **Frontend не подключается**: Убедитесь, что backend работает на порту 3000
- **Уведомления не работают**: VAPID ключи должны быть правильно настроены в .env

## Production деплой

См. подробную инструкцию в [DEPLOY.md](DEPLOY.md)
