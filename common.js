// Common JavaScript for navigation, theme, and language management
document.addEventListener('DOMContentLoaded', () => {
    let currentLanguage = localStorage.getItem('language') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Initialize all functionality
    initializeNavigation();
    initializeTheme();
    initializeLanguage();
    addBackHomeButton();
    addLanguageSwitcher();

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

    function addLanguageSwitcher() {
        // Remove existing language switcher if any
        const existingLangSwitcher = document.querySelector('.lang-switcher-container');
        if (existingLangSwitcher) existingLangSwitcher.remove();

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
            const shouldShow = el.dataset.langSection === lang;
            el.style.display = shouldShow ? 'block' : 'none';
            el.classList.toggle('hidden', !shouldShow);
            if (shouldShow) {
                el.classList.remove('hidden-by-default');
            }
        });

        updatePageTitle(lang);
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
            button.style.background = '#00FF00';
            button.style.color = '#000000';
        } else {
            button.textContent = currentLang === 'gr' ? 'Απέτυχε!' : 'Failed!';
            button.style.background = '#FF0000';
            button.style.color = '#FFFFFF';
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 1500);
    }
});