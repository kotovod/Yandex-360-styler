// Popup script для управления настройками Яндекс 360 ✽ Стилёк

// Определяем API браузера
const browserAPI = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : null);

document.addEventListener('DOMContentLoaded', function() {
    const logoInput = document.getElementById('logoInput');
    const logoButtonText = document.getElementById('logoButtonText');
    const logoPreview = document.getElementById('logoPreview');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const logoWidth = document.getElementById('logoWidth');
    const logoHeight = document.getElementById('logoHeight');
    const logoLeft = document.getElementById('logoLeft');
    const logoTop = document.getElementById('logoTop');
    const buttonColor = document.getElementById('buttonColor');
    const buttonColorHex = document.getElementById('buttonColorHex');
    const buttonColorValue = document.getElementById('buttonColorValue');
    const buttonColorPreview = document.getElementById('buttonColorPreview');
    const buttonTextColor = document.getElementById('buttonTextColor');
    const buttonTextColorHex = document.getElementById('buttonTextColorHex');
    const buttonTextColorValue = document.getElementById('buttonTextColorValue');
    const buttonTextColorPreview = document.getElementById('buttonTextColorPreview');
    const pageBgColor = document.getElementById('pageBgColor');
    const pageBgColorHex = document.getElementById('pageBgColorHex');
    const pageBgValue = document.getElementById('pageBgValue');
    const pageBgPreview = document.getElementById('pageBgPreview');
    const globalBarColor = document.getElementById('globalBarColor');
    const globalBarColorHex = document.getElementById('globalBarColorHex');
    const globalBarValue = document.getElementById('globalBarValue');
    const globalBarPreview = document.getElementById('globalBarPreview');
    const themeSelect = document.getElementById('themeSelect');
    const applyBtn = document.getElementById('applyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const status = document.getElementById('status');
    const themeLoading = document.getElementById('themeLoading');
    const resetModal = document.getElementById('resetModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');

    // Определения пресетов тем
    const themes = {
        custom: {
            name: 'Моя тема',
            description: 'Настройте цвета и логотип вручную'
        },
        labubu: {
            name: '🐰 Labubu',
            description: 'Розовая тема с милым Labubu',
            buttonColor: '#FE98A7',
            buttonTextColor: '#ffffff',
            pageBgColor: '#FFE7DD',
            globalBarColor: '#FE98A7',
            logo: 'themes/labubu.png',
            logoWidth: 53,
            logoHeight: 57,
            logoLeft: -13,
            logoTop: -20,
            hideBlocks: true
        },
        nusha: {
            name: '🐷 Нюша',
            description: 'Розовая тема с милой Нюшей',
            buttonColor: '#F597AA',
            buttonTextColor: '#ffffff',
            pageBgColor: '#FFDDEF',
            globalBarColor: '#F597AA',
            logo: 'themes/nusha.png',
            logoWidth: 58,
            logoHeight: 58,
            logoLeft: -13,
            logoTop: -20
        }
    };

    // Загружаем сохраненные настройки
    loadSettings();

    // Обработчики для логотипа
    logoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showStatus('Пожалуйста, выберите изображение', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                // Создаем изображение для проверки размеров
                const img = new Image();
                img.onload = function() {
                    // Если изображение меньше 200px по ширине, предупреждаем пользователя
                    if (img.width < 200) {
                        showStatus('Рекомендуется загружать изображения размером не менее 200x100px для Retina дисплеев', 'error');
                    }
                    
                    logoPreviewImg.src = e.target.result;
                    logoPreview.style.display = 'block';
                    logoButtonText.textContent = 'Изменить изображение';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Функция для валидации hex-кода
    function isValidHex(hex) {
        return /^#[0-9A-Fa-f]{6}$/.test(hex);
    }

    // Функция для нормализации hex-кода
    function normalizeHex(hex) {
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        if (hex.length === 4) {
            // Конвертируем #RGB в #RRGGBB
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex.toLowerCase();
    }

    // Синхронизация между hex-полем и color picker
    function syncColorInputs(hexInput, colorInput, valueSpan) {
        hexInput.addEventListener('input', function() {
            const hex = normalizeHex(this.value);
            if (isValidHex(hex)) {
                colorInput.value = hex;
                valueSpan.textContent = hex;
                this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                this.style.background = 'rgba(255, 255, 255, 0.2)';
            } else {
                this.style.borderColor = 'rgba(244, 67, 54, 0.6)';
                this.style.background = 'rgba(244, 67, 54, 0.1)';
            }
        });

        colorInput.addEventListener('input', function() {
            hexInput.value = this.value;
            valueSpan.textContent = this.value;
        });
    }

    // Настраиваем синхронизацию для всех цветов
    syncColorInputs(buttonColorHex, buttonColor, buttonColorValue);
    syncColorInputs(buttonTextColorHex, buttonTextColor, buttonTextColorValue);
    syncColorInputs(pageBgColorHex, pageBgColor, pageBgValue);
    syncColorInputs(globalBarColorHex, globalBarColor, globalBarValue);

    // Добавляем обработчики для отображения "Без изменений" при очистке полей
    function addClearHandlers(hexInput, valueSpan) {
        hexInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                valueSpan.textContent = 'Без изменений';
            }
        });
    }

    addClearHandlers(buttonColorHex, buttonColorValue);
    addClearHandlers(buttonTextColorHex, buttonTextColorValue);
    addClearHandlers(pageBgColorHex, pageBgValue);
    addClearHandlers(globalBarColorHex, globalBarValue);

    // Обработчик выбора темы
    themeSelect.addEventListener('change', function() {
        const selectedTheme = this.value;
        const theme = themes[selectedTheme];
        
        // Сохраняем выбранную тему
        if (browserAPI && browserAPI.storage) {
            browserAPI.storage.local.set({selectedTheme: selectedTheme});
        }
        
        // Если выбрана готовая тема, применяем её настройки
        if (selectedTheme !== 'custom') {
            // Показываем индикатор загрузки
            themeLoading.classList.add('show');
            
            // Применяем тему с небольшой задержкой для показа индикатора
            setTimeout(() => {
                applyTheme(theme);
                // Скрываем индикатор после применения
                setTimeout(() => {
                    themeLoading.classList.remove('show');
                }, 2000);
            }, 500);
        } else {
            // Скрываем индикатор для пользовательской настройки
            themeLoading.classList.remove('show');
            
            // Очищаем логотип при переключении на "Моя тема"
            logoInput.value = '';
            logoPreview.style.display = 'none';
            logoButtonText.textContent = 'Выбрать изображение';
            console.log('Очищен логотип при переключении на Моя тема');
        }
    });

    // Применить настройки
    applyBtn.addEventListener('click', function() {
        // Активируем состояние loading
        setLoadingState(true);
        
        // Валидация hex-кодов (все поля могут быть пустыми)
        const buttonHex = buttonColorHex.value.trim() === '' ? '' : normalizeHex(buttonColorHex.value);
        const buttonTextHex = buttonTextColorHex.value.trim() === '' ? '' : normalizeHex(buttonTextColorHex.value);
        const pageHex = pageBgColorHex.value.trim() === '' ? '' : normalizeHex(pageBgColorHex.value);
        const globalBarHex = globalBarColorHex.value.trim() === '' ? '' : normalizeHex(globalBarColorHex.value);

        if ((buttonHex !== '' && !isValidHex(buttonHex)) || 
            (buttonTextHex !== '' && !isValidHex(buttonTextHex)) || 
            (pageHex !== '' && !isValidHex(pageHex)) || 
            (globalBarHex !== '' && !isValidHex(globalBarHex))) {
            showStatus('Пожалуйста, введите корректные hex-коды цветов', 'error');
            setLoadingState(false);
            return;
        }

        const settings = {
            logoWidth: parseInt(logoWidth.value) || 100,
            logoHeight: parseInt(logoHeight.value) || 50,
            logoLeft: parseInt(logoLeft.value) || 0,
            logoTop: parseInt(logoTop.value) || 0,
            hideBlocks: false
        };

        // Добавляем цвета только если поля не пустые
        if (buttonHex !== '') {
            settings.buttonColor = buttonHex;
        }
        if (buttonTextHex !== '') {
            settings.buttonTextColor = buttonTextHex;
        }
        if (pageHex !== '') {
            settings.pageBgColor = pageHex;
        }
        if (globalBarHex !== '') {
            settings.globalBarColor = globalBarHex;
        }

        // Если выбран новый логотип
        if (logoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                settings.logo = e.target.result;
                console.log('Новый логотип загружен:', e.target.result.substring(0, 50) + '...');
                saveAndApplySettings(settings);
            };
            reader.readAsDataURL(logoInput.files[0]);
        } else {
            // Сохраняем существующий логотип, если он есть в превью
            if (logoPreviewImg.src && logoPreviewImg.src !== '' && logoPreview.style.display !== 'none') {
                // Проверяем, что это не URL расширения (а уже base64 или data URL)
                const isExtensionUrl = logoPreviewImg.src.includes('chrome-extension://') ||
                                       logoPreviewImg.src.includes('moz-extension://');
                
                if (!isExtensionUrl) {
                    settings.logo = logoPreviewImg.src;
                    console.log('Сохраняем логотип:', logoPreviewImg.src.substring(0, 50) + '...');
                } else {
                    console.log('Пропускаем URL расширения, логотип уже должен быть в storage');
                }
            }
            saveAndApplySettings(settings);
        }
        
        // Отключаем loading состояние после завершения
        setTimeout(() => {
            setLoadingState(false);
        }, 2000);
    });

    // Сбросить настройки
    resetBtn.addEventListener('click', function() {
        showResetModal();
    });

    // Показать модальное окно сброса
    function showResetModal() {
        resetModal.classList.add('show');
    }

    // Скрыть модальное окно
    function hideResetModal() {
        resetModal.classList.remove('show');
    }

    // Обработчики модального окна
    modalCancel.addEventListener('click', hideResetModal);
    
    modalConfirm.addEventListener('click', function() {
        hideResetModal();
        
        // Выполняем сброс
        if (browserAPI && browserAPI.storage) {
            browserAPI.storage.local.clear();
        }
        
        // Сбрасываем тему к "Моя тема"
        themeSelect.value = 'custom';
        themeLoading.classList.remove('show');
        
        // Сбрасываем все поля к значениям по умолчанию
        resetAllFields();
        
        loadSettings();
        showStatus('Настройки сброшены', 'success');
        
        // Отправляем сообщение content script для сброса
        if (browserAPI && browserAPI.tabs) {
            browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] && browserAPI.tabs.sendMessage) {
                    browserAPI.tabs.sendMessage(tabs[0].id, {
                        action: 'reset'
                    });
                }
            });
        }
    });

    // Закрытие модального окна по клику на overlay
    resetModal.addEventListener('click', function(e) {
        if (e.target === resetModal) {
            hideResetModal();
        }
    });

    // Функция применения темы
    function applyTheme(theme) {
        if (theme.buttonColor) {
            buttonColor.value = theme.buttonColor;
            buttonColorHex.value = theme.buttonColor;
            buttonColorValue.textContent = theme.buttonColor;
        }
        
        if (theme.buttonTextColor) {
            buttonTextColor.value = theme.buttonTextColor;
            buttonTextColorHex.value = theme.buttonTextColor;
            buttonTextColorValue.textContent = theme.buttonTextColor;
        }
        
        
        if (theme.pageBgColor) {
            pageBgColor.value = theme.pageBgColor;
            pageBgColorHex.value = theme.pageBgColor;
            pageBgValue.textContent = theme.pageBgColor;
        }
        
        if (theme.globalBarColor) {
            globalBarColor.value = theme.globalBarColor;
            globalBarColorHex.value = theme.globalBarColor;
            globalBarValue.textContent = theme.globalBarColor;
        }
        
        if (theme.logoWidth) {
            logoWidth.value = theme.logoWidth;
        }
        
        if (theme.logoHeight) {
            logoHeight.value = theme.logoHeight;
        }
        
        if (theme.logoLeft) {
            logoLeft.value = theme.logoLeft;
        }
        
        if (theme.logoTop) {
            logoTop.value = theme.logoTop;
        }
        
        // Если есть логотип в теме, загружаем его
        if (theme.logo) {
            // Загружаем встроенное изображение темы
            const runtimeURL = browserAPI && browserAPI.runtime ? browserAPI.runtime.getURL(theme.logo) : null;
            if (!runtimeURL) {
                console.error('API браузера недоступен для загрузки темы');
                showStatus(`Тема "${theme.name}" применена (без логотипа)!`, 'success');
                return;
            }
            
            fetch(runtimeURL)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Применяем логотип темы
                        logoPreviewImg.src = e.target.result;
                        logoPreview.style.display = 'block';
                        logoButtonText.textContent = 'Изменить изображение';
                        
                        // Сохраняем логотип темы
                        const settings = {
                            logo: e.target.result,
                            logoWidth: theme.logoWidth,
                            logoHeight: theme.logoHeight,
                            logoLeft: theme.logoLeft,
                            logoTop: theme.logoTop,
                            buttonColor: theme.buttonColor,
                            buttonTextColor: theme.buttonTextColor,
                            pageBgColor: theme.pageBgColor,
                            globalBarColor: theme.globalBarColor,
                            hideBlocks: theme.hideBlocks || false
                        };
                        
                        console.log('Логотип темы загружен:', e.target.result.substring(0, 50) + '...');
                        
                        // Применяем настройки темы
                        saveAndApplySettings(settings);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => {
                    console.error('Ошибка загрузки логотипа темы:', error);
                    showStatus(`Тема "${theme.name}" применена (без логотипа)!`, 'success');
                });
        } else {
            showStatus(`Тема "${theme.name}" применена!`, 'success');
        }
    }

    function loadSettings() {
        if (!browserAPI || !browserAPI.storage) {
            console.error('API браузера недоступен');
            return;
        }

        browserAPI.storage.local.get(['logo', 'logoWidth', 'logoHeight', 'logoLeft', 'logoTop', 'buttonColor', 'buttonTextColor', 'pageBgColor', 'globalBarColor', 'hideBlocks', 'selectedTheme'], function(result) {
            // Загружаем выбранную тему
            if (result.selectedTheme) {
                themeSelect.value = result.selectedTheme;
            }
            
            if (result.logo) {
                logoPreviewImg.src = result.logo;
                logoPreview.style.display = 'block';
                logoButtonText.textContent = 'Изменить изображение';
                console.log('Логотип загружен из storage:', result.logo.substring(0, 50) + '...');
            }
            
            if (result.logoWidth) {
                logoWidth.value = result.logoWidth;
            }
            
            if (result.logoHeight) {
                logoHeight.value = result.logoHeight;
            }
            
            if (result.logoLeft) {
                logoLeft.value = result.logoLeft;
            }
            
            if (result.logoTop) {
                logoTop.value = result.logoTop;
            }
            
            if (result.buttonColor) {
                buttonColor.value = result.buttonColor;
                buttonColorHex.value = result.buttonColor;
                buttonColorValue.textContent = result.buttonColor;
            }
            
            if (result.buttonTextColor) {
                buttonTextColor.value = result.buttonTextColor;
                buttonTextColorHex.value = result.buttonTextColor;
                buttonTextColorValue.textContent = result.buttonTextColor;
            }
            
            
            if (result.pageBgColor) {
                pageBgColor.value = result.pageBgColor;
                pageBgColorHex.value = result.pageBgColor;
                pageBgValue.textContent = result.pageBgColor;
            }
            
            if (result.globalBarColor) {
                globalBarColor.value = result.globalBarColor;
                globalBarColorHex.value = result.globalBarColor;
                globalBarValue.textContent = result.globalBarColor;
            }
        });
    }

    function saveAndApplySettings(settings) {
        if (!browserAPI || !browserAPI.storage) {
            console.error('API браузера недоступен');
            return;
        }

        browserAPI.storage.local.set(settings, function() {
            // Обновляем страницу для применения изменений
            setTimeout(() => {
                refreshPage();
            }, 500); // Небольшая задержка для плавности
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status show ${type}`;
        setTimeout(() => {
            status.className = 'status';
        }, 3000);
    }

    // Функция для автоматического обновления страницы
    function refreshPage() {
        if (!browserAPI || !browserAPI.tabs) {
            console.error('API браузера недоступен для обновления страницы');
            return;
        }

        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && browserAPI.tabs.reload) {
                console.log('Обновляем страницу для применения изменений...');
                browserAPI.tabs.reload(tabs[0].id);
            }
        });
    }

    // Функция для сброса всех полей к значениям по умолчанию
    function resetAllFields() {
        // Сбрасываем логотип
        logoInput.value = '';
        logoPreview.style.display = 'none';
        logoButtonText.textContent = 'Выбрать изображение';
        
        // Сбрасываем размеры и позиционирование логотипа
        logoWidth.value = '100';
        logoHeight.value = '50';
        logoLeft.value = '0';
        logoTop.value = '0';
        
        // Сбрасываем все поля цветов к пустым (без изменений)
        buttonColor.value = '#ffffff';
        buttonColorHex.value = '';
        buttonColorValue.textContent = 'Без изменений';
        
        buttonTextColor.value = '#000000';
        buttonTextColorHex.value = '';
        buttonTextColorValue.textContent = 'Без изменений';
        
        pageBgColor.value = '#ffffff';
        pageBgColorHex.value = '';
        pageBgValue.textContent = 'Без изменений';
        
        globalBarColor.value = '#ffffff';
        globalBarColorHex.value = '';
        globalBarValue.textContent = 'Без изменений';
        
        console.log('Все поля сброшены к значениям по умолчанию');
    }

    // Функция для управления состоянием loading кнопки
    function setLoadingState(isLoading) {
        if (isLoading) {
            applyBtn.classList.add('loading');
            applyBtn.disabled = true;
            applyBtn.innerHTML = '<span class="loading-spinner"></span>Обновляю…';
        } else {
            applyBtn.classList.remove('loading');
            applyBtn.disabled = false;
            applyBtn.innerHTML = 'Применить';
        }
    }
});
