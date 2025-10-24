// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize burger menu
    initializeBurgerMenu();
    
    // Initialize theme switcher
    initializeThemeSwitcher();
    
    // Initialize language switcher
    initializeLanguageSwitcher();
    
    // Initialize copy buttons
    initializeCopyButtons();
    
    // Set initial theme
    setInitialTheme();
    
    // Set initial language
    setInitialLanguage();
    
    // Initialize search functionality for useful info page
    if (document.getElementById('useful-info-search-input')) {
        initializeUsefulInfoSearch();
    }
});

// Burger menu functionality
function initializeBurgerMenu() {
    const burgerIcon = document.querySelector('.burger-icon');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (burgerIcon && navMenu) {
        // Create overlay if it doesn't exist
        if (!navOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', closeBurgerMenu);
        }
        
        burgerIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleBurgerMenu();
        });
        
        // Close menu when clicking on overlay
        document.querySelector('.nav-overlay').addEventListener('click', closeBurgerMenu);
        
        // Close menu when clicking ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeBurgerMenu();
            }
        });
    }
}

function toggleBurgerMenu() {
    const burgerIcon = document.querySelector('.burger-icon');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    burgerIcon.classList.toggle('active');
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeBurgerMenu() {
    const burgerIcon = document.querySelector('.burger-icon');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    burgerIcon.classList.remove('active');
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Theme switcher functionality
function initializeThemeSwitcher() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const body = document.body;
    const isLightTheme = body.classList.contains('light-theme');
    
    if (isLightTheme) {
        body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        document.body.classList.add('light-theme');
    }
}

// Language switcher functionality
function initializeLanguageSwitcher() {
    const langSwitcherBtn = document.getElementById('lang-switcher-btn');
    
    if (langSwitcherBtn) {
        langSwitcherBtn.addEventListener('click', toggleLanguage);
    }
}

function toggleLanguage() {
    const currentLang = document.documentElement.lang || 'en';
    const newLang = currentLang === 'en' ? 'es' : 'en';
    
    document.documentElement.lang = newLang;
    localStorage.setItem('language', newLang);
    
    updateLanguageText(newLang);
}

function setInitialLanguage() {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    
    let lang = 'en';
    if (savedLang) {
        lang = savedLang;
    } else if (browserLang === 'es') {
        lang = 'es';
    }
    
    document.documentElement.lang = lang;
    updateLanguageText(lang);
}

function updateLanguageText(lang) {
    const langSwitcherBtn = document.getElementById('lang-switcher-btn');
    if (!langSwitcherBtn) return;
    
    const span = langSwitcherBtn.querySelector('span');
    if (span) {
        span.textContent = lang === 'en' ? 'ES' : 'EN';
    }
    
    // Update all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Copy button functionality
function initializeCopyButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const codeContainer = e.target.closest('.code-container');
            const codeElement = codeContainer.querySelector('code');
            const textToCopy = codeElement.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = e.target.textContent;
                e.target.textContent = 'Copied!';
                e.target.style.background = 'var(--nm-success)';
                e.target.style.color = '#000';
                
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.style.background = '';
                    e.target.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                e.target.textContent = 'Failed!';
                setTimeout(() => {
                    e.target.textContent = 'Copy';
                }, 2000);
            });
        }
    });
}

// Useful Information search functionality
function initializeUsefulInfoSearch() {
    const searchInput = document.getElementById('useful-info-search-input');
    const resultsContainer = document.getElementById('useful-info-results-container');
    
    if (!searchInput || !resultsContainer) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        if (searchTerm.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        // Get all searchable content
        const searchableItems = document.querySelectorAll('.searchable-item');
        const matches = [];
        
        searchableItems.forEach(item => {
            const title = item.getAttribute('data-title') || '';
            const description = item.getAttribute('data-description') || '';
            const content = item.textContent || '';
            
            if (title.toLowerCase().includes(searchTerm) || 
                description.toLowerCase().includes(searchTerm) ||
                content.toLowerCase().includes(searchTerm)) {
                matches.push({
                    element: item,
                    title: title,
                    description: description
                });
            }
        });
        
        // Display results
        if (matches.length > 0) {
            matches.forEach(match => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div>${match.title}</div>
                    ${match.description ? `<small>${match.description}</small>` : ''}
                `;
                
                resultItem.addEventListener('click', function() {
                    // Scroll to the element
                    match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight the element
                    match.element.style.background = 'var(--nm-accent)';
                    match.element.style.color = 'var(--nm-darkest)';
                    
                    setTimeout(() => {
                        match.element.style.background = '';
                        match.element.style.color = '';
                    }, 3000);
                    
                    // Clear search
                    searchInput.value = '';
                    resultsContainer.style.display = 'none';
                });
                
                resultsContainer.appendChild(resultItem);
            });
            
            resultsContainer.style.display = 'block';
        } else {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No results found';
            resultsContainer.appendChild(noResults);
            resultsContainer.style.display = 'block';
        }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target;
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal-overlay.visible');
        if (visibleModal) {
            visibleModal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }
});

// Translations object
const translations = {
    en: {
        // Add your English translations here
        'welcome': 'Welcome to DedSec',
        'search_placeholder': 'Search...'
    },
    es: {
        // Add your Spanish translations here
        'welcome': 'Bienvenido a DedSec',
        'search_placeholder': 'Buscar...'
    }
};

// Utility function for smooth scrolling
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}