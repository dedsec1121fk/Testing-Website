[file name]: common.js
[file content begin]
// Common JavaScript for DedSec Project

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Burger Menu
    initializeBurgerMenu();
    
    // Initialize Language Switching
    initializeLanguageSwitching();
    
    // Initialize Copy Buttons
    initializeCopyButtons();
    
    // Initialize Theme Switcher
    initializeThemeSwitcher();
});

// Burger Menu Functionality
function initializeBurgerMenu() {
    const burgerIcon = document.getElementById('burger-icon');
    const navMenu = document.getElementById('nav-menu');
    
    if (burgerIcon && navMenu) {
        burgerIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!burgerIcon.contains(e.target) && !navMenu.contains(e.target)) {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a nav item
        const navItems = navMenu.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Language Switching Functionality
function initializeLanguageSwitching() {
    let currentLanguage = localStorage.getItem('dedsec-language') || 'en';
    
    // Apply saved language on page load
    applyLanguage(currentLanguage);
    
    // Language change handler
    window.changeLanguage = function(lang) {
        currentLanguage = lang;
        localStorage.setItem('dedsec-language', lang);
        applyLanguage(lang);
    };
    
    function applyLanguage(lang) {
        // Update all elements with data attributes
        document.querySelectorAll('[data-en]').forEach(element => {
            const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
            
            // Check if element has direct text content
            const hasDirectText = Array.from(element.childNodes).some(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
            );
            
            if (hasDirectText) {
                // Update direct text nodes
                Array.from(element.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                        node.textContent = text;
                    }
                });
            } else if (element.children.length === 0) {
                // Update element text content
                element.textContent = text;
            }
        });
        
        // Handle language-specific sections
        document.querySelectorAll('[data-lang-section]').forEach(section => {
            const shouldShow = section.dataset.langSection === lang;
            section.style.display = shouldShow ? 'block' : 'none';
            section.classList.toggle('hidden', !shouldShow);
            
            if (shouldShow) {
                section.classList.remove('hidden-by-default');
            }
        });
        
        // Update language buttons
        document.querySelectorAll('.language-button').forEach(button => {
            button.classList.toggle('selected', button.dataset.lang === lang);
        });
        
        // Update search placeholders
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
        }
        
        // Update useful info search placeholder
        const usefulInfoSearch = document.getElementById('useful-info-search-input');
        if (usefulInfoSearch) {
            usefulInfoSearch.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
        }
        
        // Update document language
        document.documentElement.lang = lang;
    }
}

// Copy to Clipboard Functionality
function initializeCopyButtons() {
    // Make copy function globally available
    window.copyToClipboard = function(button, targetId) {
        const codeElement = document.getElementById(targetId);
        if (!codeElement || !navigator.clipboard) {
            console.warn('Clipboard API not available or element not found.');
            showCopyFeedback(button, 'Error');
            return;
        }
        
        const originalText = button.textContent;
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            showCopyFeedback(button, 'Copied!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showCopyFeedback(button, 'Failed!');
        });
    };
    
    function showCopyFeedback(button, message) {
        const currentLanguage = localStorage.getItem('dedsec-language') || 'en';
        const translatedMessage = currentLanguage === 'gr' ? 
            (message === 'Copied!' ? 'Αντιγράφηκε!' : 
             message === 'Error' ? 'Σφάλμα' : 'Απέτυχε!') : message;
        
        button.textContent = translatedMessage;
        setTimeout(() => {
            button.textContent = currentLanguage === 'gr' ? 'Αντιγραφή' : 'Copy';
        }, 1500);
    }
    
    // Initialize existing copy buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        if (!button.hasAttribute('onclick')) {
            const codeContainer = button.closest('.code-container');
            if (codeContainer) {
                const codeElement = codeContainer.querySelector('code');
                if (codeElement) {
                    if (!codeElement.id) {
                        codeElement.id = 'code-' + Math.random().toString(36).substr(2, 9);
                    }
                    button.addEventListener('click', () => {
                        window.copyToClipboard(button, codeElement.id);
                    });
                }
            }
        }
    });
}

// Theme Switcher Functionality
function initializeThemeSwitcher() {
    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    
    if (themeSwitcherBtn) {
        const themeIcon = themeSwitcherBtn.querySelector('i');
        const themeSpan = themeSwitcherBtn.querySelector('span');
        
        // Set initial theme based on localStorage or system preference
        const savedTheme = localStorage.getItem('dedsec-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
            document.body.classList.add('light-theme');
        }
        
        updateThemeButton();
        
        themeSwitcherBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('dedsec-theme', isLight ? 'light' : 'dark');
            updateThemeButton();
        });
        
        function updateThemeButton() {
            const isLight = document.body.classList.contains('light-theme');
            if (isLight) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                if (themeSpan) {
                    themeSpan.setAttribute('data-en', 'Light Theme');
                    themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
                    themeSpan.textContent = themeSpan.getAttribute(`data-${localStorage.getItem('dedsec-language') || 'en'}`) || 'Light Theme';
                }
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                if (themeSpan) {
                    themeSpan.setAttribute('data-en', 'Dark Theme');
                    themeSpan.setAttribute('data-gr', 'Σκοτεινό Θέμα');
                    themeSpan.textContent = themeSpan.getAttribute(`data-${localStorage.getItem('dedsec-language') || 'en'}`) || 'Dark Theme';
                }
            }
        }
    }
}

// Utility function for modal operations
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

// Initialize modals
function initializeModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close modals when clicking close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.visible').forEach(modal => {
                modal.classList.remove('visible');
                document.body.style.overflow = '';
            });
        }
    });
}

// Initialize everything when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModals);
} else {
    initializeModals();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeBurgerMenu,
        initializeLanguageSwitching,
        initializeCopyButtons,
        initializeThemeSwitcher,
        openModal,
        closeModal
    };
}
[file content end]