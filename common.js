// Common JavaScript for navigation, theme, and language management
document.addEventListener('DOMContentLoaded', () => {
    let currentLanguage = localStorage.getItem('language') || 'en';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // --- Helper for Modals (Assumed missing) ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('visible');
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    // --- THEME LOGIC ---
    function setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
            currentTheme = 'light';
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            currentTheme = 'dark';
        }
    }

    // --- LANGUAGE LOGIC ---
    // Function to apply translations based on the currentLanguage and data attributes
    function applyLanguage() {
        document.documentElement.lang = currentLanguage;
        // Update all elements with data-en/data-gr attributes
        document.querySelectorAll('[data-en][data-gr]').forEach(el => {
            const translation = el.getAttribute(`data-${currentLanguage}`);
            if (!translation) return;

            // Check if the element is an input and update placeholder
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', translation);
            } 
            // Check if the element has an icon and a text span inside (like nav-switch), update the span
            else if (el.querySelector('i') && el.querySelector('span.nav-item-text')) {
                const span = el.querySelector('span.nav-item-text');
                if (span) span.textContent = translation;
            }
            // Fallback for general text content (H1, P, etc.)
            else {
                el.textContent = translation;
            }
        });
    }

    function setLanguage(lang) {
        if (lang === currentLanguage) {
             // Update selection state on language buttons
             document.querySelectorAll('.language-button').forEach(btn => {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
             return;
        }
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        applyLanguage();
        // Update selected class in the language modal
        document.querySelectorAll('.language-button').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    // --- INITIALIZERS from old files ---
    
    function initializeTheme() {
        // Apply saved theme on load
        setTheme(currentTheme); 
    }

    function initializeLanguage() {
        // Apply language on load
        setLanguage(currentLanguage);
    }

    function initializeOldThemeSwitcher() {
        const switchButton = document.getElementById('theme-switch');
        if (switchButton) {
            switchButton.addEventListener('click', () => {
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
            });
        }
    }
    
    function initializeOldLangSwitcher() {
        // This is for the button in the nav-menu to open the language modal
        const langSwitchButton = document.getElementById('lang-switch');
        if (langSwitchButton) {
            langSwitchButton.addEventListener('click', (e) => {
                e.preventDefault();
                openModal('language-prompt-modal');
            });
        }
    }

    // --- LANGUAGE PROMPT MODAL LOGIC (Old Website Style) ---
    function initializeOldWebsiteLanguageModal() {
        const modal = document.getElementById('language-prompt-modal');
        if (!modal) return;

        // 1. Show modal if no language is set in localStorage
        const languagePromptShown = localStorage.getItem('languagePromptShown');
        if (!currentLanguage || !languagePromptShown) {
            // Wait for 1 second before showing the prompt
            setTimeout(() => {
                openModal('language-prompt-modal');
            }, 1000); 
        }

        let selectedLang = currentLanguage; // Temp language selection
        
        // 2. Handle language selection buttons
        document.querySelectorAll('.language-button').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedLang = btn.getAttribute('data-lang');
                // Visually select
                document.querySelectorAll('.language-button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
            // Initial selection state
            if (btn.getAttribute('data-lang') === currentLanguage) {
                 btn.classList.add('selected');
            }
        });

        // 3. Handle confirm button
        document.getElementById('language-select-confirm')?.addEventListener('click', () => {
            if (selectedLang) {
                setLanguage(selectedLang);
                localStorage.setItem('languagePromptShown', 'true'); // Prevent showing again
                closeModal('language-prompt-modal');
            } else {
                alert('Please select a language.');
            }
        });
        
        // 4. Handle close button and click-outside logic
        const closeLogic = () => {
             // If they close it without selecting, keep the current language (default 'en')
             if (!localStorage.getItem('language')) {
                 setLanguage('en');
                 localStorage.setItem('languagePromptShown', 'true'); 
             }
             closeModal('language-prompt-modal');
        }

        modal.querySelector('.close-modal')?.addEventListener('click', closeLogic);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                 closeLogic();
            }
        });
    }

    // Initialize all functionality
    initializeNavigation();
    initializeTheme(); // MODIFIED/REDEFINED
    initializeLanguage(); // MODIFIED/REDEFINED
    initializeOldWebsiteLanguageModal(); // NEW
    initializeOldThemeSwitcher(); // NEW
    initializeOldLangSwitcher(); // NEW
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
        const navItems = document.querySelectorAll('.nav-menu .nav-item');
        
        navItems.forEach(item => {
            const itemPage = item.getAttribute('href').split('/').pop();
            item.classList.remove('active');
            if (itemPage === currentPage) {
                item.classList.add('active');
            }
        });
    }
    
    function initializeCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', handleCopyClick);
        });
    }

    function addBackHomeButton() {
        // Only show back-home-button on non-index pages
        if (window.location.pathname.split('/').pop() !== 'index.html' && document.body.querySelector('.phone-container')) {
            const btnContainer = document.createElement('div');
            btnContainer.classList.add('back-home-btn-container');
            
            const btn = document.createElement('a');
            btn.href = 'index.html';
            btn.classList.add('back-home-btn');
            btn.innerHTML = `<i class="fas fa-arrow-left"></i> <span data-en="Back to Home" data-gr="Επιστροφή στην Αρχική">Back to Home</span>`;
            
            btnContainer.appendChild(btn);
            document.body.querySelector('.phone-container').insertAdjacentElement('afterbegin', btnContainer);
        }
    }

    function handleCopyClick(event) {
        const button = event.currentTarget;
        const codeBlock = button.closest('.code-block');
        if (!codeBlock) return;

        const codeElement = codeBlock.querySelector('code');
        if (!codeElement) return;

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