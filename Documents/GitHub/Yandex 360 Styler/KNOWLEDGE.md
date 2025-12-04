# Яндекс 360 ✽ Стилёк — База знаний проекта

## Структура проекта

```
Yandex 360 Styler/
├── manifest.json      # Конфигурация расширения (Manifest v3)
├── content.js         # Основной скрипт (инъекция стилей)
├── popup.html         # Интерфейс настроек
├── popup.js           # Логика popup
├── styles.css         # Базовые CSS стили
├── icons/             # Иконки расширения
└── themes/            # Изображения для готовых тем
    ├── labubu.png
    └── nusha.png
```

## Ключевые компоненты

### content.js

#### Функция `getCurrentService()`
Определяет текущий сервис по hostname:
- `mail.yandex` → `mail`
- `disk.yandex` → `disk`
- `calendar.yandex` → `calendar`
- и т.д.

#### Объект `serviceSelectors`
Содержит CSS селекторы для каждого сервиса:
- `logoContainer` — контейнеры логотипа (для SVG замены)
- `logoSvg` — SVG элементы логотипа
- `logo` — IMG элементы логотипа (legacy)
- `buttons` — кнопки действия
- `pageBackground` — фон страницы
- `globalBar` — панель навигации
- `menu` — боковое меню

#### Функция `replaceLogo()`
Замена логотипа с поддержкой SVG:
1. **Способ 1**: Поиск контейнера логотипа → скрытие SVG → вставка IMG
2. **Способ 2**: Прямая замена SVG
3. **Способ 3**: Замена существующего IMG (legacy)
4. **Способ 4**: Fallback поиск по позиции (`findLogoByPosition()`)

#### Функция `isInsideEmailContent()`
Проверяет, находится ли элемент внутри тела письма:
- Классы: `MessageBody`, `Letter`, `mail-Message`, `ComposePopup`
- Теги: `iframe`
- Хешированные классы в `td` (типично для email)

#### Массив `logoOnlyServices`
Сервисы где применяется ТОЛЬКО логотип (без покраски):
```javascript
['admin', 'yandex', 'alicepro', 'send']
```

### popup.js

#### Готовые темы
```javascript
const themes = {
    labubu: {
        name: 'Лабубу',
        logo: 'themes/labubu.png',
        buttonColor: '#FE98A7',
        pageBgColor: '#FFE7DD',
        // ...
    },
    nusha: { ... }
}
```

## Известные проблемы и решения

### 1. SVG логотипы вместо IMG
**Проблема**: Яндекс перешёл на SVG для логотипов.  
**Решение**: Добавлены `logoContainer` и `logoSvg` селекторы. Функция `replaceLogo` скрывает SVG и вставляет IMG.

### 2. Логотип появляется в письмах
**Проблема**: Замена срабатывала на изображения внутри писем.  
**Решение**: Функция `isInsideEmailContent()` проверяет родительские элементы.

### 3. className.toLowerCase() ошибка
**Проблема**: SVG элементы имеют `SVGAnimatedString` вместо строки.  
**Решение**: 
```javascript
const classNameRaw = el.className?.baseVal || el.className || '';
const className = typeof classNameRaw === 'string' ? classNameRaw : '';
```

### 4. Конфликт селекторов с :not()
**Проблема**: `[class*="PageLayout"]:not([class*="Layout"])` не работает.  
**Решение**: Убраны конфликтующие исключения (Layout, Calendar и т.д.).

### 5. isInsideEmailContent блокирует логотип
**Проблема**: Селектор `[class*="compose"]` матчил класс `feature-web-compose-sticky-header` на странице и блокировал замену логотипа.  
**Решение**: Заменены широкие селекторы на специфичные:
```javascript
// Было (слишком широко):
'[class*="compose"]', '[class*="Letter"]', '[class*="MessageBody"]'

// Стало (специфично):
'.ComposePopup', '.ComposerContainer', '.MessageBody', '.mail-Message-Body'
```

### 5. Два логотипа на странице
**Проблема**: IMG добавлялся дважды.  
**Решение**: Скрытие существующих IMG перед добавлением нового:
```javascript
const existingImgs = container.querySelectorAll('img:not(.yamail-custom-logo)');
existingImgs.forEach(img => img.style.display = 'none');
```

## CSS классы расширения

- `.yamail-custom-logo` — кастомный логотип
- `.yamail-retina-logo` — Retina оптимизация
- `.yamail-logo-replaced` — контейнер с заменённым логотипом
- `.yamail-svg-replaced` — скрытый SVG

## Style элементы

- `#yamail-custom-styles` — основные стили (кнопки)
- `#yamail-pagebg-styles` — фон страницы

## API хранилища

```javascript
chrome.storage.local.get([
    'logo',           // Base64 или путь к логотипу
    'logoWidth',      // Ширина (px)
    'logoHeight',     // Высота (px)
    'logoLeft',       // Смещение слева (px)
    'logoTop',        // Смещение сверху (px)
    'buttonColor',    // Цвет кнопок (#HEX)
    'pageBgColor',    // Цвет фона (#HEX)
    'globalBarColor', // Цвет панели (не используется)
    'hideBlocks',     // Скрытие блоков (boolean)
    'selectedTheme'   // Выбранная тема (string)
]);
```

## MutationObserver

Отслеживает динамическую загрузку элементов:
- Новые логотипы → `replaceLogo()`
- Новые кнопки → применение стилей
- Новые элементы фона → применение цвета

## Отладка

Консольная команда для диагностики логотипа:
```javascript
window.debugYamailLogo()
```

## Селекторы Яндекса (актуальные)

### Логотип
- `div[class*="Logo360"]` — контейнер
- `svg[class*="Logo360Icon"]` — SVG иконка
- `a[class*="OrbLogo"]` — ссылка логотипа
- `[class*="OrbLogoContainer"]` — внешний контейнер

### Навигация
- `[class*="GlobalBarControl"]` — кнопки сервисов
- `[class*="GlobalBarControlBackground"]` — фон при hover

### Страница
- `[class*="PageLayout"]` — основной контейнер
- `#app` — корневой элемент приложения

