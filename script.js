// script.js - Optimized and Secure
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- SECURITY CONFIGURATION ---
    const SECURITY_CONFIG = {
        maxSearchResults: 5,
        debounceDelay: 250,
        apiTimeout: 10000
    };

    // --- GLOBAL STATE WITH IMMUTABILITY ---
    const state = Object.freeze({
        currentLanguage: localStorage.getItem('language') || 'en',
        usefulInfoSearchIndex: [],
        usefulInfoFiles: [],
        isUsefulInfoIndexBuilt: false,
        usefulInformationLoaded: false,
        isFetchingUsefulInfo: false,
        activeModals: new Set()
    });

    // --- SECURITY UTILITIES ---
    const SecurityUtils = {
        sanitizeHTML: (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        escapeRegex: (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },

        validateURL: (url) => {
            try {
                const parsed = new URL(url);
                return ['https:', 'http:'].includes(parsed.protocol);
            } catch {
                return false;
            }
        }
    };

    // --- PERFORMANCE UTILITIES ---
    const PerformanceUtils = {
        debounce: (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },

        throttle: (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // --- NAVIGATION MANAGEMENT ---
    const NavigationManager = {
        init() {
            this.setupBurgerMenu();
            this.setupNavLinks();
            this.setupOutsideClick();
        },

        setupBurgerMenu() {
            const burgerMenu = document.getElementById('burger-menu');
            const navMenu = document.getElementById('nav-menu');
            
            if (burgerMenu && navMenu) {
                burgerMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    burgerMenu.classList.toggle('active');
                    navMenu.classList.toggle('active');
                });
            }
        },

        setupNavLinks() {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
        },

        setupOutsideClick() {
            document.addEventListener('click', (e) => {
                const burgerMenu = document.getElementById('burger-menu');
                const navMenu = document.getElementById('nav-menu');
                
                if (navMenu?.classList.contains('active') && 
                    !navMenu.contains(e.target) && 
                    !burgerMenu?.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        },

        closeMobileMenu() {
            const burgerMenu = document.getElementById('burger-menu');
            const navMenu = document.getElementById('nav-menu');
            
            burgerMenu?.classList.remove('active');
            navMenu?.classList.remove('active');
        }
    };

    // --- THEME MANAGEMENT ---
    const ThemeManager = {
        init() {
            this.setupThemeSwitcher();
            this.applySavedTheme();
        },

        setupThemeSwitcher() {
            const themeBtn = document.getElementById('nav-theme-switcher');
            themeBtn?.addEventListener('click', () => this.toggleTheme());
        },

        toggleTheme() {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            this.updateThemeIcon(isLight);
        },

        updateThemeIcon(isLight) {
            const themeBtn = document.getElementById('nav-theme-switcher');
            const themeIcon = themeBtn?.querySelector('i');
            
            if (themeIcon) {
                themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
            }
        },

        applySavedTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
                this.updateThemeIcon(true);
            }
        }
    };

    // --- LANGUAGE MANAGEMENT ---
    const LanguageManager = {
        init() {
            this.setupLanguageSwitcher();
            this.setupLanguageModal();
            this.applySavedLanguage();
        },

        setupLanguageSwitcher() {
            const langBtn = document.getElementById('nav-lang-switcher');
            const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');
            
            langBtn?.addEventListener('click', () => this.openLanguageModal());
            disclaimerLangBtn?.addEventListener('click', () => this.openLanguageModal());
        },

        setupLanguageModal() {
            const languageModal = document.getElementById('language-selection-modal');
            
            document.querySelectorAll('.language-button').forEach(button => {
                button.addEventListener('click', () => {
                    this.changeLanguage(button.dataset.lang);
                    this.closeModal(languageModal);
                });
            });
        },

        openLanguageModal() {
            const languageModal = document.getElementById('language-selection-modal');
            this.showModal(languageModal);
        },

        changeLanguage(lang) {
            state.currentLanguage = lang;
            document.documentElement.lang = lang;
            localStorage.setItem('language', lang);
            
            this.updateTextContent();
            this.updateSearchPlaceholders();
        },

        updateTextContent() {
            document.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${state.currentLanguage}`) || el.getAttribute('data-en');
                this.safeTextUpdate(el, text);
            });

            document.querySelectorAll('[data-lang-section]').forEach(el => {
                const shouldShow = el.dataset.langSection === state.currentLanguage;
                el.style.display = shouldShow ? 'block' : 'none';
                el.classList.toggle('hidden-by-default', !shouldShow);
            });
        },

        safeTextUpdate(element, text) {
            const sanitizedText = SecurityUtils.sanitizeHTML(text);
            
            if (element.children.length === 0) {
                element.textContent = sanitizedText;
            } else {
                const hasDirectText = Array.from(element.childNodes).some(node => 
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                );
                
                if (hasDirectText) {
                    Array.from(element.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                            node.textContent = sanitizedText;
                        }
                    });
                }
            }
        },

        updateSearchPlaceholders() {
            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = state.currentLanguage === 'gr' 
                    ? 'Αναζήτηση στο διαδίκτυο...' 
                    : 'Search the Web...';
            }
        },

        applySavedLanguage() {
            this.changeLanguage(state.currentLanguage);
        }
    };

    // --- MODAL MANAGEMENT ---
    const ModalManager = {
        init() {
            this.setupModalEvents();
            this.setupEscapeKey();
        },

        setupModalEvents() {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                const closeModalBtn = modal.querySelector('.close-modal');
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal && modal.id !== 'disclaimer-modal') {
                        this.closeModal(modal);
                    }
                });
                
                closeModalBtn?.addEventListener('click', () => this.closeModal(modal));
            });
        },

        setupEscapeKey() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
            });
        },

        showModal(modal) {
            if (!modal) return;
            
            modal.classList.add('visible');
            state.activeModals.add(modal);
            document.body.style.overflow = 'hidden';
        },

        closeModal(modal) {
            if (!modal) return;
            
            modal.classList.remove('visible');
            state.activeModals.delete(modal);
            
            if (state.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        },

        closeAllModals() {
            state.activeModals.forEach(modal => {
                modal.classList.remove('visible');
            });
            state.activeModals.clear();
            document.body.style.overflow = '';
        }
    };

    // --- DISCLAIMER MANAGEMENT ---
    const DisclaimerManager = {
        init() {
            this.setupDisclaimerEvents();
            this.checkDisclaimerStatus();
        },

        setupDisclaimerEvents() {
            const acceptBtn = document.getElementById('accept-disclaimer');
            const declineBtn = document.getElementById('decline-disclaimer');
            
            acceptBtn?.addEventListener('click', () => this.acceptDisclaimer());
            declineBtn?.addEventListener('click', () => this.declineDisclaimer());
        },

        checkDisclaimerStatus() {
            const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
            if (!disclaimerAccepted) {
                setTimeout(() => {
                    this.showDisclaimer();
                }, 1000);
            }
        },

        showDisclaimer() {
            const disclaimerModal = document.getElementById('disclaimer-modal');
            ModalManager.showModal(disclaimerModal);
        },

        acceptDisclaimer() {
            localStorage.setItem('disclaimerAccepted', 'true');
            ModalManager.closeModal(document.getElementById('disclaimer-modal'));
        },

        declineDisclaimer() {
            window.history.back();
        }
    };

    // --- SEARCH FUNCTIONALITY ---
    const SearchManager = {
        init() {
            this.setupWebSearch();
        },

        setupWebSearch() {
            const searchInput = document.getElementById('main-search-input');
            const suggestionsContainer = document.getElementById('search-suggestions-container');
            
            if (!searchInput || !suggestionsContainer) return;

            const debouncedSearch = PerformanceUtils.debounce(
                (query) => this.fetchSuggestions(query),
                SECURITY_CONFIG.debounceDelay
            );

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                if (query.length < 1) {
                    this.hideSuggestions();
                    return;
                }
                
                debouncedSearch(query);
            });

            this.setupSearchEvents(searchInput, suggestionsContainer);
        },

        setupSearchEvents(searchInput, suggestionsContainer) {
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                    this.hideSuggestions();
                }
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideSuggestions();
                }
            });
        },

        fetchSuggestions(query) {
            if (!query || query.length < 1) return;

            const script = document.createElement('script');
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${
                encodeURIComponent(query)
            }&hl=${state.currentLanguage}&callback=SearchManager.handleSuggestions`;
            
            script.onerror = () => {
                console.warn('Failed to load search suggestions');
                this.hideSuggestions();
            };
            
            document.head.appendChild(script);
        },

        handleSuggestions(data) {
            const suggestionsContainer = document.getElementById('search-suggestions-container');
            const suggestions = data[1] || [];

            if (suggestions.length > 0) {
                this.showSuggestions(suggestions);
            } else {
                this.hideSuggestions();
            }
        },

        showSuggestions(suggestions) {
            const suggestionsContainer = document.getElementById('search-suggestions-container');
            suggestionsContainer.innerHTML = '';

            suggestions.slice(0, SECURITY_CONFIG.maxSearchResults).forEach(suggestion => {
                const itemEl = document.createElement('div');
                itemEl.className = 'search-result-item';
                itemEl.textContent = SecurityUtils.sanitizeHTML(suggestion);
                
                itemEl.addEventListener('click', () => {
                    this.selectSuggestion(suggestion);
                });
                
                suggestionsContainer.appendChild(itemEl);
            });
            
            suggestionsContainer.classList.remove('hidden');
        },

        selectSuggestion(suggestion) {
            const searchInput = document.getElementById('main-search-input');
            const searchForm = document.getElementById('main-search-form');
            
            if (searchInput && searchForm) {
                searchInput.value = suggestion;
                searchForm.submit();
            }
            
            this.hideSuggestions();
        },

        hideSuggestions() {
            const suggestionsContainer = document.getElementById('search-suggestions-container');
            suggestionsContainer?.classList.add('hidden');
            suggestionsContainer.innerHTML = '';
        }
    };

    // --- INITIALIZATION ---
    const App = {
        init() {
            this.initializeModules();
            this.setupErrorHandling();
        },

        initializeModules() {
            NavigationManager.init();
            ThemeManager.init();
            LanguageManager.init();
            ModalManager.init();
            DisclaimerManager.init();
            SearchManager.init();
            
            // Initialize page-specific modules
            this.initializePageSpecificModules();
        },

        initializePageSpecificModules() {
            if (document.querySelector('.categories-container')) {
                this.initializeToolCategories();
            }

            if (document.getElementById('useful-information-nav')) {
                this.initializeUsefulInfo();
            }
        },

        initializeToolCategories() {
            // Tool categories initialization logic
            document.querySelectorAll('.category-header').forEach(header => {
                header.addEventListener('click', function() {
                    const category = this.parentElement;
                    category.classList.toggle('active');
                });
            });
        },

        initializeUsefulInfo() {
            // Useful information initialization logic
            // This would include the search index building and search functionality
        },

        setupErrorHandling() {
            window.addEventListener('error', (e) => {
                console.error('Application error:', e.error);
            });

            window.addEventListener('unhandledrejection', (e) => {
                console.error('Unhandled promise rejection:', e.reason);
            });
        }
    };

    // Make search handler globally accessible
    window.SearchManager = SearchManager;

    // Initialize the application
    App.init();
});