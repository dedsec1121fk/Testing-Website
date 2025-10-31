document.addEventListener('DOMContentLoaded', () => {
    // --- AdSense is now loaded only via HTML ---
    
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

        // Close menu when clicking on a link
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

        // Set initial theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
        updateThemeButton(document.body.classList.contains('light-theme'));
    }

    // --- LANGUAGE SWITCHER ---
    function initializeLanguageSwitcher() {
        const langBtn = document.getElementById('nav-lang-switcher');
        const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');
        const languageModal = document.getElementById('language-selection-modal');
        
        langBtn?.addEventListener('click', () => {
            if (languageModal) {
                languageModal.classList.add('visible');
            }
        });

        // Language selection button in disclaimer modal
        disclaimerLangBtn?.addEventListener('click', () => {
            if (languageModal) {
                languageModal.classList.add('visible');
            }
        });

        // Language selection
        document.querySelectorAll('.language-button').forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
                if (languageModal) {
                    languageModal.classList.remove('visible');
                }
            });
        });
    }

    // --- LANGUAGE MANAGEMENT ---
    window.changeLanguage = (lang) => {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
        
        // Update all elements with data attributes
        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
            const hasDirectText = Array.from(el.childNodes).some(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
            );
            
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

        // Update lang sections
        document.querySelectorAll('[data-lang-section]').forEach(el => {
            el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
            el.classList.toggle('hidden', el.dataset.langSection !== lang);
            if (el.dataset.langSection === lang) {
                el.classList.remove('hidden-by-default');
            }
        });

        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            const text = link.getAttribute(`data-${lang}`) || link.textContent;
            if (link.getAttribute('data-en')) {
                link.textContent = text;
            }
        });

        // Update navigation action buttons
        document.querySelectorAll('.nav-action-btn span').forEach(span => {
            const text = span.getAttribute(`data-${lang}`) || span.textContent;
            if (span.getAttribute('data-en')) {
                span.textContent = text;
            }
        });

        // Update disclaimer language button
        const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');
        if (disclaimerLangBtn) {
            const span = disclaimerLangBtn.querySelector('span');
            if (span) {
                const text = span.getAttribute(`data-${lang}`) || span.textContent;
                span.textContent = text;
            }
        }

        // Update feature cards
        document.querySelectorAll('.feature-title, .feature-description, .feature-cta').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.textContent;
            if (el.getAttribute('data-en')) {
                el.textContent = text;
            }
        });

        // Update stats labels
        document.querySelectorAll('.stat-label').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.textContent;
            if (el.getAttribute('data-en')) {
                el.textContent = text;
            }
        });
    };

    // --- DISCLAIMER FUNCTIONALITY ---
    function initializeDisclaimer() {
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const acceptBtn = document.getElementById('accept-disclaimer');
        const declineBtn = document.getElementById('decline-disclaimer');

        // Check if user has already accepted the disclaimer
        const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');

        if (!disclaimerAccepted) {
            // Show disclaimer modal immediately on page load
            setTimeout(() => {
                if (disclaimerModal) {
                    disclaimerModal.classList.add('visible');
                }
            }, 10); // <-- OPTIMIZED: Changed from 500 to 10
        }

        // Handle accept button
        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            if (disclaimerModal) {
                disclaimerModal.classList.remove('visible');
            }
            console.log('Disclaimer accepted');
        });

        // Handle decline button - go back
        declineBtn?.addEventListener('click', () => {
            window.history.back(); // <-- OPTIMIZED: Changed from Google redirect
        });

        // Prevent closing the disclaimer modal by clicking outside
        // This listener is still useful to stop propagation if needed,
        // but the main closing logic is now handled in initializeModals()
        disclaimerModal?.addEventListener('click', (e) => {
            if (e.target === disclaimerModal) {
                // Don't allow closing by clicking outside - force user to make a choice
                return;
            }
        });
    }

    // --- MODAL MANAGEMENT ---
    function initializeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const closeModalBtn = modal.querySelector('.close-modal');
            const closeModal = () => {
                modal.classList.remove('visible');
            };
            
            modal.addEventListener('click', e => {
                // Check if the target is the modal overlay itself
                // AND if the modal is NOT the disclaimer modal
                if (e.target === modal && modal.id !== 'disclaimer-modal') {
                    closeModal();
                }
            });
            
            closeModalBtn?.addEventListener('click', closeModal);
        });
    }

    // --- CAROUSEL FUNCTIONALITY ---
    function initializeCarousels() {
        const carousels = document.querySelectorAll('.gym-carousel');
        
        carousels.forEach(carousel => {
            const images = carousel.querySelectorAll('.gym-clothing-images img');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            
            if (images.length > 0 && prevBtn && nextBtn) {
                let currentIndex = 0;
                
                const showImage = (index) => {
                    images.forEach((img, i) => {
                        img.classList.toggle('active', i === index);
                    });
                };
                
                prevBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
                    showImage(currentIndex);
                });
                
                nextBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
                    showImage(currentIndex);
                });
                
                showImage(0);
            }
        });
    }

    // --- COPY FUNCTIONALITY ---
    function initializeCopyButtons() {
        // Make copy function globally accessible
        window.copyToClipboard = (button, targetId) => {
            const codeElement = document.getElementById(targetId);
            if (!codeElement || !navigator.clipboard) {
                console.warn('Clipboard API not available or element not found.');
                button.textContent = 'Error';
                setTimeout(() => { 
                    button.textContent = (currentLanguage === 'gr') ? 'Αντιγραφή' : 'Copy'; 
                }, 1500);
                return;
            }
            
            const originalText = button.textContent;
            navigator.clipboard.writeText(codeElement.innerText).then(() => {
                button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                button.textContent = 'Failed!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            });
        };

        // Attach copy functionality to existing buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            const targetId = btn.getAttribute('onclick')?.match(/'(.*?)'/)?.[1];
            if (targetId) {
                btn.addEventListener('click', () => {
                    window.copyToClipboard(btn, targetId);
                });
            }
        });
    }

    // --- TOOL CATEGORIES FUNCTIONALITY ---
    function initializeToolCategories() {
        console.log('Initializing tool categories...');
        
        // Close all categories and tool items by default
        document.querySelectorAll('.category, .tool-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Category toggle functionality
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', function() {
                console.log('Category header clicked');
                const category = this.parentElement;
                const wasActive = category.classList.contains('active');
                
                // Close all categories first
                document.querySelectorAll('.category').forEach(otherCategory => {
                    otherCategory.classList.remove('active');
                });
                
                // Open the clicked category if it was not active
                if (!wasActive) {
                    category.classList.add('active');
                }
            });
        });
        
        // Tool item toggle functionality
        document.querySelectorAll('.tool-header').forEach(header => {
            header.addEventListener('click', function(e) {
                console.log('Tool header clicked');
                // Prevent the category from closing when clicking on a tool
                e.stopPropagation();
                
                const toolItem = this.parentElement;
                const wasActive = toolItem.classList.contains('active');
                
                // Close all other tool items in the same category
                const category = toolItem.closest('.category');
                if (category) {
                    category.querySelectorAll('.tool-item').forEach(otherTool => {
                        if (otherTool !== toolItem) {
                            otherTool.classList.remove('active');
                        }
                    });
                }
                
                // Toggle the clicked tool item
                if (!wasActive) {
                    toolItem.classList.add('active');
                } else {
                    toolItem.classList.remove('active');
                }
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
        initializeDisclaimer(); // Added disclaimer initialization (no cookie consent)

        // Initialize tool categories if on the tools page
        if (document.querySelector('.categories-container')) {
            console.log('Tools page detected, initializing tool categories...');
            initializeToolCategories();
        }

        // Set initial language
        const savedLanguage = localStorage.getItem('language') || 'en';
        changeLanguage(savedLanguage);

        // Set initial theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }

        // Update active nav link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('href');
            if ((currentPage === 'index.html' || currentPage === '') && linkPage === 'index.html') {
                link.classList.add('active');
            } else if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Initialize the application
    initializePortfolio();
});