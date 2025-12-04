// Content script для применения кастомизации Яндекс 360 ✽ Стилёк

(function() {
    'use strict';

    let appliedSettings = {};

    // Функция диагностики для поиска логотипа (можно вызвать из консоли: window.debugYamailLogo())
    window.debugYamailLogo = function() {
        console.log('=== Диагностика поиска логотипа ===');
        const allImages = document.querySelectorAll('img');
        console.log('Всего img на странице:', allImages.length);
        
        allImages.forEach((img, i) => {
            const rect = img.getBoundingClientRect();
            if (rect.top < 150 && rect.left < 300 && rect.width > 10 && rect.height > 10) {
                console.log(`[${i}] Потенциальный логотип:`, {
                    element: img,
                    src: img.src?.substring(0, 100),
                    alt: img.alt,
                    class: img.className,
                    parentClass: img.parentElement?.className?.substring(0, 100),
                    size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
                    position: `top:${Math.round(rect.top)}, left:${Math.round(rect.left)}`,
                    hasCustomClass: img.classList.contains('yamail-custom-logo')
                });
            }
        });
        console.log('=== Конец диагностики ===');
    };

    // Функция для определения текущего домена/сервиса
    function getCurrentService() {
        const hostname = window.location.hostname;
        
        // Поддержка обычных и корпоративных (-team) доменов
        if (hostname.includes('mail.yandex') || hostname.includes('mail.ya.ru')) {
            return 'mail';
        } else if (hostname.includes('disk.yandex') || hostname.includes('disk.ya.ru')) {
            return 'disk';
        } else if (hostname.includes('docs.yandex') || hostname.includes('docs.ya.ru')) {
            return 'docs';
        } else if (hostname.includes('calendar.yandex') || hostname.includes('calendar.ya.ru')) {
            return 'calendar';
        } else if (hostname.includes('telemost.yandex') || hostname.includes('telemost.ya.ru')) {
            return 'telemost';
        } else if (hostname.includes('admin.yandex') || hostname.includes('admin.ya.ru')) {
            return 'admin';
        } else if (hostname.includes('boards.yandex') || hostname.includes('boards.ya.ru')) {
            return 'boards';
        } else if (hostname.includes('send.yandex') || hostname.includes('send.ya.ru')) {
            return 'send';
        } else if (hostname.includes('alicepro.yandex') || hostname.includes('alicepro.ya.ru')) {
            return 'alicepro';
        } else if (hostname === 'yandex.ru' || hostname === 'www.yandex.ru' || hostname.includes('ya.ru')) {
            return 'yandex';
        }
        
        return 'mail'; // По умолчанию
    }

    // Селекторы для разных сервисов Яндекс 360
    const serviceSelectors = {
        mail: {
            // Контейнеры логотипа (для замены содержимого на img)
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]',
                '[class*="Logo360_"]'
            ],
            // SVG логотипы (для скрытия/замены)
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg',
                '[class*="OrbLogo"] svg'
            ],
            // Старые img селекторы (для обратной совместимости)
            logo: [
                'img[alt*="Яндекс 360"]',
                'img[alt*="Yandex 360"]',
                'img[alt*="360"]',
                'a[href*="360.yandex"] img',
                'div[class*="Logo360"] img',
                'img[class*="Logo360"]'
            ],
            buttons: [
                '.Button2_view_action:not(.SyncButton-m__withGlobalBar--apeEJ)',
                'button[class*="Button2_view_action"]',
                'button[class*="action"]',
                '.Button2[class*="action"]'
            ],
            pageBackground: [
                'div[data-testid="page-layout_container"]',
                '.PageLayout-m__root--1xJ2D',
                '.PageLayout-m__pageLayoutContainerWithGlobalBar--KTsK5',
                '#js-mail-layout',
                '[class*="PageLayout"]',
                'body > div:first-child'
            ],
            globalBar: [
                // Только фон внутри кнопки продукта
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                'nav.Aside-m__root--mgtLJ',
                'nav[class*="Aside-m__root"]',
                'nav[data-testid="left-column"]',
                '.qa-LayoutAside',
                '[class*="Aside"]',
                'nav[class*="Sidebar"]'
            ]
        },
        disk: {
            // Контейнеры логотипа (для замены содержимого на img)
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            // SVG логотипы (для скрытия/замены)
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            // Старые img селекторы (для обратной совместимости)
            logo: [
                'img[alt*="Яндекс"]',
                'a[href*="yandex"] img',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                'button[class*="Button2_view_action"]',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                '[class*="Root"]',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="sidebar"]',
                '[class*="Navigation"]',
                '[class*="navigation"]',
                'aside',
                'nav'
            ]
        },
        docs: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                '[class*="Editor"]',
                '[class*="Document"]',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        calendar: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        telemost: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                '[class*="Room"]',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        admin: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                '[class*="Admin"]',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        boards: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                '[class*="Board"]',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        send: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                '[class*="Send"]',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        alicepro: {
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]',
                '[class*="Logo"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'svg[class*="Logo"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg',
                '[class*="Logo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                'img[alt*="Алиса"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        },
        yandex: {
            // Яндекс Мессенджер и другие сервисы на yandex.ru
            logoContainer: [
                'div[class*="Logo360"]',
                'a[class*="OrbLogo"]',
                '[class*="OrbLogoContainer"]'
            ],
            logoSvg: [
                'svg[class*="Logo360Icon"]',
                'div[class*="Logo360"] svg',
                'a[class*="OrbLogo"] svg'
            ],
            logo: [
                'img[alt*="Яндекс"]',
                '[class*="Logo"] img'
            ],
            buttons: [
                '.Button2_view_action',
                '[class*="PrimaryButton"]',
                'button[class*="action"]'
            ],
            pageBackground: [
                'body',
                '#app',
                'main'
            ],
            globalBar: [
                'div[class*="GlobalBarControlBackground"]'
            ],
            menu: [
                '[class*="Sidebar"]',
                '[class*="Navigation"]',
                'aside',
                'nav'
            ]
        }
    };

    // Функция для проверки, находится ли элемент внутри контента письма
    function isInsideEmailContent(element) {
        // Проверяем, не находится ли элемент внутри тела письма
        // ВАЖНО: селекторы должны быть специфичными, чтобы не блокировать логотип!
        const emailContentSelectors = [
            '.MessageBody',
            '.mail-Message-Body',
            '.mail-Message-Content',
            '[data-testid="message-body"]',
            '[data-testid="letter-body"]',
            '.ComposePopup',
            '.ComposerContainer',
            'iframe'
        ];
        
        for (const selector of emailContentSelectors) {
            if (element.closest(selector)) {
                return true;
            }
        }
        
        // Дополнительная проверка: если элемент внутри td с хешированным классом (типично для email)
        const parentTd = element.closest('td');
        if (parentTd && parentTd.className && /^[a-f0-9]{16,}/.test(parentTd.className)) {
            return true;
        }
        
        return false;
    }

    // Функция для применения стилей к найденному логотипу
    function applyLogoStyles(logoImg, logoDataUrl, width, height, left, top) {
                    // Если это путь к файлу темы, загружаем его
                    if (logoDataUrl.startsWith('themes/')) {
                        const browserAPI = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);
                        if (browserAPI && browserAPI.runtime) {
                            const themeUrl = browserAPI.runtime.getURL(logoDataUrl);
                            logoImg.src = themeUrl;
                        } else {
                            console.error('API браузера недоступен для загрузки темы');
                return false;
                        }
                    } else {
                        logoImg.src = logoDataUrl;
                    }
                    
                    // Применяем размеры с учетом Retina дисплеев
                    logoImg.style.width = width + 'px';
                    logoImg.style.height = height + 'px';
                    logoImg.style.maxWidth = 'none';
                    logoImg.style.maxHeight = 'none';
                    
                    // Настройки для Retina дисплеев
                    logoImg.style.imageRendering = 'high-quality';
                    logoImg.style.imageRendering = '-webkit-optimize-contrast';
                    logoImg.style.imageRendering = 'crisp-edges';
                    
                    // Применяем позиционирование
                    logoImg.style.position = 'relative';
                    logoImg.style.left = left + 'px';
                    logoImg.style.top = top + 'px';
                    
                    // Убираем тени
                    logoImg.style.boxShadow = 'none';
                    
                    // Добавляем классы для дополнительных стилей и отслеживания
                    logoImg.classList.add('yamail-retina-logo', 'yamail-custom-logo');
                    
        return true;
    }

    // Функция для поиска логотипа по позиции (fallback) - ищет и IMG и SVG
    function findLogoByPosition() {
        // Ищем и img и svg
        const allElements = [...document.querySelectorAll('img'), ...document.querySelectorAll('svg')];
        let bestCandidate = null;
        let bestScore = 0;
        
        for (const el of allElements) {
            if (el.classList.contains('yamail-custom-logo')) continue;
            if (el.classList.contains('yamail-svg-replaced')) continue;
            // Пропускаем элементы внутри контента писем
            if (isInsideEmailContent(el)) continue;
            
            const rect = el.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10) continue;
            if (rect.top < 0 || rect.top > 150) continue; // Только верхняя часть страницы
            if (rect.left < 0 || rect.left > 300) continue; // Только левая часть
            
            let score = 0;
            
            // Бонусы за позицию в левом верхнем углу
            if (rect.top >= 0 && rect.top < 100) score += 10;
            if (rect.top >= 0 && rect.top < 60) score += 5;
            if (rect.left >= 0 && rect.left < 100) score += 10;
            if (rect.left >= 0 && rect.left < 50) score += 5;
            
            // Бонусы за размер, похожий на логотип
            if (rect.width >= 20 && rect.width <= 100) score += 5;
            if (rect.height >= 20 && rect.height <= 100) score += 5;
            
            // Бонусы за родительские элементы
            const parent = el.closest('[class*="Logo"], [class*="Orb"], [class*="GlobalBar"]');
            if (parent) score += 20;
            
            // Бонусы за классы, указывающие на логотип
            const classNameRaw = el.className?.baseVal || el.className || '';
            const className = typeof classNameRaw === 'string' ? classNameRaw : '';
            const classNameLower = className.toLowerCase();
            const parentClassNameRaw = el.parentElement?.className?.baseVal || el.parentElement?.className || '';
            const parentClassName = (typeof parentClassNameRaw === 'string' ? parentClassNameRaw : '').toLowerCase();
            
            if (classNameLower.includes('logo') || classNameLower.includes('360')) score += 25;
            if (parentClassName.includes('logo') || parentClassName.includes('360')) score += 20;
            if (parentClassName.includes('orb')) score += 15;
            
            // Для img - дополнительные проверки
            if (el.tagName === 'IMG') {
                const alt = (el.alt || '').toLowerCase();
                const src = (el.src || '').toLowerCase();
                if (alt.includes('360') || alt.includes('яндекс') || alt.includes('yandex')) score += 20;
                if (src.includes('logo') || src.includes('360')) score += 10;
            }
            
            // Штрафы
            if (classNameLower.includes('avatar')) score -= 30;
            if (classNameLower.includes('icon') && !classNameLower.includes('logo')) score -= 5;
            if (classNameLower.includes('sync')) score -= 20;
            if (classNameLower.includes('folder')) score -= 20;
            
            if (score > bestScore && score > 15) {
                bestScore = score;
                bestCandidate = el;
            }
        }
        
        if (bestCandidate) {
            console.log('Найден логотип по позиции (score:', bestScore, '):', bestCandidate);
        }
        return bestCandidate;
    }

    // Функция для замены логотипа с поддержкой SVG и Retina дисплеев
    function replaceLogo(logoDataUrl, width = 100, height = 50, left = 0, top = 0) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        
        let logoFound = false;

        // Способ 1: Замена SVG логотипа (новая структура Яндекса)
        const logoContainerSelectors = selectors.logoContainer || [];
        const logoSvgSelectors = selectors.logoSvg || [];
        
        // Ищем контейнер логотипа
        for (const selector of logoContainerSelectors) {
            try {
                const containers = document.querySelectorAll(selector);
                containers.forEach(container => {
                    // Пропускаем элементы внутри контента писем
                    if (isInsideEmailContent(container)) return;
                    
                    if (container && !container.classList.contains('yamail-logo-replaced')) {
                        // Скрываем SVG внутри контейнера
                        const svgs = container.querySelectorAll('svg');
                        svgs.forEach(svg => {
                            svg.style.display = 'none';
                        });
                        
                        // Скрываем также существующие IMG (кроме наших кастомных)
                        const existingImgs = container.querySelectorAll('img:not(.yamail-custom-logo)');
                        existingImgs.forEach(img => {
                            img.style.display = 'none';
                        });
                        
                        // Проверяем, есть ли уже наш img
                        let customImg = container.querySelector('.yamail-custom-logo');
                        if (!customImg) {
                            // Создаем новый img элемент
                            customImg = document.createElement('img');
                            customImg.classList.add('yamail-custom-logo', 'yamail-retina-logo');
                            container.appendChild(customImg);
                        }
                        
                        // Применяем стили к img
                        customImg.src = logoDataUrl;
                        customImg.style.width = width + 'px';
                        customImg.style.height = height + 'px';
                        customImg.style.maxWidth = 'none';
                        customImg.style.maxHeight = 'none';
                        customImg.style.position = 'relative';
                        customImg.style.left = left + 'px';
                        customImg.style.top = top + 'px';
                        customImg.style.imageRendering = 'crisp-edges';
                        customImg.style.objectFit = 'contain';
                        
                        container.classList.add('yamail-logo-replaced');
                    logoFound = true;
                        console.log('Логотип заменен (SVG→IMG) в контейнере:', selector);
                    }
                });
            } catch (e) {
                console.warn('Ошибка селектора контейнера:', selector, e);
            }
        }

        // Способ 2: Прямая замена SVG (если контейнер не найден)
        if (!logoFound) {
            for (const selector of logoSvgSelectors) {
                try {
                    const svgs = document.querySelectorAll(selector);
                    svgs.forEach(svg => {
                        // Пропускаем элементы внутри контента писем
                        if (isInsideEmailContent(svg)) return;
                        
                        if (svg && !svg.classList.contains('yamail-svg-replaced')) {
                            const parent = svg.parentElement;
                            if (parent && !parent.querySelector('.yamail-custom-logo')) {
                                // Скрываем SVG
                                svg.style.display = 'none';
                                svg.classList.add('yamail-svg-replaced');
                                
                                // Скрываем также существующие IMG (кроме наших кастомных)
                                const existingImgs = parent.querySelectorAll('img:not(.yamail-custom-logo)');
                                existingImgs.forEach(img => {
                                    img.style.display = 'none';
                                });
                                
                                // Создаем img
                                const customImg = document.createElement('img');
                                customImg.classList.add('yamail-custom-logo', 'yamail-retina-logo');
                                customImg.src = logoDataUrl;
                                customImg.style.width = width + 'px';
                                customImg.style.height = height + 'px';
                                customImg.style.maxWidth = 'none';
                                customImg.style.maxHeight = 'none';
                                customImg.style.position = 'relative';
                                customImg.style.left = left + 'px';
                                customImg.style.top = top + 'px';
                                customImg.style.imageRendering = 'crisp-edges';
                                customImg.style.objectFit = 'contain';
                                
                                parent.appendChild(customImg);
                                logoFound = true;
                                console.log('Логотип заменен (SVG скрыт):', selector);
                            }
                        }
                    });
                } catch (e) {
                    console.warn('Ошибка селектора SVG:', selector, e);
                }
            }
        }

        // Способ 3: Старый метод для img элементов (обратная совместимость)
        if (!logoFound) {
            const logoSelectors = selectors.logo || [];
            logoSelectors.forEach(selector => {
                try {
                    const logoImgs = document.querySelectorAll(selector);
                    logoImgs.forEach(logoImg => {
                        // Пропускаем элементы внутри контента писем
                        if (isInsideEmailContent(logoImg)) return;
                        
                        if (logoImg && logoImg.tagName === 'IMG' && !logoImg.classList.contains('yamail-custom-logo')) {
                            if (applyLogoStyles(logoImg, logoDataUrl, width, height, left, top)) {
                                logoFound = true;
                                console.log('Логотип заменен (IMG):', selector);
                            }
                        }
                    });
                } catch (e) {
                    console.warn('Ошибка селектора IMG:', selector, e);
                }
            });
        }

        // Способ 4: Fallback - поиск по позиции
        if (!logoFound) {
            const logoByPosition = findLogoByPosition();
            if (logoByPosition) {
                if (logoByPosition.tagName === 'IMG') {
                    if (applyLogoStyles(logoByPosition, logoDataUrl, width, height, left, top)) {
                        logoFound = true;
                        console.log('Логотип заменен по позиции (IMG)');
                    }
                } else if (logoByPosition.tagName === 'SVG') {
                    const parent = logoByPosition.parentElement;
                    if (parent && !parent.querySelector('.yamail-custom-logo')) {
                        logoByPosition.style.display = 'none';
                        const customImg = document.createElement('img');
                        customImg.classList.add('yamail-custom-logo', 'yamail-retina-logo');
                        customImg.src = logoDataUrl;
                        customImg.style.width = width + 'px';
                        customImg.style.height = height + 'px';
                        customImg.style.position = 'relative';
                        customImg.style.left = left + 'px';
                        customImg.style.top = top + 'px';
                        parent.appendChild(customImg);
                        logoFound = true;
                        console.log('Логотип заменен по позиции (SVG→IMG)');
                    }
                }
            }
        }

        return logoFound;
    }

    // Функция для изменения цвета кнопок
    function changeButtonColor(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const buttonSelectors = selectors.buttons || [];
        
        // Создаем или обновляем CSS переменную
        let style = document.getElementById('yamail-custom-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'yamail-custom-styles';
            document.head.appendChild(style);
        }

        // Формируем CSS правила для всех селекторов кнопок
        const buttonCssRules = buttonSelectors.map(selector => {
            // Для Яндекс.Почты исключаем кнопку синхронизации
            if (currentService === 'mail') {
                return `${selector}:not(.SyncButton-m__withGlobalBar--apeEJ)::before { background-color: ${color} !important; }`;
            } else {
                return `${selector}::before { background-color: ${color} !important; }`;
            }
        }).join('\n            ');

        // Добавляем CSS для изменения переменной
        style.textContent = `
            :root {
                --button-view-action-fill-color-base: ${color} !important;
            }
            
            /* Селекторы для кнопок ${currentService} */
            ${buttonCssRules}
        `;
        
        console.log('Цвет кнопок изменен на:', color, 'для сервиса:', currentService);
        
        // Дополнительно применяем стили напрямую к найденным кнопкам
        applyButtonStylesDirectly(color);
    }

    // Функция для прямого применения стилей к кнопкам
    function applyButtonStylesDirectly(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const buttonSelectors = selectors.buttons || [];
        
        buttonSelectors.forEach(selector => {
            let querySelector = selector;
            // Для Яндекс.Почты исключаем кнопку синхронизации
            if (currentService === 'mail') {
                querySelector = selector.replace(':not(.SyncButton-m__withGlobalBar--apeEJ)', '');
                const buttons = document.querySelectorAll(querySelector);
                buttons.forEach(button => {
                    if (!button.classList.contains('SyncButton-m__withGlobalBar--apeEJ')) {
                        button.style.setProperty('--button-view-action-fill-color-base', color, 'important');
                    }
                });
            } else {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(button => {
                    // Применяем стили к псевдоэлементу через CSS переменную
                    button.style.setProperty('--button-view-action-fill-color-base', color, 'important');
                });
            }
        });

        console.log('Стили кнопок применены напрямую для сервиса:', currentService);
    }

    // Функция для изменения цвета текста кнопок
    function changeButtonTextColor(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const buttonSelectors = selectors.buttons || [];
        
        // Создаем или обновляем CSS переменную
        let style = document.getElementById('yamail-custom-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'yamail-custom-styles';
            document.head.appendChild(style);
        }

        // Формируем CSS правила для всех селекторов кнопок
        const existingStyles = style.textContent || '';
        const buttonCssRules = buttonSelectors.map(selector => {
            // Для Яндекс.Почты исключаем кнопку синхронизации
            if (currentService === 'mail') {
                return `${selector}:not(.SyncButton-m__withGlobalBar--apeEJ) { color: ${color} !important; }`;
            } else {
                return `${selector} { color: ${color} !important; }`;
            }
        }).join('\n            ');
        
        const buttonTextStyle = `
            /* Цвет текста кнопок для ${currentService} */
            ${buttonCssRules}
        `;

        // Обновляем стили, сохраняя существующие
        style.textContent = existingStyles + buttonTextStyle;
        
        console.log('Цвет текста кнопок изменен на:', color, 'для сервиса:', currentService);
        
        // Дополнительно применяем стили напрямую к найденным кнопкам
        applyButtonTextStylesDirectly(color);
    }

    // Функция для прямого применения стилей цвета текста к кнопкам
    function applyButtonTextStylesDirectly(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const buttonSelectors = selectors.buttons || [];
        
        buttonSelectors.forEach(selector => {
            let querySelector = selector;
            // Для Яндекс.Почты исключаем кнопку синхронизации
            if (currentService === 'mail') {
                querySelector = selector.replace(':not(.SyncButton-m__withGlobalBar--apeEJ)', '');
                const buttons = document.querySelectorAll(querySelector);
                buttons.forEach(button => {
                    if (!button.classList.contains('SyncButton-m__withGlobalBar--apeEJ')) {
                        button.style.setProperty('color', color, 'important');
                    }
                });
            } else {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(button => {
                    button.style.setProperty('color', color, 'important');
                });
            }
        });

        console.log('Стили цвета текста кнопок применены напрямую для сервиса:', currentService);
    }


    // Функция для изменения фона страницы
    function changePageBackground(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const pageBgSelectors = selectors.pageBackground || [];
        
        // Создаем или обновляем CSS переменную
        let style = document.getElementById('yamail-pagebg-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'yamail-pagebg-styles';
            document.head.appendChild(style);
        }

        // Обрабатываем прозрачный фон
        const bgValue = color === 'transparent' ? 'transparent' : color;

        // Формируем CSS правила БЕЗ сложных исключений
        const pageBgCssRules = pageBgSelectors.map(selector => {
            return `${selector} { background-color: ${bgValue} !important; }`;
        }).join('\n            ');

        // CSS для фона страницы
        style.textContent = `
            /* Фон страницы для ${currentService} */
            ${pageBgCssRules}
            
            body {
                background-color: ${bgValue} !important;
            }
        `;

        // Применяем стили напрямую к элементам
        pageBgSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.setProperty('background-color', bgValue, 'important');
                });
            } catch (e) {}
        });
        
        // Также напрямую к body
        document.body.style.setProperty('background-color', bgValue, 'important');
        
        console.log('Фон страницы изменен на:', color, 'для сервиса:', currentService);
        
        // Дополнительно применяем стили напрямую к найденным элементам
        applyPageBackgroundDirectly(bgValue);
    }

    // Функция для проверки, нужно ли исключить элемент из покраски фона
    function shouldExcludeFromBackground(element) {
        const excludeSelectors = [
            '[class*="AppLink"]',
            '[class*="Button"]',
            '[class*="Link"]',
            '[class*="Icon"]',
            '[class*="Avatar"]',
            '[class*="Menu"]',
            '[class*="Dropdown"]',
            '[class*="Popup"]',
            '[class*="Modal"]',
            '[class*="Dialog"]',
            '[class*="Tooltip"]',
            '[class*="Calendar"]',
            '[class*="DatePicker"]',
            '[class*="Grid"]',
            '[class*="Cell"]',
            '[class*="Layout"]',
            '[class*="Editor"]',
            'a', 'button', 'input', 'select', 'textarea', 'span'
        ];
        
        for (const selector of excludeSelectors) {
            try {
                if (element.matches && element.matches(selector)) {
                    return true;
                }
            } catch (e) {}
        }
        return false;
    }

    // Функция для прямого применения стилей фона страницы
    function applyPageBackgroundDirectly(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const pageBgSelectors = selectors.pageBackground || [];

        const bgValue = color === 'transparent' ? 'transparent' : color;

        pageBgSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Не применяем к интерактивным элементам
                if (!shouldExcludeFromBackground(element)) {
                element.style.setProperty('background-color', bgValue, 'important');
                }
            });
        });

        console.log('Стили фона страницы применены напрямую для сервиса:', currentService);
    }

    // Функция для изменения фона кнопок продуктов (отключена)
    function changeGlobalBarBackground(color) {
        // Покраска кнопок продуктов отключена
    }


    // Функция для изменения фона левого меню
    function changeMenuBackground(color) {
        const currentService = getCurrentService();
        const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
        const menuSelectors = selectors.menu || [];

        menuSelectors.forEach(selector => {
            const menu = document.querySelector(selector);
            if (menu) {
                menu.style.backgroundColor = color + ' !important';
                menu.style.setProperty('background-color', color, 'important');
                console.log('Фон меню изменен:', selector, color);
            }
        });

        // Также добавляем CSS правило для надежности
        let style = document.getElementById('yamail-custom-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'yamail-custom-styles';
            document.head.appendChild(style);
        }

        const existingStyles = style.textContent || '';
        const menuBgCssRules = menuSelectors.map(selector => {
            return `${selector} { background-color: ${color} !important; }`;
        }).join('\n            ');
        
        const menuBgStyle = `
            /* Меню для ${currentService} */
            ${menuBgCssRules}
        `;

        // Обновляем стили, сохраняя существующие
        style.textContent = existingStyles + menuBgStyle;
        
        console.log('Фон меню изменен на:', color, 'для сервиса:', currentService);
    }

    // Функция для скрытия блоков (для темы Labubu)
    function hideBlocks() {
        // Селекторы блоков, которые нужно скрыть (только реклама и промо, не интерфейс!)
        const blockSelectors = [
            // Блоки рекламы (только явные)
            '[class*="AdBlock"]',
            '[class*="Advertisement"]',
            '[data-testid*="ad-"]',
            '[data-testid*="advertisement"]',
            // Промо блоки (только явные)
            '[class*="PromoBlock"]',
            '[class*="PromoBanner"]',
            '[data-testid*="promo-banner"]',
            // Баннеры (только рекламные)
            '[class*="AdBanner"]',
            '[data-testid*="ad-banner"]'
        ];

        // Создаем или обновляем CSS для скрытия блоков
        let style = document.getElementById('yamail-custom-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'yamail-custom-styles';
            document.head.appendChild(style);
        }

        const existingStyles = style.textContent || '';
        const hideBlocksStyle = `
            /* Скрытие блоков для темы Labubu */
            ${blockSelectors.join(', ')} {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
            }
        `;

        // Обновляем стили, сохраняя существующие
        style.textContent = existingStyles + hideBlocksStyle;
        
        console.log('Блоки скрыты для темы Labubu');
    }

    // Функция для показа блоков (сброс скрытия)
    function showBlocks() {
        let style = document.getElementById('yamail-custom-styles');
        if (!style) {
            return;
        }

        // Удаляем стили скрытия блоков
        const existingStyles = style.textContent || '';
        const lines = existingStyles.split('\n');
        const filteredLines = lines.filter(line => {
            return !line.includes('display: none !important') &&
                   !line.includes('visibility: hidden !important') &&
                   !line.includes('opacity: 0 !important') &&
                   !line.includes('height: 0 !important') &&
                   !line.includes('overflow: hidden !important');
        });
        
        style.textContent = filteredLines.join('\n');
        
        console.log('Скрытие блоков отменено');
    }

    // Функция для применения всех настроек
    function applySettings(settings) {
        appliedSettings = settings;
        console.log('Применяем настройки:', settings);

        if (settings.logo) {
            console.log('Применяем логотип:', settings.logo.substring(0, 50) + '...');
            const logoApplied = replaceLogo(
                settings.logo, 
                settings.logoWidth || 100, 
                settings.logoHeight || 50, 
                settings.logoLeft || 0, 
                settings.logoTop || 0
            );
            
            if (!logoApplied) {
                console.log('Логотип не найден, попробуем позже...');
                // Несколько попыток с увеличивающимися задержками
                const delays = [500, 1500, 3000, 5000];
                delays.forEach((delay, index) => {
                setTimeout(() => {
                        const result = replaceLogo(
                        settings.logo, 
                        settings.logoWidth || 100, 
                        settings.logoHeight || 50, 
                        settings.logoLeft || 0, 
                        settings.logoTop || 0
                    );
                        if (result) {
                            console.log(`Логотип найден на попытке ${index + 2} (задержка ${delay}мс)`);
                        }
                    }, delay);
                });
            }
        }

        // Сервисы, где применяется только логотип (без покраски)
        const logoOnlyServices = ['admin', 'yandex', 'alicepro', 'send'];
        const currentService = getCurrentService();
        const isLogoOnly = logoOnlyServices.includes(currentService);
        
        if (!isLogoOnly) {
        if (settings.buttonColor && settings.buttonColor !== '') {
            changeButtonColor(settings.buttonColor);
        }

        if (settings.buttonTextColor && settings.buttonTextColor !== '') {
            changeButtonTextColor(settings.buttonTextColor);
        }

        if (settings.pageBgColor && settings.pageBgColor !== '') {
            changePageBackground(settings.pageBgColor);
        }

        if (settings.globalBarColor && settings.globalBarColor !== '') {
            changeGlobalBarBackground(settings.globalBarColor);
        }

        // Применяем скрытие блоков для темы Labubu
        if (settings.hideBlocks) {
            hideBlocks();
        } else {
            showBlocks();
            }
        } else {
            console.log('Сервис', currentService, '- применяется только логотип, без покраски');
        }

        console.log('Настройки применены:', settings);
    }

    // Функция для сброса настроек
    function resetSettings() {
        // Удаляем кастомные стили
        const customStyle = document.getElementById('yamail-custom-styles');
        if (customStyle) {
            customStyle.remove();
        }

        // Сбрасываем логотип (перезагружаем страницу)
        if (appliedSettings.logo) {
            window.location.reload();
        }

        appliedSettings = {};
        console.log('Настройки сброшены');
    }

    // Определяем API браузера для обработки сообщений
    const browserAPI = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);
    
    // Слушаем сообщения от popup
    if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
        browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'apply') {
                applySettings(request.settings);
                sendResponse({success: true});
            } else if (request.action === 'reset') {
                resetSettings();
                sendResponse({success: true});
            } else if (request.action === 'applyLogo') {
                // Немедленно применяем логотип
                console.log('Получен запрос на применение логотипа:', request.logo.substring(0, 50) + '...');
                const logoApplied = replaceLogo(
                    request.logo, 
                    request.logoWidth || 100, 
                    request.logoHeight || 50, 
                    request.logoLeft || 0, 
                    request.logoTop || 0
                );
                
                if (logoApplied) {
                    console.log('Логотип успешно применен');
                } else {
                    console.log('Логотип не найден, попробуем через 500мс...');
                    setTimeout(() => {
                        replaceLogo(
                            request.logo, 
                            request.logoWidth || 100, 
                            request.logoHeight || 50, 
                            request.logoLeft || 0, 
                            request.logoTop || 0
                        );
                    }, 500);
                }
                sendResponse({success: true});
            }
        });
    }

    // Функция для загрузки и применения настроек
    function loadAndApplySettings() {
        // Определяем API браузера
        const browserAPI = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);
        
        if (!browserAPI) {
            console.error('Браузер не поддерживает расширения');
            return;
        }

        browserAPI.storage.local.get(['logo', 'logoWidth', 'logoHeight', 'logoLeft', 'logoTop', 'buttonColor', 'buttonTextColor', 'pageBgColor', 'globalBarColor', 'hideBlocks', 'selectedTheme'], function(result) {
            if (result.logo || result.buttonColor || result.buttonTextColor || result.pageBgColor || result.globalBarColor || result.hideBlocks) {
                console.log('Загружаем сохраненные настройки:', result);
                applySettings(result);
            }
        });
    }

    // Загружаем настройки сразу при загрузке скрипта
    loadAndApplySettings();

    // Дополнительно загружаем настройки после полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndApplySettings);
    } else {
        // DOM уже загружен, применяем настройки с небольшой задержкой
        setTimeout(loadAndApplySettings, 100);
    }

    // Наблюдаем за изменениями DOM для динамически загружаемых элементов
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                        // Проверяем, появились ли новые элементы логотипа
                        const addedNodes = Array.from(mutation.addedNodes);
                        addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Проверяем сам узел и его дочерние элементы
                                const currentService = getCurrentService();
                                const selectors = serviceSelectors[currentService] || serviceSelectors.mail;
                                
                                // Проверяем, появился ли новый логотип (SVG или IMG)
                                if (appliedSettings.logo) {
                                    // Проверяем, есть ли в добавленном узле элементы логотипа
                                    const hasLogoElement = node.matches && (
                                        node.matches('[class*="Logo360"]') ||
                                        node.matches('[class*="OrbLogo"]') ||
                                        node.matches('svg[class*="Logo"]')
                                    );
                                    const containsLogoElement = node.querySelector && (
                                        node.querySelector('[class*="Logo360"]') ||
                                        node.querySelector('[class*="OrbLogo"]') ||
                                        node.querySelector('svg[class*="Logo"]')
                                    );
                                    
                                    if (hasLogoElement || containsLogoElement) {
                                        console.log('Обнаружен новый элемент логотипа (MutationObserver), применяем замену');
                                        // Небольшая задержка для полной инициализации DOM
                                        setTimeout(() => {
                                            replaceLogo(
                                                appliedSettings.logo,
                                                appliedSettings.logoWidth || 100,
                                                appliedSettings.logoHeight || 50,
                                                appliedSettings.logoLeft || 0,
                                                appliedSettings.logoTop || 0
                                            );
                                        }, 100);
                                    }
                                }
                        
                        // Сервисы, где применяется только логотип (без покраски)
                        const logoOnlyServices = ['admin', 'yandex', 'alicepro', 'send'];
                        const isLogoOnly = logoOnlyServices.includes(currentService);
                        
                        if (!isLogoOnly) {
                        // Проверяем новые кнопки и применяем стили
                        const buttonSelectors = selectors.buttons || [];
                        
                        buttonSelectors.forEach(buttonSelector => {
                            let querySelector = buttonSelector;
                            // Для Яндекс.Почты исключаем кнопку синхронизации
                            if (currentService === 'mail') {
                                querySelector = buttonSelector.replace(':not(.SyncButton-m__withGlobalBar--apeEJ)', '');
                            }
                            const newButtons = node.querySelectorAll && node.querySelectorAll(querySelector);
                            if (newButtons && newButtons.length > 0) {
                                newButtons.forEach(button => {
                                    // Для Яндекс.Почты проверяем исключение
                                    if (currentService === 'mail' && button.classList.contains('SyncButton-m__withGlobalBar--apeEJ')) {
                                        return;
                                    }
                                    if (appliedSettings.buttonColor) {
                                        button.style.setProperty('--button-view-action-fill-color-base', appliedSettings.buttonColor, 'important');
                                    }
                                    if (appliedSettings.buttonTextColor) {
                                        button.style.setProperty('color', appliedSettings.buttonTextColor, 'important');
                                    }
                                });
                            }
                        });
                        
                        // Проверяем новые контейнеры страницы и применяем фон
                        const pageBgSelectors = selectors.pageBackground || [];
                        
                        pageBgSelectors.forEach(selector => {
                            const newPageElements = node.querySelectorAll && node.querySelectorAll(selector);
                            if (newPageElements && newPageElements.length > 0 && appliedSettings.pageBgColor) {
                                newPageElements.forEach(element => {
                                        // Не применяем к интерактивным элементам
                                        if (!shouldExcludeFromBackground(element)) {
                                    element.style.setProperty('background-color', appliedSettings.pageBgColor, 'important');
                                        }
                                });
                            }
                        });
                        }
                        
                    }
                });
            }
        });
    });

    // Начинаем наблюдение
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Периодическая проверка и применение логотипа (каждые 2 секунды)
    setInterval(() => {
        if (appliedSettings.logo) {
            const logoFound = replaceLogo(
                appliedSettings.logo, 
                appliedSettings.logoWidth || 100, 
                appliedSettings.logoHeight || 50, 
                appliedSettings.logoLeft || 0, 
                appliedSettings.logoTop || 0
            );
            
            if (logoFound) {
                console.log('Логотип восстановлен при периодической проверке');
            }
        }
    }, 2000);

    console.log('Яндекс 360 ✽ Стилёк content script загружен');
})();
