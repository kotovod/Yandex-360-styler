# 🗄️ Управление базой данных

## 📊 3 способа управления пользователями

### Способ 1: Команды npm (Рекомендуется) ⭐

```bash
cd backend

# Показать всех пользователей
npm run users:list

# Удалить конкретного пользователя
npm run users:delete email@example.com

# Удалить ВСЕХ пользователей
npm run users:clear
```

---

### Способ 2: DB Browser for SQLite (GUI)

**Установлен!** ✅ Находится в `/Applications/DB Browser for SQLite.app`

**Как использовать:**

1. Откройте **DB Browser for SQLite**
2. **File → Open Database**
3. Выберите: `backend/data/asit_daily.db`
4. Вкладка **"Browse Data"**:
   - Таблица `users` - пользователи
   - Таблица `therapy_sessions` - терапии
   - Таблица `doses` - приёмы препарата
   - Таблица `verification_codes` - коды подтверждения
5. **Правый клик → Delete record** - удалить
6. **Write Changes** - сохранить

---

### Способ 3: Прямые SQL команды

```bash
# Показать всех пользователей
sqlite3 backend/data/asit_daily.db "SELECT email, name, email_verified FROM users;"

# Удалить пользователя
sqlite3 backend/data/asit_daily.db "DELETE FROM users WHERE email='test@example.com';"

# Удалить всех
sqlite3 backend/data/asit_daily.db "DELETE FROM users;"

# Показать все таблицы
sqlite3 backend/data/asit_daily.db ".tables"

# Показать схему таблицы
sqlite3 backend/data/asit_daily.db ".schema users"
```

---

## 🧹 Полная очистка базы (для разработки)

Самый простой способ - удалить файл базы:

```bash
# Остановите backend (Ctrl+C)

# Удалите базу
rm backend/data/asit_daily.db

# Запустите backend - база пересоздастся
cd backend
npm run dev
```

---

## 📋 Структура базы данных

### Таблица `users`
- `id` - UUID пользователя
- `email` - Email (уникальный)
- `password_hash` - Хеш пароля
- `name` - Имя пользователя
- `email_verified` - Подтверждён ли email (0/1)
- `created_at` - Дата создания

### Таблица `therapy_sessions`
- `id` - UUID сессии
- `user_id` - ID пользователя
- `start_date` - Дата начала терапии
- `maintenance_dose` - Поддерживающая доза (2-4)
- `reminder_time` - Время напоминания

### Таблица `doses`
- `id` - UUID записи
- `therapy_session_id` - ID сессии
- `date` - Дата приёма
- `taken` - Принято (true/false)
- `dose_count` - Количество нажатий
- `concentration` - Концентрация (10 ИР/мл или 300 ИР/мл)
- `notes` - Заметки

### Таблица `verification_codes`
- `id` - UUID кода
- `email` - Email пользователя
- `code` - 6-значный код
- `type` - Тип ('email_verification' или 'password_reset')
- `expires_at` - Время истечения
- `used` - Использован ли код

---

## 💡 Частые задачи

### Зарегистрироваться с уже использованным email

```bash
# 1. Удалите старого пользователя
npm run users:delete your@email.com

# 2. Очистите localStorage в браузере
# Консоль браузера: localStorage.clear()

# 3. Зарегистрируйтесь заново
```

### Посмотреть неподтверждённых пользователей

```bash
sqlite3 backend/data/asit_daily.db \
  "SELECT email, name FROM users WHERE email_verified = 0;"
```

### Вручную подтвердить email

```bash
sqlite3 backend/data/asit_daily.db \
  "UPDATE users SET email_verified = 1 WHERE email='user@example.com';"
```

### Посмотреть коды подтверждения

```bash
sqlite3 backend/data/asit_daily.db \
  "SELECT email, code, type, expires_at, used FROM verification_codes ORDER BY created_at DESC LIMIT 10;"
```

---

## 🔒 На production

На production сервере:
- **НЕ** удаляйте базу!
- Используйте MySQL/PostgreSQL вместо SQLite
- Делайте бэкапы перед изменениями
- Используйте миграции для изменения схемы

---

## 📦 Бэкап базы

```bash
# Создать копию
cp backend/data/asit_daily.db backend/data/asit_daily.db.backup

# Восстановить из копии
cp backend/data/asit_daily.db.backup backend/data/asit_daily.db
```

---

## ✅ Готово!

Теперь у вас есть полный контроль над базой данных! 🎉
