// Common JavaScript for navigation, theme, and language management
document.addEventListener('DOMContentLoaded', () => {
    let currentLanguage = localStorage.getItem('language') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Initialize all functionality
    initializeNavigation();
    initializeTheme();
    initializeLanguage();
    initializeOldWebsiteLanguageModal();
    initializeThemeSwitcher();
    initializeCopyButtons();
    addBackHomeButton();

    function initializeNavigation() {
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');

        if (burgerIcon && navMenu) {
            burgerIcon.addEventListener('click', (e) => {
                e.stopPropagation();
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
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    function initializeLanguage() {
        changeLanguage(currentLanguage);
    }

    function initializeOldWebsiteLanguageModal() {
        const languageModal = document.getElementById('language-selection-modal');
        const languageOptions = document.querySelectorAll('.language-option-old');
        const selectButtons = document.querySelectorAll('.select-language-btn');
        
        // Check if user has already selected a language
        const languageSelected = localStorage.getItem('language-selected');
        
        if (languageSelected === 'true') {
            // Hide modal if language already selected
            if (languageModal) {
                languageModal.classList.remove('visible');
                languageModal.style.display = 'none';
            }
            return;
        }

        // Show modal if no language selection has been made
        if (languageModal) {
            languageModal.classList.add('visible');
            languageModal.style.display = 'flex';
            
            // Make sure it's on top and blocks everything
            languageModal.style.zIndex = '9999';
            languageModal.style.position = 'fixed';
            languageModal.style.top = '0';
            languageModal.style.left = '0';
            languageModal.style.width = '100%';
            languageModal.style.height = '100%';
        }

        // Add event listeners to language options (click anywhere on the option)
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Don't trigger if the click was on the button (handled separately)
                if (!e.target.classList.contains('select-language-btn') && !e.target.closest('.select-language-btn')) {
                    const selectedLang = option.getAttribute('data-lang');
                    selectLanguage(selectedLang);
                }
            });
        });

        // Add event listeners to select buttons
        selectButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the parent option click
                const option = button.closest('.language-option-old');
                const selectedLang = option.getAttribute('data-lang');
                selectLanguage(selectedLang);
            });
        });

        function selectLanguage(lang) {
            localStorage.setItem('language-selected', 'true');
            changeLanguage(lang);
            
            // Hide modal with animation
            if (languageModal) {
                languageModal.style.animation = 'modalDisappear 0.3s ease-in forwards';
                setTimeout(() => {
                    languageModal.style.display = 'none';
                }, 300);
            }
        }
    }

    function initializeThemeSwitcher() {
        const themeSwitchBtn = document.getElementById('theme-switch-btn');
        const navThemeSwitcher = document.getElementById('nav-theme-switcher');
        const langSwitchBtn = document.getElementById('lang-switch-btn');
        const navLangSwitcher = document.getElementById('nav-lang-switcher');

        // Floating theme switcher
        if (themeSwitchBtn) {
            themeSwitchBtn.addEventListener('click', toggleTheme);
        }

        // Navigation theme switcher
        if (navThemeSwitcher) {
            navThemeSwitcher.addEventListener('click', toggleTheme);
        }

        // Floating language switcher
        if (langSwitchBtn) {
            langSwitchBtn.addEventListener('click', () => {
                const newLang = currentLanguage === 'en' ? 'gr' : 'en';
                changeLanguage(newLang);
            });
        }

        // Navigation language switcher
        if (navLangSwitcher) {
            navLangSwitcher.addEventListener('click', () => {
                const newLang = currentLanguage === 'en' ? 'gr' : 'en';
                changeLanguage(newLang);
            });
        }
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        
        if (currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        // Update theme button icon
        const themeButtons = document.querySelectorAll('#theme-switch-btn, #nav-theme-switcher i');
        themeButtons.forEach(button => {
            button.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }

    function initializeCopyButtons() {
        // Add event listeners to all copy buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
                const copyBtn = e.target.classList.contains('copy-btn') ? e.target : e.target.closest('.copy-btn');
                const targetId = copyBtn.getAttribute('data-target');
                if (targetId) {
                    copyToClipboard(copyBtn, targetId);
                }
            }
        });
    }

    function addBackHomeButton() {
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            // Remove existing back button if any
            const existingBackHome = document.querySelector('.back-home');
            if (existingBackHome) existingBackHome.remove();

            const backHomeDiv = document.createElement('div');
            backHomeDiv.className = 'back-home';
            backHomeDiv.innerHTML = `
                <a href="index.html" class="back-home-btn" title="Back to Home">
                    <i class="fas fa-home"></i>
                </a>
            `;
            document.body.appendChild(backHomeDiv);
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
            const shouldShow = el.dataset.langSection === lang;
            el.style.display = shouldShow ? 'block' : 'none';
            el.classList.toggle('hidden', !shouldShow);
            if (shouldShow) {
                el.classList.remove('hidden-by-default');
            }
        });

        updatePageTitle(lang);
        updatePlaceholders(lang);
    };

    function updateElementLanguage(element, lang) {
        const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
        if (!text) return;

        // Check if element has direct text content
        const hasDirectText = Array.from(element.childNodes).some(node => 
            node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
        );
        
        if (hasDirectText) {
            // Replace only text nodes
            Array.from(element.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    node.textContent = text;
                }
            });
        } else {
            // Replace all content
            element.textContent = text;
        }
    }

    function updatePlaceholders(lang) {
        // Update search input placeholder
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
        }

        // Update certificate form placeholders
        const formInputs = document.querySelectorAll('#certificate-form input');
        formInputs.forEach(input => {
            const fieldName = input.id;
            const placeholders = {
                'firstName': { en: 'Enter your first name', gr: 'Εισάγετε το όνομά σας' },
                'lastName': { en: 'Enter your last name', gr: 'Εισάγετε το επώνυμό σας' },
                'age': { en: 'Enter your age', gr: 'Εισάγετε την ηλικία σας' },
                'country': { en: 'Enter your country', gr: 'Εισάγετε τη χώρα σας' },
                'city': { en: 'Enter your city', gr: 'Εισάγετε την πόλη σας' }
            };
            
            if (placeholders[fieldName]) {
                input.placeholder = placeholders[fieldName][lang];
            }
        });
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
        document.body.style.overflow = 'hidden';
    };

    window.hideModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    };

    // Copy to clipboard function - FIXED
    window.copyToClipboard = (button, targetId) => {
        const codeElement = document.getElementById(targetId);
        if (!codeElement) {
            console.warn('Element not found:', targetId);
            return;
        }

        const textToCopy = codeElement.textContent || codeElement.innerText;
        
        if (!navigator.clipboard) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showCopyFeedback(button, true);
            } catch (err) {
                showCopyFeedback(button, false);
            }
            document.body.removeChild(textArea);
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback(button, true);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showCopyFeedback(button, false);
        });
    };

    function showCopyFeedback(button, success) {
        const originalText = button.textContent;
        const currentLang = localStorage.getItem('language') || 'en';
        
        if (success) {
            button.textContent = currentLang === 'gr' ? 'Αντιγράφηκε!' : 'Copied!';
            button.classList.add('copied');
        } else {
            button.textContent = currentLang === 'gr' ? 'Απέτυχε!' : 'Failed!';
            button.classList.add('failed');
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied', 'failed');
        }, 1500);
    }
});