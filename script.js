// Переключение темы
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Проверяем сохраненную тему
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Загрузка ROM из JSON файла
async function loadROMs() {
    const loading = document.getElementById('loading');
    const romsContainer = document.getElementById('romsContainer');
    const romCounter = document.getElementById('romCounter');
    
    try {
        // Загружаем JSON файл
        const response = await fetch('roms.json');
        if (!response.ok) throw new Error('Не удалось загрузить данные');
        
        const data = await response.json();
        
        // Скрываем индикатор загрузки
        loading.style.display = 'none';
        
        // Обновляем счетчик
        const totalRoms = countTotalROMs(data);
        romCounter.textContent = `${totalRoms} прошивок`;
        
        // Отображаем ROM
        displayROMs(data);
        
        // Инициализируем фильтры
        initFilters();
        
    } catch (error) {
        console.error('Ошибка загрузки ROM:', error);
        loading.innerHTML = `
            <div style="color: #ef4444; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Не удалось загрузить список прошивок</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// Подсчет общего количества прошивок
function countTotalROMs(data) {
    let total = 0;
    data.roms.forEach(family => {
        total += family.versions.length;
    });
    return total;
}

// Отображение ROM
function displayROMs(data) {
    const romsContainer = document.getElementById('romsContainer');
    
    // Группируем по версии Android
    const groupedByAndroid = data.roms.reduce((acc, rom) => {
        const android = rom.android;
        if (!acc[android]) acc[android] = [];
        acc[android].push(rom);
        return acc;
    }, {});
    
    let html = '';
    
    // Сортируем Android версии по убыванию
    const androidVersions = Object.keys(groupedByAndroid).sort((a, b) => b - a);
    
    androidVersions.forEach(android => {
        const roms = groupedByAndroid[android];
        
        html += `
            <div class="android-group" data-android="${android}">
                <div class="android-header" onclick="toggleAccordion(this, '.android-content')">
                    <h3>
                        <i class="fab fa-android"></i>
                        Android ${android}
                    </h3>
                    <span class="rom-count">${roms.length} семейств</span>
                </div>
                <div class="android-content">
                    ${roms.map(rom => renderRomFamily(rom)).join('')}
                </div>
            </div>
        `;
    });
    
    romsContainer.innerHTML = html;
}

// Рендер семейства ROM
function renderRomFamily(rom) {
    return `
        <div class="family-group">
            <div class="family-header" onclick="toggleAccordion(this, '.family-content')">
                <h4>
                    <i class="fas fa-folder"></i>
                    ${rom.family}
                </h4>
                <span class="version-count">${rom.versions.length} версий</span>
            </div>
            <div class="family-content">
                ${rom.versions.map(version => renderRomVersion(version)).join('')}
            </div>
        </div>
    `;
}

// Рендер версии ROM
function renderRomVersion(version) {
    return `
        <div class="rom-card">
            <div class="rom-header">
                <h5>
                    <i class="fas fa-code-branch"></i>
                    ${version.name}
                </h5>
                ${version.date ? `<span class="rom-date">${version.date}</span>` : ''}
            </div>
            
            <div class="download-links">
                ${(version.links || []).map(link => `
                    <a href="${link.url}" target="_blank" class="download-btn">
                        <i class="fas fa-download"></i>
                        ${link.name}
                    </a>
                `).join('')}
                
                ${(version.variants || []).map(variant => `
                    ${variant.links.map(link => `
                        <a href="${link.url}" target="_blank" class="download-btn">
                            <i class="fas fa-download"></i>
                            ${link.name} (${variant.type})
                        </a>
                    `).join('')}
                `).join('')}
            </div>
        </div>
    `;
}

// Аккордеон
function toggleAccordion(header, contentSelector) {
    const content = header.nextElementSibling;
    const isOpen = content.style.display === 'block';
    
    // Закрываем все другие элементы в той же группе
    const parent = header.parentElement;
    const allContents = parent.querySelectorAll(contentSelector);
    allContents.forEach(item => {
        if (item !== content) {
            item.style.display = 'none';
        }
    });
    
    // Переключаем текущий
    content.style.display = isOpen ? 'none' : 'block';
}

// Инициализация фильтров
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс нажатой кнопке
            button.classList.add('active');
            
            const filter = button.dataset.filter;
            filterROMs(filter);
        });
    });
}

// Фильтрация ROM
function filterROMs(androidVersion) {
    const romGroups = document.querySelectorAll('.android-group');
    
    romGroups.forEach(group => {
        if (androidVersion === 'all' || group.dataset.android === androidVersion) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

// Загружаем ROM при загрузке страницы
document.addEventListener('DOMContentLoaded', loadROMs);
