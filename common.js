[file name]: common.js
[file content begin]
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
    const navMenu = document.getElementById('nav-menu');
    
    if (!burgerIcon || !navMenu) {
        console.warn('Burger menu elements not found');
        return;
    }
    
    console.log('Burger menu elements found, setting up event listeners...');
    
    // Click event for burger icon
    burgerIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Burger icon clicked');
        
        // Toggle active class on burger icon
        this.classList.toggle('active');
        
        // Toggle active class on nav menu
        navMenu.classList.toggle('active');
        
        console.log('Burger menu toggled:', navMenu.classList.contains('active'));
    });
    
    // Close menu when clicking anywhere outside
    document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active') && 
            !burgerIcon.contains(e.target) && 
            !navMenu.contains(e.target)) {
            
            console.log('Closing burger menu (clicked outside)');
            burgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Close menu when clicking on nav items
    const navItems = navMenu.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Nav item clicked, closing menu');
            burgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            console.log('Closing burger menu (Escape key)');
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
    
    // Apply saved language on page load
    applyLanguage(currentLanguage);
    
    // Make function globally available
    window.changeLanguage = function(lang) {
        console.log('Changing language to:', lang);
        currentLanguage = lang;
        localStorage.setItem('dedsec-language', lang);
        applyLanguage(lang);
    };
    
    function applyLanguage(lang) {
        console.log('Applying language:', lang);
        
        // Update elements with data attributes
        document.querySelectorAll('[data-en]').forEach(element => {
            const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
            
            if (text) {
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
                } else {
                    // Update span content if it exists
                    const span = element.querySelector('span');
                    if (span && span.textContent.trim().length > 0) {
                        span.textContent = text;
                    } else {
                        element.textContent = text;
                    }
                }
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
        
        // Update language buttons if they exist
        document.querySelectorAll('.language-button').forEach(button => {
            button.classList.toggle('selected', button.dataset.lang === lang);
        });
        
        // Update search placeholders
        updateSearchPlaceholders(lang);
        
        // Update document language
        document.documentElement.lang = lang;
        
        console.log('Language applied successfully:', lang);
    }
    
    function updateSearchPlaceholders(lang) {
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
        }
        
        const usefulInfoSearch = document.getElementById('useful-info-search-input');
        if (usefulInfoSearch) {
            usefulInfoSearch.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
        }
    }
    
    console.log('Language switching initialized');
}

// Copy to Clipboard Functionality
function initializeCopyButtons() {
    console.log('Initializing copy buttons...');
    
    // Make copy function globally available
    window.copyToClipboard = function(button, targetId) {
        console.log('Copy button clicked for:', targetId);
        
        const codeElement = document.getElementById(targetId);
        if (!codeElement) {
            console.error('Target element not found:', targetId);
            showCopyFeedback(button, 'Error');
            return;
        }
        
        if (!navigator.clipboard) {
            console.warn('Clipboard API not available');
            // Fallback for older browsers
            fallbackCopyToClipboard(codeElement.innerText, button);
            return;
        }
        
        const originalText = button.textContent;
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            console.log('Text copied successfully');
            showCopyFeedback(button, 'Copied!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showCopyFeedback(button, 'Failed!');
        });
    };
    
    function fallbackCopyToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            console.log('Text copied using fallback method');
            showCopyFeedback(button, 'Copied!');
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            showCopyFeedback(button, 'Failed!');
        }
        document.body.removeChild(textArea);
    }
    
    function showCopyFeedback(button, message) {
        const currentLanguage = localStorage.getItem('dedsec-language') || 'en';
        const translatedMessage = currentLanguage === 'gr' ? 
            (message === 'Copied!' ? 'Αντιγράφηκε!' : 
             message === 'Error' ? 'Σφάλμα' : 'Απέτυχε!') : message;
        
        const originalText = button.textContent;
        button.textContent = translatedMessage;
        
        setTimeout(() => {
            const resetText = currentLanguage === 'gr' ? 'Αντιγραφή' : 'Copy';
            button.textContent = resetText;
        }, 1500);
    }
    
    // Initialize existing copy buttons that don't have onclick
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
    
    console.log('Copy buttons initialized');
}

// Theme Switcher Functionality
function initializeThemeSwitcher() {
    console.log('Initializing theme switcher...');
    
    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    
    if (!themeSwitcherBtn) {
        console.log('Theme switcher button not found on this page');
        return;
    }
    
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
        console.log('Theme changed to:', isLight ? 'light' : 'dark');
    });
    
    function updateThemeButton() {
        const isLight = document.body.classList.contains('light-theme');
        if (isLight) {
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            if (themeSpan) {
                themeSpan.setAttribute('data-en', 'Light Theme');
                themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
                const currentLang = localStorage.getItem('dedsec-language') || 'en';
                themeSpan.textContent = themeSpan.getAttribute(`data-${currentLang}`) || 'Light Theme';
            }
        } else {
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            if (themeSpan) {
                themeSpan.setAttribute('data-en', 'Dark Theme');
                themeSpan.setAttribute('data-gr', 'Σκοτεινό Θέμα');
                const currentLang = localStorage.getItem('dedsec-language') || 'en';
                themeSpan.textContent = themeSpan.getAttribute(`data-${currentLang}`) || 'Dark Theme';
            }
        }
    }
    
    console.log('Theme switcher initialized');
}

// Modal Management
function initializeModals() {
    console.log('Initializing modals...');
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                console.log('Closing modal (clicked outside)');
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
                console.log('Closing modal (close button)');
                modal.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const visibleModals = document.querySelectorAll('.modal-overlay.visible');
            if (visibleModals.length > 0) {
                console.log('Closing modals (Escape key)');
                visibleModals.forEach(modal => {
                    modal.classList.remove('visible');
                    document.body.style.overflow = '';
                });
            }
        }
    });
    
    console.log('Modals initialized');
}

// Utility functions for external use
window.dedSecCommon = {
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('visible');
            document.body.style.overflow = 'hidden';
            console.log('Modal opened:', modalId);
        }
    },
    
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('visible');
            document.body.style.overflow = '';
            console.log('Modal closed:', modalId);
        }
    },
    
    toggleBurgerMenu: function() {
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');
        if (burgerIcon && navMenu) {
            burgerIcon.classList.toggle('active');
            navMenu.classList.toggle('active');
        }
    }
};

console.log('DedSec Common JS loaded successfully');
[file content end]