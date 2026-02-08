# Структура проекта АСИТ Дейли

## Обзор

```
ASIT Daily/
├── frontend/                    # React PWA приложение
│   ├── public/
│   │   ├── manifest.json       # PWA манифест
│   │   ├── sw.js              # Service Worker
│   │   ├── pwa-192x192.png    # Иконка 192x192 (создать)
│   │   ├── pwa-512x512.png    # Иконка 512x512 (создать)
│   │   └── ICONS.md           # Инструкция по созданию иконок
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   ├── Auth.tsx       # Аутентификация
│   │   │   ├── TodayDose.tsx  # Главный экран
│   │   │   ├── Calendar.tsx   # Календарь приёмов
│   │   │   ├── History.tsx    # История приёмов
│   │   │   ├── SideEffects.tsx # Побочные эффекты
│   │   │   ├── Settings.tsx   # Настройки
│   │   │   └── ExportData.tsx # Экспорт данных
│   │   ├── contexts/          # React контексты
│   │   │   ├── AuthContext.tsx
│   │   │   └── TherapyContext.tsx
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useDoseSchedule.ts  # Логика расчёта дозы
│   │   │   └── useNotifications.ts # Push-уведомления
│   │   ├── services/          # API сервисы
│   │   │   ├── api.ts         # HTTP клиент
│   │   │   └── storage.ts     # LocalStorage
│   │   ├── types/             # TypeScript типы
│   │   │   └── index.ts
│   │   ├── App.tsx            # Главный компонент
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Стили
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts         # Vite + PWA config
│   ├── tailwind.config.js
│   └── README.md
│
├── backend/                    # Express API сервер
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts          # PostgreSQL подключение
│   │   │   └── initDb.ts      # Инициализация БД
│   │   ├── controllers/
│   │   │   ├── authController.ts        # Аутентификация
│   │   │   ├── therapyController.ts     # CRUD терапии
│   │   │   └── notificationController.ts # Push-уведомления
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.ts        # /api/auth/*
│   │   │   ├── therapy.ts     # /api/therapy/*
│   │   │   └── notifications.ts # /api/notifications/*
│   │   └── index.ts           # Express app
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── README.md                   # Главный README
├── DEPLOY.md                   # Инструкция по деплою
├── build.sh                    # Скрипт сборки
├── vercel.json                 # Конфиг Vercel
├── railway.json                # Конфиг Railway
├── Procfile                    # Конфиг Heroku
└── .gitignore
```

## Ключевые файлы

### Frontend

- **TodayDose.tsx** - Главный экран с кнопкой приёма, показывает текущую дозу
- **useDoseSchedule.ts** - Логика автоматического расчёта фазы и дозы
- **TherapyContext.tsx** - Глобальное состояние терапии
- **vite.config.ts** - Настройка PWA плагина

### Backend

- **therapyController.ts** - Основная логика терапии и расчёта доз
- **initDb.ts** - Схема базы данных (5 таблиц)
- **notificationController.ts** - Web Push API

## База данных (PostgreSQL)

### Таблицы

1. **users** - Пользователи (email, password_hash, name)
2. **therapy_sessions** - Сессии терапии (start_date, maintenance_dose, reminder_time)
3. **doses** - История приёмов (date, taken, dose_count, concentration, notes)
4. **side_effects** - Побочные эффекты (type, severity, description)
5. **push_subscriptions** - Подписки на уведомления (endpoint, keys)

## API эндпоинты

### Аутентификация
- POST /api/auth/register
- POST /api/auth/login

### Терапия
- GET /api/therapy/current - Текущая сессия
- POST /api/therapy/start - Начать терапию
- GET /api/therapy/current-dose - Текущая доза
- POST /api/therapy/take-dose - Отметить приём
- PUT /api/therapy/skip-dose - Пропустить
- GET /api/therapy/history - История
- PUT /api/therapy/maintenance-dose - Обновить дозу
- POST /api/therapy/side-effect - Добавить эффект
- GET /api/therapy/side-effects - Список эффектов

### Уведомления
- POST /api/notifications/subscribe
- POST /api/notifications/unsubscribe

## Схема работы приложения

```
1. Пользователь регистрируется → JWT токен → localStorage
2. Устанавливает дату начала терапии → therapy_sessions
3. Каждый день:
   - useDoseSchedule рассчитывает текущую дозу по формуле
   - Пользователь отмечает приём → doses
   - Опционально: добавляет побочный эффект → side_effects
4. Service Worker отправляет push-уведомления
5. Экспорт данных для врача в текст/JSON
```

## Логика расчёта дозы

```typescript
function getCurrentDose(startDate, maintenanceDose) {
  const dayOfTherapy = getDaysSince(startDate);
  
  if (dayOfTherapy <= 10) {
    // Фаза 1: 10 ИР/мл
    return { clicks: dayOfTherapy, concentration: '10 ИР/мл' };
  } else if (dayOfTherapy <= 18) {
    // Фаза 2: 300 ИР/мл
    return { clicks: dayOfTherapy - 10, concentration: '300 ИР/мл' };
  } else {
    // Фаза 3: поддержка
    return { clicks: maintenanceDose, concentration: '300 ИР/мл' };
  }
}
```

## Следующие шаги

1. **Создайте иконки PWA** (см. frontend/public/ICONS.md)
2. **Настройте .env файлы** для frontend и backend
3. **Создайте PostgreSQL базу данных**
4. **Сгенерируйте VAPID ключи** для push-уведомлений
5. **Запустите локально** для тестирования
6. **Деплой** на продакшн (см. DEPLOY.md)

## Требования для деплоя

- Node.js 18+
- PostgreSQL 14+
- HTTPS (для Service Worker и Push API)
- VAPID ключи (npx web-push generate-vapid-keys)

## Тестирование PWA

1. Lighthouse audit (DevTools)
2. Проверка Service Worker
3. Тест push-уведомлений
4. Установка на домашний экран (iOS/Android)
5. Офлайн режим

Готово! 🎉
