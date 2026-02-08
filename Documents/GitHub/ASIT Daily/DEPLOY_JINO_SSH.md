# 🚀 Деплой АСИТ Дейли на Jino.ru (Phusion Passenger)

**Ваш хостинг: asitdaily.ru | Логин: roller25**

**Всё на одном хостинге - $0 дополнительных затрат!**

---

## 📋 Ваши настройки Jino

- ✅ **SSH сервер**: `asitdaily.ru`
- ✅ **SSH логин**: `roller25`
- ✅ **SSH порт**: `22`
- ✅ **Домен**: `asitdaily.ru`
- ✅ **Основная директория**: `/domains/asitdaily.ru`
- ✅ **Папка для статики**: `public_html`
- ✅ **Node.js приложение**: `app.js` (в основной директории)

**Стоимость**: $0 дополнительно (всё включено в ваш тариф)

---

## 🏗️ Структура на Jino (Phusion Passenger)

```
/domains/asitdaily.ru/
├── app.js                    ← Node.js приложение (точка входа)
├── node_modules/             ← Зависимости
├── backend/                  ← Наш backend код
│   ├── dist/                 ← Скомпилированный backend
│   ├── src/
│   └── package.json
├── public_html/              ← Статические файлы (frontend)
│   ├── index.html
│   ├── assets/
│   └── ...
└── tmp/                      ← Создается автоматически
    └── restart.txt           ← Для рестарта приложения
```

**Как работает:**
1. Все запросы к `asitdaily.ru` сначала идут к Passenger
2. Статические файлы из `public_html/` отдаются напрямую
3. API запросы (`/api/*`) обрабатываются `app.js`
4. `app.js` → прокси к нашему Express серверу

---

## ⏱️ Время деплоя: 30-40 минут

---

## 📝 Шаг 1: Подключение по SSH (5 мин)

### 1.1 Подключитесь к серверу

```bash
ssh roller25@asitdaily.ru
```

Введите ваш SSH пароль (тот же, что в панели Jino).

### 1.2 Проверьте окружение

```bash
# Проверка Node.js
node --version  # Должно быть v18 или выше

# Проверка npm
npm --version

# Проверка текущей директории
pwd  # Должно показать /home/roller25 или похоже

# Перейдите в директорию домена
cd /domains/asitdaily.ru
pwd  # Должно показать /domains/asitdaily.ru
```

---

## 🗄️ Шаг 2: Настройка MySQL (5 мин)

### 2.1 База данных уже создана

Ваша база: `asit_daily` (уже настроена ранее)

### 2.2 Проверьте подключение

```bash
mysql -u asit_user -p asit_daily
# Введите пароль от MySQL

# В MySQL консоли:
SHOW TABLES;
exit;
```

Если база пуста (нет таблиц) - это нормально, Sequelize создаст их при первом запуске.

---

## 📦 Шаг 3: Установка приложения (15 мин)

### 3.1 Клонируйте проект

```bash
# Вернитесь в домашнюю директорию
cd ~

# Клонируйте репозиторий
git clone https://github.com/ваш-username/asit-daily.git

# Или загрузите архив
# wget https://github.com/ваш-username/asit-daily/archive/refs/heads/main.zip
# unzip main.zip
# mv asit-daily-main asit-daily
```

### 3.2 Установите Backend зависимости

```bash
cd ~/asit-daily/backend
npm install --production
```

### 3.3 Создайте .env файл для Backend

```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001

# База данных MySQL (localhost)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=asit_daily
DB_USER=asit_user
DB_PASSWORD=ваш_пароль_от_mysql
DB_DIALECT=mysql

# JWT Secret (сгенерируйте!)
JWT_SECRET=замените_на_свой_64_символьный_ключ

# Email (Jino SMTP)
EMAIL_HOST=smtp.jino.ru
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@asitdaily.ru
EMAIL_PASSWORD=ваш_пароль_от_почты

# VAPID для push-уведомлений (сгенерируйте!)
VAPID_PUBLIC_KEY=замените_на_свой_публичный_ключ
VAPID_PRIVATE_KEY=замените_на_свой_приватный_ключ
VAPID_EMAIL=mailto:noreply@asitdaily.ru
EOF
```

**Генерация секретов** (выполните на локальном компьютере):

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# VAPID Keys
npx web-push generate-vapid-keys
```

Скопируйте сгенерированные значения и вставьте в `.env` на сервере:
```bash
nano ~/asit-daily/backend/.env
# Вставьте ключи, Ctrl+O для сохранения, Ctrl+X для выхода
```

### 3.4 Соберите Backend

```bash
cd ~/asit-daily/backend
npm run build

# Проверка
ls -la dist/  # Должна появиться папка dist/
```

### 3.5 Скопируйте Backend в директорию домена

```bash
# Создайте директорию backend в домене
mkdir -p /domains/asitdaily.ru/backend

# Скопируйте собранный код
cp -r ~/asit-daily/backend/dist /domains/asitdaily.ru/backend/
cp -r ~/asit-daily/backend/node_modules /domains/asitdaily.ru/backend/
cp ~/asit-daily/backend/package.json /domains/asitdaily.ru/backend/
cp ~/asit-daily/backend/.env /domains/asitdaily.ru/backend/

# Проверка
ls -la /domains/asitdaily.ru/backend/
```

---

## 🌐 Шаг 4: Настройка Frontend (10 мин)

### 4.1 Соберите Frontend

```bash
cd ~/asit-daily

# Создайте .env для production
cat > .env.production << 'EOF'
VITE_API_URL=https://asitdaily.ru/api
EOF

# Установите зависимости и соберите
npm install
npm run build

# Проверка
ls -la dist/  # Должны быть index.html, assets/, и т.д.
```

### 4.2 Скопируйте Frontend в public_html

```bash
# Очистите public_html (если там что-то есть)
rm -rf /domains/asitdaily.ru/public_html/*

# Скопируйте собранный frontend
cp -r ~/asit-daily/dist/* /domains/asitdaily.ru/public_html/

# Проверка
ls -la /domains/asitdaily.ru/public_html/
# Должны быть: index.html, assets/, vite.svg и т.д.
```

---

## 🔧 Шаг 5: Создание app.js для Passenger (5 мин)

Phusion Passenger требует файл `app.js` в корне домена как точку входа.

### 5.1 Создайте app.js

```bash
cat > /domains/asitdaily.ru/app.js << 'EOF'
#!/usr/bin/env node

/**
 * АСИТ Дейли - Entry point для Phusion Passenger
 * 
 * Passenger запускает этот файл и ожидает, что он экспортирует
 * Express приложение или запустит HTTP сервер.
 */

const path = require('path');

// Устанавливаем NODE_ENV если не установлен
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Загружаем dotenv из backend директории
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Импортируем наш скомпилированный backend
const backendPath = path.join(__dirname, 'backend', 'dist', 'index.js');

console.log('🚀 Starting АСИТ Дейли backend...');
console.log('📂 Backend path:', backendPath);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);

// Запускаем backend
try {
  require(backendPath);
  console.log('✅ Backend started successfully');
} catch (error) {
  console.error('❌ Failed to start backend:', error);
  throw error;
}
EOF

# Сделайте файл исполняемым
chmod +x /domains/asitdaily.ru/app.js
```

### 5.2 Проверьте app.js вручную

```bash
cd /domains/asitdaily.ru
node app.js

# Должно показать:
# 🚀 Starting АСИТ Дейли backend...
# Database connected successfully
# ✅ АСИТ Дейли - Backend готов!
# ...

# Если всё работает, нажмите Ctrl+C для остановки
```

---

## 🔄 Шаг 6: Настройка Passenger (5 мин)

### 6.1 В панели Jino выберите интерпретатор

1. Зайдите в **Панель Jino** → **Управление** → **Домены**
2. Найдите `asitdaily.ru`
3. Нажмите **Настройки**
4. **Интерпретатор**: Выберите **Node.js** (версия 18 или выше)
5. **Основная директория**: `/domains/asitdaily.ru`
6. **Папка для статики**: `public_html`
7. **Сохраните** изменения

### 6.2 Создайте файл tmp/restart.txt

Passenger использует этот файл для перезапуска приложения:

```bash
mkdir -p /domains/asitdaily.ru/tmp
touch /domains/asitdaily.ru/tmp/restart.txt
```

### 6.3 Перезапустите приложение

```bash
# Обновите timestamp файла restart.txt
touch /domains/asitdaily.ru/tmp/restart.txt

# Подождите 5-10 секунд, Passenger перезапустит приложение
```

---

## 🧪 Шаг 7: Тестирование (5 мин)

### 7.1 Проверка Frontend

Откройте в браузере:
```
https://asitdaily.ru
```

Должна открыться страница приложения с формой входа/регистрации.

### 7.2 Проверка API

```bash
# На локальном компьютере или на сервере
curl https://asitdaily.ru/health

# Ожидаемый ответ:
# {"status":"ok","database":"MySQL","message":"✅ Backend полностью работает!"}
```

### 7.3 Проверка логов

```bash
# Логи Passenger находятся в:
tail -f /domains/asitdaily.ru/logs/passenger.log

# Или проверьте логи через панель Jino
```

### 7.4 Полное тестирование

1. ✅ Откройте https://asitdaily.ru
2. ✅ Зарегистрируйтесь с реальным email
3. ✅ Проверьте получение кода на почту
4. ✅ Подтвердите email кодом
5. ✅ Войдите в систему
6. ✅ Начните терапию
7. ✅ Отметьте приём дозы
8. ✅ Проверьте историю и календарь
9. ✅ Экспортируйте PDF

---

## 🔄 Обновление приложения

### Обновление Backend

```bash
# 1. Обновите код
cd ~/asit-daily
git pull origin main

# 2. Пересоберите backend
cd backend
npm install --production
npm run build

# 3. Скопируйте в директорию домена
cp -r dist /domains/asitdaily.ru/backend/
cp -r node_modules /domains/asitdaily.ru/backend/
cp .env /domains/asitdaily.ru/backend/

# 4. Перезапустите Passenger
touch /domains/asitdaily.ru/tmp/restart.txt

# 5. Проверьте логи
tail -f /domains/asitdaily.ru/logs/passenger.log
```

### Обновление Frontend

```bash
# 1. Обновите код
cd ~/asit-daily
git pull origin main

# 2. Пересоберите frontend
npm install
npm run build

# 3. Скопируйте в public_html
rm -rf /domains/asitdaily.ru/public_html/*
cp -r dist/* /domains/asitdaily.ru/public_html/

# Обновление frontend не требует перезапуска backend
```

### Быстрый перезапуск приложения

```bash
# Просто обновите timestamp файла restart.txt
touch /domains/asitdaily.ru/tmp/restart.txt
```

---

## 📊 Мониторинг и логи

### Логи Passenger

```bash
# Основные логи
tail -f /domains/asitdaily.ru/logs/passenger.log

# Ошибки
tail -f /domains/asitdaily.ru/logs/passenger_error.log

# Последние 100 строк
tail -100 /domains/asitdaily.ru/logs/passenger.log
```

### Проверка процессов

```bash
# Passenger процессы
passenger-status

# Использование памяти
passenger-memory-stats
```

### Проверка работы

```bash
# Health check
curl https://asitdaily.ru/health

# Проверка MySQL
mysql -u asit_user -p asit_daily -e "SELECT COUNT(*) FROM users;"
```

---

## 🆘 Troubleshooting

### Приложение не запускается

**1. Проверьте логи Passenger:**
```bash
tail -50 /domains/asitdaily.ru/logs/passenger.log
```

**2. Проверьте app.js вручную:**
```bash
cd /domains/asitdaily.ru
node app.js
# Смотрите на ошибки в консоли
```

**3. Проверьте Node.js версию:**
```bash
node --version  # Должно быть >= 18
```

**4. Проверьте права доступа:**
```bash
ls -la /domains/asitdaily.ru/app.js
# Должно быть: -rwxr-xr-x (исполняемый)

chmod +x /domains/asitdaily.ru/app.js
```

### Ошибка "Cannot find module"

```bash
# Убедитесь, что node_modules скопированы
ls -la /domains/asitdaily.ru/backend/node_modules

# Если их нет, скопируйте:
cp -r ~/asit-daily/backend/node_modules /domains/asitdaily.ru/backend/
```

### MySQL connection error

```bash
# Проверьте .env файл
cat /domains/asitdaily.ru/backend/.env | grep DB_

# Проверьте подключение к MySQL
mysql -u asit_user -p -h localhost asit_daily
```

### Frontend показывает пустую страницу

**1. Проверьте консоль браузера (F12)**
   - Ищите ошибки CORS или сети

**2. Проверьте, что файлы на месте:**
```bash
ls -la /domains/asitdaily.ru/public_html/
# Должны быть: index.html, assets/, и т.д.
```

**3. Проверьте API URL:**
```bash
grep VITE_API_URL ~/asit-daily/.env.production
# Должно быть: VITE_API_URL=https://asitdaily.ru/api
```

### Email не отправляется

```bash
# Проверьте настройки EMAIL в .env
grep EMAIL /domains/asitdaily.ru/backend/.env

# Проверьте SMTP доступ в панели Jino
# "Разрешить доступ к SMTP" должно быть включено
```

### Приложение "зависает" или медленно работает

```bash
# Проверьте использование памяти
passenger-memory-stats

# Проверьте логи на ошибки
tail -100 /domains/asitdaily.ru/logs/passenger.log | grep -i error
```

### 502 Bad Gateway

```bash
# 1. Перезапустите приложение
touch /domains/asitdaily.ru/tmp/restart.txt

# 2. Проверьте, что app.js работает
cd /domains/asitdaily.ru
node app.js

# 3. Проверьте логи
tail -50 /domains/asitdaily.ru/logs/passenger_error.log
```

---

## 🔒 Безопасность

### 1. SSH ключи (рекомендуется)

Следуйте [инструкции Jino](https://jino.ru/spravka/hosting/remote-access.html#ssh-with-key) для настройки SSH ключей.

### 2. Ограничение SSH по IP

В панели Jino → **Управление** → **SSH-подключение**:
- Разрешите доступ только с вашего IP

### 3. Безопасные пароли

- **MySQL**: минимум 16 символов
- **Email**: минимум 16 символов
- **JWT_SECRET**: 64 символа (сгенерированный)

### 4. Защита .env файла

```bash
# Убедитесь, что .env не читается другими
chmod 600 /domains/asitdaily.ru/backend/.env
```

### 5. Регулярные обновления

```bash
# Проверка уязвимостей
cd ~/asit-daily/backend
npm audit

# Обновление пакетов
npm update
npm audit fix
```

### 6. Резервное копирование

**Автоматический backup MySQL в панели Jino:**
1. Панель Jino → **Базы данных** → **MySQL**
2. Выберите базу `asit_daily`
3. Настройте автоматическое резервное копирование

**Ручной backup:**
```bash
# Создайте директорию для бэкапов
mkdir -p ~/backups

# Backup базы данных
mysqldump -u asit_user -p asit_daily > ~/backups/asit_daily_$(date +%Y%m%d).sql

# Backup кода приложения
tar -czf ~/backups/asit_app_$(date +%Y%m%d).tar.gz /domains/asitdaily.ru/
```

---

## 📁 Итоговая структура файлов

```
/home/roller25/
├── asit-daily/              ← Исходный код (для обновлений)
│   ├── backend/
│   │   ├── src/
│   │   ├── dist/
│   │   └── package.json
│   ├── src/
│   ├── dist/
│   └── package.json
└── backups/                 ← Резервные копии

/domains/asitdaily.ru/
├── app.js                   ← Точка входа Passenger ⭐
├── backend/                 ← Production backend
│   ├── dist/                ← Скомпилированный код
│   ├── node_modules/
│   ├── package.json
│   └── .env                 ← Конфигурация (секреты)
├── public_html/             ← Frontend статика
│   ├── index.html
│   ├── assets/
│   └── ...
├── tmp/
│   └── restart.txt          ← Для перезапуска Passenger
└── logs/
    ├── passenger.log        ← Логи приложения
    └── passenger_error.log  ← Логи ошибок
```

---

## 💰 Стоимость

| Компонент | Jino Passenger | Railway+Vercel |
|-----------|----------------|----------------|
| Frontend | ✅ Включено | $0 (Vercel) |
| Backend | ✅ Включено | $5/мес |
| MySQL | ✅ Включено | +$5/мес |
| SMTP | ✅ Включено | Сторонний сервис |
| SSL | ✅ Let's Encrypt | ✅ Включено |
| **ИТОГО** | **$0 дополнительно** | **$10/мес** |

**Экономия: $120/год!** 💰

---

## 🎯 Преимущества Jino Passenger

### Плюсы ✅
- 💰 **$0 дополнительных затрат**
- ✅ Всё в одном месте
- ✅ MySQL на localhost (быстрее)
- ✅ Автоматический restart при падении
- ✅ Управление через панель Jino
- ✅ SSL из коробки

### Минусы ⚠️
- ⚠️ Нет автоматического деплоя из GitHub
- ⚠️ Ручное обновление (SSH + git pull)
- ⚠️ Shared хостинг (ограничения по ресурсам)
- ⚠️ Passenger может быть медленнее на старте

---

## 🚀 Когда переходить на Railway

Рекомендуется переход если:
- 🔥 **Высокая нагрузка** (200+ пользователей онлайн)
- 🔥 **Нужен CI/CD** (автоматический деплой)
- 🔥 **Нужно масштабирование**
- 🔥 **Профессиональный мониторинг**

Для начала и средней нагрузки **Jino Passenger более чем достаточно!** ✅

---

## ✅ Чек-лист деплоя

- [ ] SSH подключение работает (`ssh roller25@asitdaily.ru`)
- [ ] Node.js доступен (v18+)
- [ ] MySQL база `asit_daily` создана и доступна
- [ ] Проект склонирован в `~/asit-daily`
- [ ] Backend собран (`npm run build`)
- [ ] Backend .env создан с правильными данными
- [ ] Backend скопирован в `/domains/asitdaily.ru/backend/`
- [ ] Frontend собран (`npm run build`)
- [ ] Frontend скопирован в `/domains/asitdaily.ru/public_html/`
- [ ] `app.js` создан в `/domains/asitdaily.ru/`
- [ ] Интерпретатор Node.js выбран в панели Jino
- [ ] `tmp/restart.txt` создан
- [ ] https://asitdaily.ru открывается
- [ ] API отвечает на `/health`
- [ ] Регистрация работает
- [ ] Email с кодом приходит
- [ ] Все функции протестированы

---

## 📞 Поддержка

- **Документация Jino**: https://jino.ru/spravka/
- **SSH доступ**: https://jino.ru/spravka/hosting/remote-access.html#ssh-with-key
- **Node.js на Jino**: https://jino.ru/spravka/hosting/interpreters.html
- **Техподдержка Jino**: https://jino.ru/support/

---

**Готово! Деплой на ваш Jino хостинг займёт 30-40 минут!** 🎉

**Ваши данные:**
- SSH: `ssh roller25@asitdaily.ru`
- Сайт: `https://asitdaily.ru`
- Директория: `/domains/asitdaily.ru`

**Начните прямо сейчас!** 🚀
