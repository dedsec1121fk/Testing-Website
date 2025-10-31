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

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButton(isLight);
            });
            updateThemeButton(document.body.classList.contains('light-theme'));
        }

        function updateThemeButton(isLight) {
            if (themeIcon) {
                themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
            }
            if (themeSpan) {
                themeSpan.setAttribute('data-en', isLight ? 'Dark Theme' : 'Light Theme');
                themeSpan.setAttribute('data-gr', isLight ? 'Σκοτεινό Θέμα' : 'Φωτεινό Θέμα');
                updateText(themeSpan.parentElement);
            }
        }
    }

    // --- LANGUAGE SWITCHER & INTERNATIONALIZATION (i18n) ---
    function updateText(element = document) {
        element.querySelectorAll('[data-en], [data-gr]').forEach(el => {
            const translation = el.getAttribute(`data-${currentLanguage}`);
            if (translation) {
                // Handle special elements (input/textarea, meta, title)
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else if (el.tagName === 'OPTION') {
                    el.textContent = translation;
                } else if (el.tagName === 'META') {
                    if (el.getAttribute('name') === 'description' || el.getAttribute('property')?.includes('description')) {
                        el.setAttribute('content', translation);
                    }
                } else if (el.tagName === 'TITLE') {
                     document.title = translation;
                }
                else {
                    el.innerHTML = translation;
                }
            }
        });
    }

    function changeLanguage(lang) {
        if (lang === currentLanguage) return;

        currentLanguage = lang;
        localStorage.setItem('language', lang);

        document.documentElement.lang = lang; // Set HTML lang attribute
        updateText(); // Update all text on the page

        // Update Theme Switcher text after language change
        const themeBtnSpan = document.getElementById('nav-theme-switcher')?.querySelector('span');
        if (themeBtnSpan) {
            const isLight = document.body.classList.contains('light-theme');
            themeBtnSpan.setAttribute('data-en', isLight ? 'Dark Theme' : 'Light Theme');
            themeBtnSpan.setAttribute('data-gr', isLight ? 'Σκοτεινό Θέμα' : 'Φωτεινό Θέμα');
            updateText(themeBtnSpan.parentElement); // Update only the button text
        }
    }

    function initializeLanguageSwitcher() {
        const modal = document.getElementById('language-selection-modal');
        const modalBtn = document.getElementById('nav-language-switcher');
        const languageBtns = modal?.querySelectorAll('.language-button');

        if (modalBtn) {
            modalBtn.addEventListener('click', () => openModal('language-selection-modal'));
        }

        languageBtns?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                if (lang) {
                    changeLanguage(lang);
                    closeModal('language-selection-modal');
                }
            });
        });
    }

    // --- MODAL FUNCTIONALITY ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            setTimeout(() => modal.querySelector('.modal-content')?.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.querySelector('.modal-content')?.classList.remove('active');
            setTimeout(() => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }, 300);
        }
    }

    function initializeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            // Close button inside modal
            modal.querySelector('.close-modal')?.addEventListener('click', () => closeModal(modal.id));

            // Close when clicking outside the modal content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });
    }

    // --- CAROUSEL (SWIPER) INITIALIZATION ---
    function initializeCarousels() {
        // Placeholder for external library initialization (e.g., Swiper)
    }

    // --- CODE COPY BUTTONS ---
    function initializeCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const codeContainer = button.closest('.code-container');
                const codeElement = codeContainer ? codeContainer.querySelector('code') : null;

                if (codeElement) {
                    const textToCopy = codeElement.textContent;
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        button.classList.add('copied');
                        const originalText = button.getAttribute('data-en');
                        const originalGrText = button.getAttribute('data-gr');
                        button.setAttribute('data-en', 'Copied!');
                        button.setAttribute('data-gr', 'Αντιγράφηκε!');
                        updateText(button.parentElement); // Update button text

                        setTimeout(() => {
                            button.classList.remove('copied');
                            button.setAttribute('data-en', originalText);
                            button.setAttribute('data-gr', originalGrText);
                            updateText(button.parentElement); // Restore button text
                        }, 2000);
                    }).catch(err => {
                        console.error('Could not copy text: ', err);
                    });
                }
            });
        });
    }

    // --- DISCLAIMER & COOKIE FUNCTIONALITY ---
    function initializeDisclaimer() {
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const acceptBtn = document.getElementById('accept-disclaimer');
        const declineBtn = document.getElementById('decline-disclaimer');

        // Check if disclaimer has been accepted before
        if (localStorage.getItem('disclaimer_accepted') !== 'true' && disclaimerModal) {
            openModal('disclaimer-modal');
        }

        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('disclaimer_accepted', 'true');
            closeModal('disclaimer-modal');
        });

        declineBtn?.addEventListener('click', () => {
            alert('You must accept the terms to use the DedSec Project website. You will be redirected.');
            window.location.href = 'https://google.com'; // Redirect to a benign site
        });
    }

    // --- TOOLS PAGE COLLAPSIBLE SECTIONS ---
    function initializeToolCategories() {
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', function() {
                const category = this.closest('.category');
                const wasActive = category.classList.contains('active');

                // Close all other categories
                document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));

                // Toggle the clicked one
                category.classList.toggle('active', !wasActive);
            });
        });

        document.querySelectorAll('.tool-header').forEach(header => {
            header.addEventListener('click', function() {
                const toolItem = this.parentElement;
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

        changeLanguage(localStorage.getItem('language') || 'en');
        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-theme');

        // Nav active state logic
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            link.classList.toggle('active', linkPage === currentPage || (currentPage === '' && linkPage === 'index.html'));
        });
    }

    initializePortfolio();
});