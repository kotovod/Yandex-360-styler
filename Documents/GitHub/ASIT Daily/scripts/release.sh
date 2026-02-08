#!/bin/bash

# Скрипт для создания нового релиза
# Использование: ./scripts/release.sh [patch|minor|major]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ -z "$1" ]; then
  echo -e "${RED}❌ Ошибка: Укажите тип релиза (patch|minor|major)${NC}"
  echo -e "${YELLOW}Использование: ./scripts/release.sh [patch|minor|major]${NC}"
  exit 1
fi

RELEASE_TYPE=$1

# Проверка на незакоммиченные изменения
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}❌ Есть незакоммиченные изменения!${NC}"
  echo -e "${YELLOW}Закоммитьте или отмените изменения перед релизом.${NC}"
  git status -s
  exit 1
fi

echo -e "${BLUE}🚀 Начинаем релиз: $RELEASE_TYPE${NC}"
echo ""

# Обновление версии в корневом package.json
echo -e "${YELLOW}📦 Обновление версии в package.json...${NC}"
cd "$(dirname "$0")/.."
npm version $RELEASE_TYPE --no-git-tag-version

# Получение новой версии
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Новая версия: v$NEW_VERSION${NC}"
echo ""

# Обновление версии в backend
echo -e "${YELLOW}📦 Обновление версии backend...${NC}"
cd backend
npm version $RELEASE_TYPE --no-git-tag-version
cd ..

echo ""
echo -e "${YELLOW}📝 Не забудьте обновить CHANGELOG.md!${NC}"
echo -e "${BLUE}Откройте CHANGELOG.md и добавьте описание изменений для v$NEW_VERSION${NC}"
echo ""
read -p "Нажмите Enter после обновления CHANGELOG.md..."

# Git операции
echo -e "${YELLOW}📤 Создание git commit и тега...${NC}"
git add package.json backend/package.json CHANGELOG.md
git commit -m "chore: release v$NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo ""
echo -e "${GREEN}✅ Релиз v$NEW_VERSION создан!${NC}"
echo ""
echo -e "${YELLOW}Следующие шаги:${NC}"
echo -e "1. Проверьте изменения: ${BLUE}git log -1${NC}"
echo -e "2. Отправьте в GitHub: ${BLUE}git push origin main --tags${NC}"
echo -e "3. Vercel и Railway автоматически задеплоят новую версию"
echo ""
echo -e "${GREEN}🎉 Готово!${NC}"
