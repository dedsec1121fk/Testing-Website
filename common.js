// Common JavaScript for navigation, theme, and language management
document.addEventListener('DOMContentLoaded', () => {
    let currentLanguage = localStorage.getItem('language') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Initialize navigation
    initializeNavigation();

    // Initialize theme
    initializeTheme();

    // Initialize language
    initializeLanguage();

    // Add back to home button if not on index page
    if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        addBackHomeButton();
    }

    // Add language switcher
    addLanguageSwitcher();

    function initializeNavigation() {
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');

        if (burgerIcon && navMenu) {
            burgerIcon.addEventListener('click', () => {
                burgerIcon.classList.toggle('open');
                navMenu.classList.toggle('open');
            });

            // Close menu when clicking on a link
            const navItems = navMenu.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    burgerIcon.classList.remove('open');
                    navMenu.classList.remove('open');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!burgerIcon.contains(e.target) && !navMenu.contains(e.target)) {
                    burgerIcon.classList.remove('open');
                    navMenu.classList.remove('open');
                }
            });
        }

        // Set active page in navigation
        setActiveNavItem();
    }

    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function initializeTheme() {
        // Apply saved theme
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        // Theme switcher functionality
        const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
        if (themeSwitcherBtn) {
            const themeIcon = themeSwitcherBtn.querySelector('i');
            const themeSpan = themeSwitcherBtn.querySelector('span');

            const updateThemeButton = (isLightTheme) => {
                if (isLightTheme) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                    themeSpan.setAttribute('data-en', 'Light Theme');
                    themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                    themeSpan.setAttribute('data-en', 'Dark Theme');
                    themeSpan.setAttribute('data-gr', 'Σκοτεινό Θέμα');
                }
                updateElementLanguage(themeSpan, currentLanguage);
            };

            themeSwitcherBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButton(isLight);
            });
            
            updateThemeButton(document.body.classList.contains('light-theme'));
        }
    }

    function initializeLanguage() {
        // Apply saved language
        changeLanguage(currentLanguage);

        // Language modal functionality
        const languageModal = document.getElementById('language-selection-modal');
        if (languageModal) {
            languageModal.querySelectorAll('.language-button').forEach(button => {
                button.addEventListener('click', () => {
                    changeLanguage(button.dataset.lang);
                    if (languageModal.classList.contains('visible')) {
                        hideModal(languageModal);
                    }
                });
            });
        }
    }

    function addBackHomeButton() {
        const backHomeDiv = document.createElement('div');
        backHomeDiv.className = 'back-home';
        backHomeDiv.innerHTML = `
            <a href="index.html" class="back-home-btn" title="Back to Home">
                <i class="fas fa-home"></i>
            </a>
        `;
        document.body.appendChild(backHomeDiv);
    }

    function addLanguageSwitcher() {
        const langSwitcherDiv = document.createElement('div');
        langSwitcherDiv.className = 'lang-switcher-container';
        langSwitcherDiv.innerHTML = `
            <button class="lang-switcher-btn" id="lang-switcher-btn" title="Change Language">
                <i class="fas fa-globe"></i>
            </button>
        `;
        document.body.appendChild(langSwitcherDiv);

        const langBtn = document.getElementById('lang-switcher-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                // Toggle between English and Greek
                const newLang = currentLanguage === 'en' ? 'gr' : 'en';
                changeLanguage(newLang);
            });
        }
    }

    // Global language change function
    window.changeLanguage = (lang) => {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        
        // Update all elements with data attributes
        document.querySelectorAll('[data-en]').forEach(el => {
            updateElementLanguage(el, lang);
        });

        // Update language sections
        document.querySelectorAll('[data-lang-section]').forEach(el => {
            el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
            el.classList.toggle('hidden', el.dataset.langSection !== lang);
            if (el.dataset.langSection === lang) {
                el.classList.remove('hidden-by-default');
            }
        });

        // Update navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            updateElementLanguage(item, lang);
        });

        // Update page title based on current page
        updatePageTitle(lang);
    };

    function updateElementLanguage(element, lang) {
        const hasDirectText = Array.from(element.childNodes).some(node => 
            node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
        );
        
        if (hasDirectText) {
            const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
            Array.from(element.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    node.textContent = text;
                }
            });
        } else if (element.children.length === 0) {
            const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
            element.textContent = text;
        }
    }

    function updatePageTitle(lang) {
        const pageTitles = {
            'index.html': {
                en: 'DedSec Project - 1 Year Anniversary',
                gr: 'DedSec Project - 1 Χρόνο Επέτειος'
            },
            'learn.html': {
                en: 'Learn About The Tools - DedSec Project',
                gr: 'Μάθετε για τα Εργαλεία - DedSec Project'
            },
            'installation.html': {
                en: 'Installation Guide - DedSec Project',
                gr: 'Οδηγός Εγκατάστασης - DedSec Project'
            },
            'useful-info.html': {
                en: 'Useful Information - DedSec Project',
                gr: 'Χρήσιμες Πληροφορίες - DedSec Project'
            },
            'collaborations.html': {
                en: 'Collaborations - DedSec Project',
                gr: 'Συνεργασίες - DedSec Project'
            },
            'portfolio.html': {
                en: 'Portfolio & GitHub - DedSec Project',
                gr: 'Portfolio & GitHub - DedSec Project'
            },
            'contact.html': {
                en: 'Contact & Credits - DedSec Project',
                gr: 'Επικοινωνία & Συντελεστές - DedSec Project'
            },
            'privacy.html': {
                en: 'Privacy Policy - DedSec Project',
                gr: 'Πολιτική Απορρήτου - DedSec Project'
            }
        };

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const title = pageTitles[currentPage]?.[lang] || pageTitles['index.html'][lang];
        if (title) {
            document.title = title;
        }
    }

    // Modal functions
    window.showModal = (modal) => {
        if (!modal) return;
        modal.classList.add('visible');
    };

    window.hideModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('visible');
    };

    // Copy to clipboard function
    window.copyToClipboard = (button, targetId) => {
        const codeElement = document.getElementById(targetId);
        if (!codeElement || !navigator.clipboard) {
            console.warn('Clipboard API not available or element not found.');
            button.textContent = currentLanguage === 'gr' ? 'Σφάλμα' : 'Error';
            setTimeout(() => { 
                button.textContent = currentLanguage === 'gr' ? 'Αντιγραφή' : 'Copy'; 
            }, 1500);
            return;
        }
        
        const originalText = button.textContent;
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            button.textContent = currentLanguage === 'gr' ? 'Αντιγράφηκε!' : 'Copied!';
            setTimeout(() => { button.textContent = originalText; }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            button.textContent = currentLanguage === 'gr' ? 'Απέτυχε!' : 'Failed!';
            setTimeout(() => { button.textContent = originalText; }, 1500);
        });
    };
});