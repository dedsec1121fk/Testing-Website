document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentLanguage = localStorage.getItem('language') || 'en';
    
    // --- UTILITY FUNCTIONS ---
    function updateThemeIcons(isLight) {
        const themeBtn = document.getElementById('nav-theme-switcher');
        const themeIcon = themeBtn?.querySelector('i');
        const themeSpan = themeBtn?.querySelector('span');
        
        if (themeIcon) {
            themeIcon.classList.toggle('fa-moon', !isLight);
            themeIcon.classList.toggle('fa-sun', isLight);
        }
        if (themeSpan) {
            themeSpan.setAttribute('data-en', isLight ? 'Dark Mode' : 'Light Mode');
            themeSpan.setAttribute('data-gr', isLight ? 'Σκοτεινό Θέμα' : 'Φωτεινό Θέμα');
        }
    }

    // --- NAVIGATION FUNCTIONALITY ---
    function initializeNavigation() {
        const burgerMenu = document.getElementById('burger-menu');
        const navMenu = document.getElementById('nav-menu');

        if (burgerMenu && navMenu) {
            burgerMenu.addEventListener('click', () => {
                burgerMenu.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (burgerMenu && navMenu) {
                    burgerMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (burgerMenu && navMenu && navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !burgerMenu.contains(e.target)) {
                    burgerMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    }

    // --- THEME SWITCHER ---
    function initializeThemeSwitcher() {
        const themeBtn = document.getElementById('nav-theme-switcher');
        
        // Initial setup based on localStorage
        const savedTheme = localStorage.getItem('theme');
        const isLight = savedTheme === 'light';
        document.body.classList.toggle('light-theme', isLight);
        updateThemeIcons(isLight);

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isCurrentlyLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('theme', isCurrentlyLight ? 'light' : 'dark');
                updateThemeIcons(isCurrentlyLight);
                // Re-apply language on theme change to update the theme span text
                changeLanguage(currentLanguage);
            });
        }
    }

    // --- LANGUAGE SWITCHER & TRANSLATION ---
    function changeLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);

        document.querySelectorAll('[data-en], [data-gr], [data-lang-section]').forEach(element => {
            const grText = element.getAttribute('data-gr');
            const enText = element.getAttribute('data-en');
            const langSection = element.getAttribute('data-lang-section');

            if (langSection) {
                // Handle full sections (e.g., disclaimer/footer content)
                element.classList.toggle('hidden-by-default', langSection !== lang);
            } else if (grText || enText) {
                // Handle individual elements
                const text = lang === 'gr' ? grText : enText;
                if (text !== null) {
                    element.textContent = text;
                }
                // Handle input placeholders and alt/title attributes if necessary
                if (element.placeholder) {
                    element.placeholder = lang === 'gr' ? grText : enText;
                }
            }
        });
        
        // Custom logic for the theme switcher button's text, which is based on theme, not lang alone
        const isLight = document.body.classList.contains('light-theme');
        updateThemeIcons(isLight);
    }

    function initializeLanguageSwitcher() {
        const langModal = document.getElementById('language-selection-modal');
        const openLangBtn = document.getElementById('nav-lang-switcher');
        const closeModals = langModal.querySelectorAll('.close-modal');
        
        // Check for first-time visitor
        if (!localStorage.getItem('language')) {
            langModal.classList.add('active');
        }

        // Open button in nav
        if (openLangBtn) {
            openLangBtn.addEventListener('click', () => {
                langModal.classList.add('active');
            });
        }
        
        // Language select buttons in modal
        langModal.querySelectorAll('.language-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                changeLanguage(lang);
                langModal.classList.remove('active');
            });
        });

        // Close button/click outside
        closeModals.forEach(btn => btn.addEventListener('click', () => langModal.classList.remove('active')));
        langModal.addEventListener('click', (e) => {
            if (e.target === langModal) {
                langModal.classList.remove('active');
            }
        });
    }

    // --- MODAL FUNCTIONALITY ---
    function initializeModals() {
        // Disclaimer Modal (index.html, guide-for-installation.html)
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const acceptBtn = document.getElementById('accept-disclaimer');
        const declineBtn = document.getElementById('decline-disclaimer');
        const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');

        if (disclaimerModal) {
            // Show disclaimer on load if not previously accepted
            if (localStorage.getItem('disclaimer_accepted') !== 'true') {
                disclaimerModal.classList.add('active');
            }

            if (acceptBtn) {
                acceptBtn.addEventListener('click', () => {
                    localStorage.setItem('disclaimer_accepted', 'true');
                    disclaimerModal.classList.remove('active');
                });
            }

            if (declineBtn) {
                declineBtn.addEventListener('click', () => {
                    // Prevent navigation and show a message (or just keep modal open)
                    alert(currentLanguage === 'gr' ? 'Πρέπει να αποδεχτείτε τους όρους για να συνεχίσετε να χρησιμοποιείτε αυτόν τον ιστότοπο.' : 'You must accept the terms to continue using this website.');
                });
            }

            // Disclaimer Language Switcher (inside the modal)
            if (disclaimerLangBtn) {
                disclaimerLangBtn.addEventListener('click', () => {
                    const newLang = currentLanguage === 'en' ? 'gr' : 'en';
                    changeLanguage(newLang);
                });
            }

            // Close modal by clicking outside (only if not a required acceptance on load)
            disclaimerModal.addEventListener('click', (e) => {
                // Only allow closing by click outside if disclaimer was already accepted
                if (e.target === disclaimerModal && localStorage.getItem('disclaimer_accepted') === 'true') {
                    disclaimerModal.classList.remove('active');
                }
            });
        }
    }

    // --- GUIDE/COMMAND COPY FUNCTIONALITY ---
    function initializeCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const commandBlock = button.closest('.step-card').querySelector('pre code');
                if (commandBlock) {
                    const command = commandBlock.textContent.trim();
                    navigator.clipboard.writeText(command).then(() => {
                        // Feedback animation
                        button.classList.add('copied');
                        setTimeout(() => button.classList.remove('copied'), 1500);
                    }).catch(err => {
                        console.error('Could not copy text: ', err);
                    });
                }
            });
        });
    }
    
    // --- TOOL CATEGORY ACCORDION (learn-about-the-tools.html) ---
    function initializeToolCategories() {
        document.querySelectorAll('.tool-item').forEach(toolItem => {
            const toolHeader = toolItem.querySelector('.tool-header');
            toolHeader.addEventListener('click', () => {
                const wasActive = toolItem.classList.contains('active');
                const category = toolItem.closest('.category');

                // Close all other tool items in the same category
                if (category) {
                    category.querySelectorAll('.tool-item').forEach(t => { if (t !== toolItem) t.classList.remove('active'); });
                }

                // Toggle the clicked one
                toolItem.classList.toggle('active', !wasActive);
            });
        });
    }
    
    // --- INITIALIZATION ---
    function initializePortfolio() {
        // 1. Core Language/Theme setup
        changeLanguage(currentLanguage); // Sets initial language
        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');
        
        // 2. Initialize all dynamic components
        initializeNavigation();
        initializeThemeSwitcher();
        initializeLanguageSwitcher();
        initializeModals();
        initializeCopyButtons();

        // 3. Page-specific initialization
        if (document.querySelector('.categories-container')) {
            initializeToolCategories();
        }
        
        // 4. Nav active state logic (must run after initializeNavigation)
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            // Special handling for index.html at root vs /index.html
            link.classList.toggle('active', linkPage === currentPage || (currentPage === '' && linkPage === 'index.html'));
        });
    }

    initializePortfolio();
});