# 🚀 Быстрый деплой на Jino.ru

## Одна команда для деплоя

```bash
cd "/Users/kotovod/Documents/GitHub/ASIT Daily"
./auto_deploy_jino.sh
```

## Что нужно сделать после деплоя

### 1. Создать .env на сервере

```bash
ssh roller25@asitdaily.ru
cd /domains/asitdaily.ru/backend
nano .env
```

Скопируйте содержимое из **SECRETS.md** (откройте `open SECRETS.md`)

Замените только:
- `DB_PASSWORD` - ваш пароль от MySQL
- `EMAIL_PASSWORD` - пароль от noreply@asitdaily.ru

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 2. Выбрать интерпретатор в панели Jino

1. Откройте: https://jino.ru/panel
2. Управление → Домены → asitdaily.ru → Настройки
3. Интерпретатор: **Node.js**
4. Сохраните

### 3. Перезапустить приложение

```bash
touch /domains/asitdaily.ru/tmp/restart.txt
```

### 4. Проверить работу

```bash
curl https://asitdaily.ru/health
```

Откройте в браузере: https://asitdaily.ru

---

## Файлы

- `auto_deploy_jino.sh` - Скрипт автоматического деплоя
- `SECRETS.md` - Секретные ключи (уже сгенерированы!)
- `DEPLOY_JINO_SSH.md` - Полная документация

---

## Проблемы?

**Логи на сервере:**
```bash
ssh roller25@asitdaily.ru
tail -f /domains/asitdaily.ru/logs/passenger.log
```

**Полная документация:** `DEPLOY_JINO_SSH.md`
