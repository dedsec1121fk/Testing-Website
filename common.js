document.addEventListener('DOMContentLoaded', () => {
    // Global state
    let currentLanguage = 'en';

    // Initialize all functionality
    initializeBurgerMenu();
    initializeLanguageSwitcher();
    initializeThemeSwitcher();

    // Show language modal on load
    showLanguageModal();

    // Burger Menu functionality - Fixed
    function initializeBurgerMenu() {
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');

        if (burgerIcon && navMenu) {
            burgerIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                burgerIcon.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !burgerIcon.contains(e.target)) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });

            // Close menu when clicking a link
            navMenu.querySelectorAll('.nav-item').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                });
            });
        }
    }

    // Show language modal on page load
    function showLanguageModal() {
        const langModal = document.getElementById('language-selection-modal');
        if (langModal) {
            langModal.classList.add('visible');
        }
    }

    // Language switching functionality - Fixed
    function initializeLanguageSwitcher() {
        const langModal = document.getElementById('language-selection-modal');
        const langButtons = document.querySelectorAll('.language-button');
        const langSwitcherBtn = document.getElementById('lang-switcher-btn');

        // Change language function
        window.changeLanguage = (lang) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            // Update all elements with data attributes
            document.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                if (el.children.length === 0) {
                    el.textContent = text;
                } else {
                    // Handle elements with children but direct text content
                    const textNodes = Array.from(el.childNodes).filter(node => 
                        node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                    );
                    if (textNodes.length > 0) {
                        textNodes[0].textContent = text;
                    } else {
                        // Fallback: replace entire content
                        const span = el.querySelector('span');
                        if (span) {
                            span.textContent = text;
                        } else {
                            el.textContent = text;
                        }
                    }
                }
            });

            // Update lang sections
            document.querySelectorAll('[data-lang-section]').forEach(el => {
                const shouldShow = el.dataset.langSection === lang;
                el.classList.toggle('hidden', !shouldShow);
                el.classList.toggle('hidden-by-default', !shouldShow);
            });

            // Update search placeholder
            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
            }

            // Update button states
            document.querySelectorAll('.language-button').forEach(button => {
                button.classList.toggle('selected', button.dataset.lang === lang);
            });

            // Update theme button text
            updateThemeButtonText();
        };

        // Language modal functionality
        if (langModal) {
            const closeModal = () => {
                langModal.classList.remove('visible');
                // Save language preference
                localStorage.setItem('preferredLanguage', currentLanguage);
            };
            
            langModal.addEventListener('click', e => {
                if (e.target === langModal) closeModal();
            });
            
            langModal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        }

        // Language button functionality
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
                if (langModal) langModal.classList.remove('visible');
            });
        });

        // Language switcher in burger menu
        if (langSwitcherBtn) {
            langSwitcherBtn.addEventListener('click', () => {
                showLanguageModal();
                // Close burger menu
                const navMenu = document.getElementById('nav-menu');
                const burgerIcon = document.getElementById('burger-icon');
                if (navMenu && burgerIcon) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });
        }

        // Check for saved language preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && langModal) {
            changeLanguage(savedLanguage);
            langModal.classList.remove('visible');
        }
    }

    // Theme switching functionality - Fixed
    function initializeThemeSwitcher() {
        const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
        
        const updateThemeButtonText = () => {
            if (themeSwitcherBtn) {
                const themeIcon = themeSwitcherBtn.querySelector('i');
                const themeSpan = themeSwitcherBtn.querySelector('span');
                const isLight = document.body.classList.contains('light-theme');
                
                if (isLight) {
                    themeIcon.className = 'fas fa-sun';
                    themeSpan.setAttribute('data-en', 'Light Theme');
                    themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
                } else {
                    themeIcon.className = 'fas fa-moon';
                    themeSpan.setAttribute('data-en', 'Dark Theme');
                    themeSpan.setAttribute('data-gr', 'Σκούρο Θέμα');
                }
                
                // Update text content
                const text = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
                themeSpan.textContent = text;
            }
        };

        if (themeSwitcherBtn) {
            themeSwitcherBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButtonText();
                
                // Close burger menu after theme change
                const navMenu = document.getElementById('nav-menu');
                const burgerIcon = document.getElementById('burger-icon');
                if (navMenu && burgerIcon) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });
            
            // Set initial theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
            }
            updateThemeButtonText();
        }
    }

    // Copy to clipboard functionality for other pages
    window.copyToClipboard = (button, targetId) => {
        const codeElement = document.getElementById(targetId);
        if (!codeElement || !navigator.clipboard) {
            console.warn('Clipboard not available');
            return;
        }
        
        const originalText = button.textContent;
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            button.textContent = currentLanguage === 'gr' ? 'Αντιγράφηκε!' : 'Copied!';
            setTimeout(() => { 
                button.textContent = originalText; 
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy:', err);
            button.textContent = 'Error!';
            setTimeout(() => { 
                button.textContent = originalText; 
            }, 1500);
        });
    };
});