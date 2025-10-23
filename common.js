document.addEventListener('DOMContentLoaded', () => {
    let currentLanguage = localStorage.getItem('dedsec-language') || 'en';

    // --- LANGUAGE SWITCHER ---
    function applyLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('dedsec-language', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
            if (!text) return;

            // Find a text node or a span to update
            let target = null;
            if (el.childNodes.length > 0 && el.childNodes[0].nodeType === 3) {
                 target = el.childNodes[0]; // Direct text node
            } else if (el.querySelector('span')) {
                 target = el.querySelector('span'); // Span inside the element
            } else {
                 target = el; // The element itself
            }
            if(target) target.textContent = text;
        });

        document.querySelectorAll('[data-lang-section]').forEach(el => {
            el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
        });
        
        document.querySelectorAll('.language-button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.lang === lang);
        });
        
        // Dispatch event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
    }
    window.changeLanguage = applyLanguage; // Make it globally accessible

    // --- BURGER MENU ---
    function initializeBurgerMenu() {
        const burgerContainer = document.getElementById('burger-icon-container');
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');

        if (!burgerContainer || !navMenu) return;

        burgerContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            burgerIcon.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // --- THEME SWITCHER ---
    function initializeThemeSwitcher() {
        const themeBtn = document.getElementById('theme-switcher-btn');
        if (!themeBtn) return;
        
        const updateThemeUI = () => {
            const isLight = document.body.classList.contains('light-theme');
            const icon = themeBtn.querySelector('i');
            const span = themeBtn.querySelector('span');
            if (isLight) {
                icon.className = 'fas fa-sun';
                span.setAttribute('data-en', 'Light Theme');
                span.setAttribute('data-gr', 'Φωτεινό Θέμα');
            } else {
                icon.className = 'fas fa-moon';
                span.setAttribute('data-en', 'Theme');
                span.setAttribute('data-gr', 'Θέμα');
            }
            applyLanguage(currentLanguage); // Re-apply language to update the text
        };
        
        // Set initial theme
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-theme');
        }
        
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
            updateThemeUI();
        });
        
        updateThemeUI();
    }

    // --- MODAL CONTROLS ---
    function initializeModals() {
        // Open modals via data-modal attribute
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]');
            if (trigger) {
                e.preventDefault();
                const modalId = trigger.dataset.modal + '-modal';
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.add('visible');
            }
        });

        // Close modals
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('visible');
            });
            modal.querySelector('.close-modal')?.addEventListener('click', () => {
                modal.classList.remove('visible');
            });
        });
        
        // Handle language selection buttons inside the modal
        document.querySelectorAll('#language-selection-modal .language-button').forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
                button.closest('.modal-overlay').classList.remove('visible');
            });
        });
    }

    // --- INITIALIZE EVERYTHING ---
    applyLanguage(currentLanguage); // Set language on load
    initializeBurgerMenu();
    initializeThemeSwitcher();
    initializeModals();
});