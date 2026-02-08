#!/bin/bash

# 🚀 Быстрый деплой АСИТ Дейли на Jino.ru
# Выполните этот скрипт после подключения по SSH

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║     🚀 АСИТ ДЕЙЛИ - Деплой на Jino.ru 🚀           ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Шаг 1: Проверка окружения...${NC}"
echo ""

# Проверка Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js не найден!${NC}"
    exit 1
fi

# Проверка npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm не найден!${NC}"
    exit 1
fi

# Проверка MySQL
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✅ MySQL доступен${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL не найден в PATH, но может быть доступен${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Шаг 2: Клонирование проекта...${NC}"
echo ""

cd ~

if [ -d "asit-daily" ]; then
    echo -e "${YELLOW}⚠️  Директория asit-daily уже существует${NC}"
    read -p "Удалить и клонировать заново? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf asit-daily
        git clone https://github.com/ваш-username/asit-daily.git
    fi
else
    git clone https://github.com/ваш-username/asit-daily.git
fi

cd asit-daily

echo ""
echo -e "${YELLOW}📦 Шаг 3: Backend - установка зависимостей...${NC}"
echo ""

cd backend
npm install --production

echo ""
echo -e "${YELLOW}📦 Шаг 4: Backend - создание .env файла...${NC}"
echo ""

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Файл .env не найден!${NC}"
    echo -e "${YELLOW}Создайте файл .env вручную с настройками:${NC}"
    echo "  DB_HOST=localhost"
    echo "  DB_NAME=asit_daily"
    echo "  DB_USER=asit_user"
    echo "  DB_PASSWORD=ваш_пароль"
    echo "  JWT_SECRET=..."
    echo "  EMAIL_..."
    exit 1
else
    echo -e "${GREEN}✅ Файл .env найден${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Шаг 5: Backend - сборка...${NC}"
echo ""

npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Сборка не удалась! Директория dist не создана.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend собран${NC}"

echo ""
echo -e "${YELLOW}📦 Шаг 6: Backend - копирование в /domains/asitdaily.ru/...${NC}"
echo ""

mkdir -p /domains/asitdaily.ru/backend
cp -r dist /domains/asitdaily.ru/backend/
cp -r node_modules /domains/asitdaily.ru/backend/
cp package.json /domains/asitdaily.ru/backend/
cp .env /domains/asitdaily.ru/backend/

echo -e "${GREEN}✅ Backend скопирован${NC}"

echo ""
echo -e "${YELLOW}📦 Шаг 7: Frontend - установка зависимостей и сборка...${NC}"
echo ""

cd ~/asit-daily
npm install
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Сборка frontend не удалась!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend собран${NC}"

echo ""
echo -e "${YELLOW}📦 Шаг 8: Frontend - копирование в public_html...${NC}"
echo ""

rm -rf /domains/asitdaily.ru/public_html/*
cp -r dist/* /domains/asitdaily.ru/public_html/

echo -e "${GREEN}✅ Frontend скопирован${NC}"

echo ""
echo -e "${YELLOW}📦 Шаг 9: Создание app.js для Passenger...${NC}"
echo ""

cat > /domains/asitdaily.ru/app.js << 'APPJS'
#!/usr/bin/env node
const path = require('path');
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const backendPath = path.join(__dirname, 'backend', 'dist', 'index.js');
console.log('🚀 Starting АСИТ Дейли backend...');
console.log('📂 Backend path:', backendPath);
try {
  require(backendPath);
  console.log('✅ Backend started');
} catch (error) {
  console.error('❌ Failed to start:', error);
  throw error;
}
APPJS

chmod +x /domains/asitdaily.ru/app.js

echo -e "${GREEN}✅ app.js создан${NC}"

echo ""
echo -e "${YELLOW}📦 Шаг 10: Настройка Passenger...${NC}"
echo ""

mkdir -p /domains/asitdaily.ru/tmp
touch /domains/asitdaily.ru/tmp/restart.txt

echo -e "${GREEN}✅ Passenger настроен${NC}"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║               🎉 Деплой завершён! 🎉                ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo ""
echo "1. В панели Jino выберите интерпретатор Node.js для asitdaily.ru"
echo "2. Подождите 30 секунд для запуска Passenger"
echo "3. Откройте https://asitdaily.ru"
echo "4. Проверьте: curl https://asitdaily.ru/health"
echo ""
echo -e "${YELLOW}📊 Логи:${NC}"
echo "  tail -f /domains/asitdaily.ru/logs/passenger.log"
echo ""
echo -e "${YELLOW}🔄 Перезапуск:${NC}"
echo "  touch /domains/asitdaily.ru/tmp/restart.txt"
echo ""
echo -e "${GREEN}Готово! Удачи! 🚀${NC}"
