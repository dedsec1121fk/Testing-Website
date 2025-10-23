// Common JavaScript for DedSec Project - Guaranteed Working Version

document.addEventListener('DOMContentLoaded', function() {
    console.log('DedSec Project - Initializing common functionality...');
    
    // Initialize all common functionality
    initializeBurgerMenu();
    initializeLanguageSwitching();
    initializeCopyButtons();
    initializeThemeSwitcher();
    initializeModals();
    
    console.log('DedSec Project - Common functionality initialized successfully');
});

// Burger Menu Functionality - GUARANTEED TO WORK
function initializeBurgerMenu() {
    console.log('Initializing burger menu...');
    
    const burgerIcon = document.getElementById('burger-icon');
    const burgerContainer = document.getElementById('burger-icon-container');
    const navMenu = document.getElementById('nav-menu');
    
    if (!burgerIcon || !navMenu || !burgerContainer) {
        console.warn('Burger menu elements not found');
        return;
    }
    
    console.log('Burger menu elements found, setting up event listeners...');
    
    burgerContainer.addEventListener('click', function(e) {
        e.stopPropagation();
        burgerIcon.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active') && !burgerContainer.contains(e.target) && !navMenu.contains(e.target)) {
            burgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    const navItems = navMenu.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Don't close for theme/language buttons, as they open modals
            if (this.id === 'theme-switcher-btn' || this.id === 'lang-switcher-btn') {
                return;
            }
            burgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            burgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    console.log('Burger menu initialization complete');
}

// Language Switching Functionality
function initializeLanguageSwitching() {
    console.log('Initializing language switching...');
    
    let currentLanguage = localStorage.getItem('dedsec-language') || 'en';
    applyLanguage(currentLanguage);
    
    window.changeLanguage = function(lang) {
        console.log('Changing language to:', lang);
        currentLanguage = lang;
        localStorage.setItem('dedsec-language', lang);
        applyLanguage(lang);
    };
    
    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-en]').forEach(element => {
            const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
            
            // This logic correctly handles elements with and without child nodes
            const firstChild = element.childNodes[0];
            if (element.childNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE) {
                 element.textContent = text;
            } else {
                // If there are other elements inside (like an <i> tag), find a span to update
                const span = element.querySelector('span');
                if (span) {
                    span.textContent = text;
                }
            }
        });
        document.querySelectorAll('[data-lang-section]').forEach(section => {
            section.style.display = section.dataset.langSection === lang ? 'block' : 'none';
        });
        document.querySelectorAll('.language-button').forEach(button => {
            button.classList.toggle('selected', button.dataset.lang === lang);
        });
    }

    // Attach listener for the new language button in the menu
    const langSwitcherBtn = document.getElementById('lang-switcher-btn');
    if(langSwitcherBtn) {
        langSwitcherBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const langModal = document.getElementById('language-selection-modal');
            if(langModal) {
                langModal.classList.add('visible');
            }
        });
    }

    console.log('Language switching initialized');
}

// Copy to Clipboard Functionality
function initializeCopyButtons() {
    window.copyToClipboard = function(button, targetId) {
        const codeElement = document.getElementById(targetId);
        if (!codeElement) return;
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            const originalText = button.textContent;
            const currentLanguage = localStorage.getItem('dedsec-language') || 'en';
            button.textContent = currentLanguage === 'gr' ? 'Αντιγράφηκε!' : 'Copied!';
            setTimeout(() => { button.textContent = originalText; }, 1500);
        });
    };
}

// Theme Switcher Functionality
function initializeThemeSwitcher() {
    console.log('Initializing theme switcher...');
    
    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    if (!themeSwitcherBtn) {
        console.warn('Theme switcher button not found');
        return;
    }
    
    const themeIcon = themeSwitcherBtn.querySelector('i');
    const themeSpan = themeSwitcherBtn.querySelector('span');
    
    const savedTheme = localStorage.getItem('dedsec-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        document.body.classList.add('light-theme');
    }
    
    function updateThemeButton() {
        const isLight = document.body.classList.contains('light-theme');
        const currentLang = localStorage.getItem('dedsec-language') || 'en';
        if (isLight) {
            if (themeIcon) { themeIcon.className = 'fas fa-sun'; }
            if (themeSpan) { themeSpan.textContent = currentLang === 'gr' ? 'Φωτεινό Θέμα' : 'Light Theme'; }
        } else {
            if (themeIcon) { themeIcon.className = 'fas fa-moon'; }
            if (themeSpan) { themeSpan.textContent = currentLang === 'gr' ? 'Σκοτεινό Θέμα' : 'Dark Theme'; }
        }
    }
    
    themeSwitcherBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('light-theme');
        localStorage.setItem('dedsec-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        updateThemeButton();
    });
    
    updateThemeButton();
    console.log('Theme switcher initialized');
}

// Modal Management
function initializeModals() {
    console.log('Initializing modals...');
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('visible');
            }
        });
    });
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.remove('visible');
        });
    });
    document.querySelectorAll('.language-button').forEach(button => {
        button.addEventListener('click', function() {
            window.changeLanguage(this.dataset.lang);
            this.closest('.modal-overlay').classList.remove('visible');
        });
    });
}