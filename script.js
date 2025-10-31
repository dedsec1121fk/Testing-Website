document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentLanguage = 'en';

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

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (burgerMenu && navMenu) {
                    burgerMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

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
        const themeIcon = themeBtn?.querySelector('i');
        const themeSpan = themeBtn?.querySelector('span');

        const updateThemeButton = (isLightTheme) => {
            if (!themeBtn || !themeIcon || !themeSpan) return;
            
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
            themeSpan.textContent = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
        };

        themeBtn?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeButton(isLight);
        });

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') { document.body.classList.add('light-theme'); }
        updateThemeButton(document.body.classList.contains('light-theme'));
    }

    // --- LANGUAGE SWITCHER ---
    function initializeLanguageSwitcher() {
        const langBtn = document.getElementById('nav-lang-switcher');
        const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');
        const languageModal = document.getElementById('language-selection-modal');
        
        langBtn?.addEventListener('click', () => { if (languageModal) languageModal.classList.add('visible'); });
        disclaimerLangBtn?.addEventListener('click', () => { if (languageModal) languageModal.classList.add('visible'); });

        document.querySelectorAll('.language-button').forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
                if (languageModal) languageModal.classList.remove('visible');
            });
        });
    }

    // --- LANGUAGE MANAGEMENT ---
    window.changeLanguage = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
        
        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
            const hasDirectText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
            
            if (hasDirectText) {
                Array.from(el.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                        node.textContent = text;
                    }
                });
            } else if (el.children.length === 0) {
                el.textContent = text;
            }
        });

        document.querySelectorAll('[data-lang-section]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.langSection !== lang);
            if (el.dataset.langSection === lang) {
                el.classList.remove('hidden-by-default');
            }
        });
    };

    // --- DISCLAIMER FUNCTIONALITY ---
    function initializeDisclaimer() {
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const acceptBtn = document.getElementById('accept-disclaimer');
        const declineBtn = document.getElementById('decline-disclaimer');
        const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');

        if (!disclaimerAccepted) {
            setTimeout(() => { if (disclaimerModal) disclaimerModal.classList.add('visible'); }, 10);
        }

        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            if (disclaimerModal) disclaimerModal.classList.remove('visible');
        });

        declineBtn?.addEventListener('click', () => { window.history.back(); });
    }

    // --- MODAL MANAGEMENT ---
    function initializeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const closeModalBtn = modal.querySelector('.close-modal');
            const closeModal = () => modal.classList.remove('visible');
            
            modal.addEventListener('click', e => {
                if (e.target === modal && modal.id !== 'disclaimer-modal') closeModal();
            });
            
            closeModalBtn?.addEventListener('click', closeModal);
        });
    }

    // --- CAROUSEL FUNCTIONALITY ---
    function initializeCarousels() {
        document.querySelectorAll('.gym-carousel').forEach(carousel => {
            const images = carousel.querySelectorAll('.gym-clothing-images img');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            
            if (images.length > 0 && prevBtn && nextBtn) {
                let currentIndex = 0;
                const showImage = (index) => images.forEach((img, i) => img.classList.toggle('active', i === index));
                prevBtn.addEventListener('click', () => { currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1; showImage(currentIndex); });
                nextBtn.addEventListener('click', () => { currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0; showImage(currentIndex); });
                showImage(0);
            }
        });
    }

    // --- COPY FUNCTIONALITY ---
    function initializeCopyButtons() {
        window.copyToClipboard = (button, targetId) => {
            const codeElement = document.getElementById(targetId);
            if (!codeElement || !navigator.clipboard) {
                button.textContent = 'Error';
                setTimeout(() => { button.textContent = (currentLanguage === 'gr') ? 'Αντιγραφή' : 'Copy'; }, 1500);
                return;
            }
            
            const originalText = button.textContent;
            navigator.clipboard.writeText(codeElement.innerText).then(() => {
                button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            }).catch(err => {
                button.textContent = 'Failed!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            });
        };

        document.querySelectorAll('.copy-btn').forEach(btn => {
            const targetId = btn.getAttribute('onclick')?.match(/'(.*?)'/)?.[1];
            if (targetId) {
                btn.addEventListener('click', () => window.copyToClipboard(btn, targetId));
            }
        });
    }

    // --- TOOL CATEGORIES FUNCTIONALITY ---
    function initializeToolCategories() {
        document.querySelectorAll('.category, .tool-item').forEach(item => item.classList.remove('active'));
        
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', function() {
                const category = this.parentElement;
                const wasActive = category.classList.contains('active');
                document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
                if (!wasActive) category.classList.add('active');
            });
        });
        
        document.querySelectorAll('.tool-header').forEach(header => {
            header.addEventListener('click', function(e) {
                e.stopPropagation();
                const toolItem = this.parentElement;
                const wasActive = toolItem.classList.contains('active');
                const category = toolItem.closest('.category');
                if (category) {
                    category.querySelectorAll('.tool-item').forEach(t => { if (t !== toolItem) t.classList.remove('active'); });
                }
                toolItem.classList.toggle('active', !wasActive);
            });
        });
    }

    // --- INITIALIZATION ---
    function initializePortfolio() {
        initializeNavigation();
        initializeThemeSwitcher();
        initializeLanguageSwitcher();
        initializeModals();
        initializeCarousels();
        initializeCopyButtons();
        initializeDisclaimer();

        if (document.querySelector('.categories-container')) {
            initializeToolCategories();
        }

        // Removed all calls to 'Useful Information' functions

        changeLanguage(localStorage.getItem('language') || 'en');
        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            link.classList.toggle('active', linkPage === currentPage || (currentPage === '' && linkPage === 'index.html'));
        });
    }

    initializePortfolio();
});