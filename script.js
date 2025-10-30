/**
 * DEDSEC PROJECT - PROFESSIONAL WEBSITE SCRIPT
 * VERSION: 3.0 (Professional Redesign)
 * FEATURES: Performance optimization, enhanced security, lavender theme
 */

// Performance optimization - Load critical functions immediately
(function() {
    'use strict';
    
    // Performance monitoring
    const perfMark = (name) => {
        if (window.performance && performance.mark) {
            performance.mark(name);
        }
    };
    
    const perfMeasure = (name, startMark, endMark) => {
        if (window.performance && performance.measure) {
            performance.measure(name, startMark, endMark);
        }
    };
    
    // Start performance monitoring
    perfMark('script-start');
    
    // Security: Content Security Policy helper
    const security = {
        sanitizeHTML: (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        
        validateURL: (url) => {
            try {
                const parsed = new URL(url, window.location.origin);
                return ['http:', 'https:'].includes(parsed.protocol);
            } catch {
                return false;
            }
        },
        
        escapeRegex: (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
    };
    
    // State management
    const state = {
        currentLanguage: localStorage.getItem('dedsec-language') || 'en',
        currentTheme: localStorage.getItem('dedsec-theme') || 'dark',
        disclaimerAccepted: localStorage.getItem('dedsec-disclaimer-accepted') === 'true',
        isMobile: window.innerWidth <= 768,
        isScrolled: false
    };
    
    // Cache DOM elements for performance
    const domCache = {
        body: document.body,
        header: document.querySelector('.main-header'),
        burgerMenu: document.getElementById('burger-menu'),
        navLinks: document.querySelector('.nav-links'),
        themeSwitcher: document.getElementById('nav-theme-switcher'),
        langSwitcher: document.getElementById('nav-lang-switcher'),
        languageModal: document.getElementById('language-selection-modal'),
        disclaimerModal: document.getElementById('disclaimer-modal'),
        acceptDisclaimer: document.getElementById('accept-disclaimer'),
        declineDisclaimer: document.getElementById('decline-disclaimer')
    };
    
    // Performance: Debounce function
    const debounce = (func, wait, immediate) => {
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
    };
    
    // Theme management
    const themeManager = {
        init() {
            this.applyTheme(state.currentTheme);
            this.bindEvents();
        },
        
        applyTheme(theme) {
            state.currentTheme = theme;
            domCache.body.classList.toggle('light-theme', theme === 'light');
            localStorage.setItem('dedsec-theme', theme);
            
            // Update theme switcher icon
            const icon = domCache.themeSwitcher?.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            // Update meta theme color
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.content = theme === 'light' ? '#f9fafb' : '#111827';
            }
        },
        
        toggleTheme() {
            const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
        },
        
        bindEvents() {
            if (domCache.themeSwitcher) {
                domCache.themeSwitcher.addEventListener('click', () => this.toggleTheme());
            }
        }
    };
    
    // Language management
    const languageManager = {
        init() {
            this.applyLanguage(state.currentLanguage);
            this.bindEvents();
        },
        
        applyLanguage(lang) {
            state.currentLanguage = lang;
            localStorage.setItem('dedsec-language', lang);
            
            // Update all elements with data-en and data-gr attributes
            document.querySelectorAll('[data-en], [data-gr]').forEach(element => {
                const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
                if (text && element.textContent !== text) {
                    element.textContent = security.sanitizeHTML(text);
                }
            });
            
            // Handle language-specific sections
            document.querySelectorAll('[data-lang-section]').forEach(section => {
                section.classList.toggle('hidden-by-default', 
                    section.getAttribute('data-lang-section') !== lang);
            });
            
            // Update HTML lang attribute
            document.documentElement.lang = lang;
        },
        
        showLanguageModal() {
            if (domCache.languageModal) {
                domCache.languageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        hideLanguageModal() {
            if (domCache.languageModal) {
                domCache.languageModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },
        
        bindEvents() {
            // Language switcher button
            if (domCache.langSwitcher) {
                domCache.langSwitcher.addEventListener('click', () => this.showLanguageModal());
            }
            
            // Language selection buttons
            document.querySelectorAll('.language-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const lang = e.target.getAttribute('data-lang');
                    if (lang) {
                        this.applyLanguage(lang);
                        this.hideLanguageModal();
                    }
                });
            });
            
            // Close modal buttons
            document.querySelectorAll('.close-modal').forEach(button => {
                button.addEventListener('click', () => this.hideLanguageModal());
            });
            
            // Close modal on overlay click
            if (domCache.languageModal) {
                domCache.languageModal.addEventListener('click', (e) => {
                    if (e.target === domCache.languageModal) {
                        this.hideLanguageModal();
                    }
                });
            }
        }
    };
    
    // Navigation management
    const navigationManager = {
        init() {
            this.bindEvents();
            this.handleScroll();
        },
        
        toggleMobileMenu() {
            if (domCache.burgerMenu && domCache.navLinks) {
                domCache.burgerMenu.classList.toggle('active');
                domCache.navLinks.classList.toggle('active');
                document.body.style.overflow = domCache.navLinks.classList.contains('active') ? 'hidden' : '';
            }
        },
        
        closeMobileMenu() {
            if (domCache.burgerMenu && domCache.navLinks) {
                domCache.burgerMenu.classList.remove('active');
                domCache.navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        },
        
        handleScroll: debounce(() => {
            const scrollY = window.scrollY;
            const isScrolled = scrollY > 100;
            
            if (isScrolled !== state.isScrolled) {
                state.isScrolled = isScrolled;
                if (domCache.header) {
                    domCache.header.style.background = isScrolled 
                        ? state.currentTheme === 'light'
                            ? 'rgba(249, 250, 251, 0.95)'
                            : 'rgba(17, 24, 39, 0.95)'
                        : 'transparent';
                }
            }
        }, 10),
        
        bindEvents() {
            // Mobile menu toggle
            if (domCache.burgerMenu) {
                domCache.burgerMenu.addEventListener('click', () => this.toggleMobileMenu());
            }
            
            // Close mobile menu on link click
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (state.isMobile) {
                        this.closeMobileMenu();
                    }
                });
            });
            
            // Scroll event
            window.addEventListener('scroll', this.handleScroll);
            
            // Resize event with debounce
            window.addEventListener('resize', debounce(() => {
                state.isMobile = window.innerWidth <= 768;
                if (!state.isMobile) {
                    this.closeMobileMenu();
                }
            }, 250));
        }
    };
    
    // Disclaimer management
    const disclaimerManager = {
        init() {
            if (!state.disclaimerAccepted) {
                this.showDisclaimer();
            }
            this.bindEvents();
        },
        
        showDisclaimer() {
            if (domCache.disclaimerModal) {
                domCache.disclaimerModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },
        
        hideDisclaimer() {
            if (domCache.disclaimerModal) {
                domCache.disclaimerModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },
        
        accept() {
            state.disclaimerAccepted = true;
            localStorage.setItem('dedsec-disclaimer-accepted', 'true');
            this.hideDisclaimer();
            
            // Track acceptance (you can add analytics here)
            console.log('Disclaimer accepted by user');
        },
        
        decline() {
            // Redirect to a safe page or show message
            window.location.href = 'https://google.com';
        },
        
        bindEvents() {
            if (domCache.acceptDisclaimer) {
                domCache.acceptDisclaimer.addEventListener('click', () => this.accept());
            }
            
            if (domCache.declineDisclaimer) {
                domCache.declineDisclaimer.addEventListener('click', () => this.decline());
            }
            
            // Disclaimer language switcher
            const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');
            if (disclaimerLangBtn) {
                disclaimerLangBtn.addEventListener('click', () => {
                    languageManager.showLanguageModal();
                });
            }
        }
    };
    
    // Performance optimizations
    const performanceManager = {
        init() {
            this.lazyLoadImages();
            this.preloadCriticalResources();
            this.optimizeAnimations();
        },
        
        lazyLoadImages() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },
        
        preloadCriticalResources() {
            // Preload above-the-fold images
            const criticalImages = [
                'https://raw.githubusercontent.com/dedsec1121fk/dedsec1121fk.github.io/main/Assets/Images/Logos/Custom%20Black%20Purple%20Fox%20Logo.png'
            ];
            
            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = src;
                link.as = 'image';
                document.head.appendChild(link);
            });
        },
        
        optimizeAnimations() {
            // Use will-change for elements that will animate
            document.querySelectorAll('.feature-card, .tool-card, .btn').forEach(el => {
                el.style.willChange = 'transform, opacity';
            });
        }
    };
    
    // Analytics (optional - respect user privacy)
    const analyticsManager = {
        init() {
            // Only initialize if user has accepted disclaimer
            if (state.disclaimerAccepted) {
                this.trackPageView();
                this.bindAnalyticsEvents();
            }
        },
        
        trackPageView() {
            // Basic page view tracking
            console.log('Page viewed:', window.location.pathname);
            
            // You can integrate with your analytics service here
            // Example: Google Analytics, Matomo, etc.
        },
        
        bindAnalyticsEvents() {
            // Track important user interactions
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a, button');
                if (target) {
                    this.trackEvent('click', target.textContent.trim() || target.getAttribute('aria-label'));
                }
            });
        },
        
        trackEvent(category, action) {
            console.log('Event tracked:', category, action);
            // Implement your analytics event tracking here
        }
    };
    
    // Error handling
    const errorHandler = {
        init() {
            window.addEventListener('error', this.handleError);
            window.addEventListener('unhandledrejection', this.handlePromiseRejection);
        },
        
        handleError(event) {
            console.error('Error occurred:', event.error);
            // You can send errors to your error tracking service here
        },
        
        handlePromiseRejection(event) {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        }
    };
    
    // Service Worker for PWA (optional)
    const serviceWorkerManager = {
        async init() {
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('ServiceWorker registered:', registration);
                } catch (error) {
                    console.log('ServiceWorker registration failed:', error);
                }
            }
        }
    };
    
    // Initialize everything when DOM is ready
    const init = () => {
        perfMark('dom-ready');
        
        // Initialize managers
        themeManager.init();
        languageManager.init();
        navigationManager.init();
        disclaimerManager.init();
        performanceManager.init();
        analyticsManager.init();
        errorHandler.init();
        
        // Optional: Initialize service worker for PWA
        // serviceWorkerManager.init();
        
        // Measure initialization performance
        perfMeasure('initialization', 'script-start', 'dom-ready');
        
        console.log('DedSec Project initialized successfully');
    };
    
    // Start initialization based on DOM readiness
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for global access if needed
    window.DedSecApp = {
        state,
        themeManager,
        languageManager,
        navigationManager,
        security
    };
})();

// Progressive enhancement for older browsers
if (!window.Promise) {
    // Load polyfill for older browsers
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js';
    document.head.appendChild(script);
}
