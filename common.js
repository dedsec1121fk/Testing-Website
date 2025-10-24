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
});

// Burger menu functionality
function initializeBurgerMenu() {
    const burgerIcon = document.getElementById('burger-icon');
    const navMenu = document.getElementById('nav-menu');
    
    if (burgerIcon && navMenu) {
        burgerIcon.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!burgerIcon.contains(event.target) && !navMenu.contains(event.target)) {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Theme switcher functionality
function initializeThemeSwitcher() {
    const themeSwitcher = document.getElementById('theme-switcher-btn');
    
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', toggleTheme);
        
        // Update theme button text and icon
        updateThemeButton();
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    updateThemeButton();
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateThemeButton();
}

function updateThemeButton() {
    const themeSwitcher = document.getElementById('theme-switcher-btn');
    if (!themeSwitcher) return;
    
    const themeIcon = themeSwitcher.querySelector('i');
    const themeSpan = themeSwitcher.querySelector('span');
    const isLight = document.body.classList.contains('light-theme');
    
    if (isLight) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeSpan.setAttribute('data-en', 'Light Theme');
        themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeSpan.setAttribute('data-en', 'Theme');
        themeSpan.setAttribute('data-gr', 'Θέμα');
    }
    
    // Update text based on current language
    const currentLanguage = localStorage.getItem('language') || 'en';
    themeSpan.textContent = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
}

// Language switcher functionality
function initializeLanguageSwitcher() {
    const langSwitcher = document.getElementById('lang-switcher-btn');
    
    if (langSwitcher) {
        langSwitcher.addEventListener('click', function() {
            const currentLanguage = localStorage.getItem('language') || 'en';
            const newLanguage = currentLanguage === 'en' ? 'gr' : 'en';
            changeLanguage(newLanguage);
        });
    }
}

function setInitialLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    changeLanguage(savedLanguage);
}

function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-en]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
        
        // Check if element has direct text content
        const hasDirectText = Array.from(el.childNodes).some(node => 
            node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
        );
        
        if (hasDirectText) {
            Array.from(el.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    node.textContent = text;
                }
            });
        } else if (el.children.length === 0) {
            el.textContent = text;
        }
    });
    
    // Update lang sections
    document.querySelectorAll('[data-lang-section]').forEach(el => {
        const shouldShow = el.dataset.langSection === lang;
        el.style.display = shouldShow ? 'block' : 'none';
        el.classList.toggle('hidden', !shouldShow);
        
        if (shouldShow) {
            el.classList.remove('hidden-by-default');
        }
    });
    
    // Update search placeholders
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
        searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
    }
    
    // Update document language
    document.documentElement.lang = lang;
}

// Copy button functionality
function initializeCopyButtons() {
    // This function will be extended by individual pages as needed
}

// Global copy function
function copyToClipboard(button, targetId) {
    const codeElement = document.getElementById(targetId);
    if (!codeElement || !navigator.clipboard) {
        console.warn('Clipboard API not available or element not found.');
        button.textContent = 'Error';
        setTimeout(() => { 
            button.textContent = (localStorage.getItem('language') === 'gr') ? 'Αντιγραφή' : 'Copy'; 
        }, 1500);
        return;
    }
    
    const originalText = button.textContent;
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    navigator.clipboard.writeText(codeElement.innerText).then(() => {
        button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
        setTimeout(() => { button.textContent = originalText; }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        button.textContent = 'Failed!';
        setTimeout(() => { button.textContent = originalText; }, 1500);
    });
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('visible');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
    }
}

// Initialize modals
function initializeModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('visible');
            }
        });
    });
    
    // Close modals when clicking close button
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('visible');
            }
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('main-search-input');
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    
    if (searchInput && suggestionsContainer) {
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        };
        
        const fetchSuggestions = debounce((query) => {
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) oldScript.remove();
            
            const script = document.createElement('script');
            script.id = 'jsonp-script';
            const currentLanguage = localStorage.getItem('language') || 'en';
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
            };
            
            document.head.appendChild(script);
        }, 250);
        
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            
            if (query.length < 1) {
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
                return;
            }
            
            fetchSuggestions(query);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
        
        // Hide on Escape key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }
}

// Global callback for Google suggestions
window.handleGoogleSuggestions = function(data) {
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = '';
    const suggestions = data[1];
    
    if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
        suggestions.slice(0, 5).forEach(suggestion => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('search-result-item');
            itemEl.textContent = suggestion;
            
            itemEl.addEventListener('click', () => {
                const searchInput = document.getElementById('main-search-input');
                const searchForm = document.getElementById('main-search-form');
                if (searchInput && searchForm) {
                    searchInput.value = suggestion;
                    suggestionsContainer.classList.add('hidden');
                    searchForm.submit();
                    setTimeout(() => { searchInput.value = ''; }, 100);
                }
            });
            suggestionsContainer.appendChild(itemEl);
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
};