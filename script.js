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
        const themeToggle = document.getElementById('theme-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLightTheme = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
                updateThemeToggleIcon(isLightTheme);
            });
        }

        // Function to set the icon based on the current theme
        function updateThemeToggleIcon(isLightTheme) {
            if (themeToggle) {
                if (isLightTheme) {
                    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>'; // Moon icon for light theme (click to switch to dark)
                    themeToggle.setAttribute('aria-label', 'Switch to Dark Theme');
                } else {
                    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>'; // Sun icon for dark theme (click to switch to light)
                    themeToggle.setAttribute('aria-label', 'Switch to Light Theme');
                }
            }
        }

        // Initial setup for the icon
        updateThemeToggleIcon(document.body.classList.contains('light-theme'));
    }

    // --- LANGUAGE SWITCHER ---
    function initializeLanguageSwitcher() {
        const langToggle = document.getElementById('lang-toggle');

        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLanguage = currentLanguage === 'en' ? 'el' : 'en';
                changeLanguage(newLanguage);
                localStorage.setItem('language', newLanguage);
            });
        }
    }

    // --- LANGUAGE CHANGE LOGIC (Placeholder for a real multi-language implementation) ---
    // NOTE: A complete implementation would involve mapping keys to text for different languages.
    function changeLanguage(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        
        // Update the button text/icon
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            if (lang === 'el') {
                langToggle.textContent = 'EN';
                langToggle.setAttribute('title', 'Switch to English');
            } else {
                langToggle.textContent = 'ΕΛ';
                langToggle.setAttribute('title', 'Switch to Greek');
            }
        }
        
        // Simple example for a few elements (requires data-lang attributes or a dedicated JSON)
        document.querySelectorAll('[data-lang-en]').forEach(el => {
            if (lang === 'en') {
                el.textContent = el.getAttribute('data-lang-en');
            } else if (el.getAttribute('data-lang-el')) {
                el.textContent = el.getAttribute('data-lang-el');
            }
        });
        
        // This is where a more robust translation logic would go
        console.log(`Language switched to: ${lang}`);
    }

    // --- MODAL FUNCTIONALITY ---
    function initializeModals() {
        const modalTriggers = document.querySelectorAll('[data-modal-target]');
        const closeButtons = document.querySelectorAll('.close-modal, .modal-footer button[data-dismiss="modal"]');
        const modals = document.querySelectorAll('.modal');

        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.querySelector(trigger.dataset.modalTarget);
                if (modal) {
                    openModal(modal);
                }
            });
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                // Close when clicking outside the modal-content
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModalElement = document.querySelector('.modal.active');
                if (openModalElement) {
                    closeModal(openModalElement);
                }
            });
        });

        function openModal(modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }

        function closeModal(modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
        
        // Handle disclaimer modal acceptance/rejection
        const acceptDisclaimerButton = document.getElementById('accept-disclaimer');
        const rejectDisclaimerButton = document.getElementById('decline-disclaimer'); // Corrected ID based on HTML
        const disclaimerModal = document.getElementById('disclaimer-modal');
        
        if (acceptDisclaimerButton && disclaimerModal) {
            acceptDisclaimerButton.addEventListener('click', () => {
                localStorage.setItem('disclaimerAccepted', 'true');
                closeModal(disclaimerModal);
            });
        }
        
        if (rejectDisclaimerButton && disclaimerModal) {
            // Redirect to google.com when declining the disclaimer
            rejectDisclaimerButton.addEventListener('click', () => {
                window.location.href = 'https://www.google.com';
            });
        }
    }
    
    // --- DISCLAIMER/CONSENT INITIALIZATION ---
    function initializeDisclaimer() {
        const hasAccepted = localStorage.getItem('disclaimerAccepted');
        const disclaimerModal = document.getElementById('disclaimer-modal');

        // Only show the disclaimer modal if it hasn't been accepted before
        if (!hasAccepted && disclaimerModal) {
            setTimeout(() => {
                disclaimerModal.classList.add('active');
                document.body.classList.add('modal-open');
            }, 1000); // Small delay for better UX after page load
        }
    }

    // --- CAROUSEL FUNCTIONALITY (For tool/feature cards) ---
    function initializeCarousels() {
        document.querySelectorAll('.carousel-container').forEach(container => {
            const track = container.querySelector('.carousel-track');
            const prevButton = container.querySelector('.carousel-prev');
            const nextButton = container.querySelector('.carousel-next');

            if (!track || !prevButton || !nextButton) return;

            // Clone cards for infinite loop effect
            const cards = Array.from(track.children);
            cards.forEach(card => {
                const clone = card.cloneNode(true);
                track.appendChild(clone);
            });

            let currentIndex = 0;
            const cardWidth = cards[0].offsetWidth; // Assuming all cards have the same width
            const totalCards = cards.length;

            const updateCarousel = () => {
                const offset = -currentIndex * cardWidth;
                track.style.transform = `translateX(${offset}px)`;

                // Simple loop logic (can be enhanced with transition end events)
                if (currentIndex >= totalCards) {
                    currentIndex = 0; // Reset after a visible loop
                    // Note: A true seamless loop requires more complex logic to jump position instantly
                }
            };

            nextButton.addEventListener('click', () => {
                currentIndex++;
                updateCarousel();
            });

            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : 0;
                updateCarousel();
            });

            // Initial setup
            updateCarousel();
            
            // Re-calculate on resize
            window.addEventListener('resize', updateCarousel);
        });
    }
    
    // --- COPY BUTTONS ---
    function initializeCopyButtons() {
        document.querySelectorAll('.copy-command-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const commandBlock = button.closest('.command-block');
                const commandText = commandBlock ? commandBlock.querySelector('code').textContent.trim() : null;

                if (commandText) {
                    try {
                        await navigator.clipboard.writeText(commandText);
                        
                        // Change button icon/text temporarily
                        const originalContent = button.innerHTML;
                        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                        button.classList.add('copied');

                        setTimeout(() => {
                            button.innerHTML = originalContent;
                            button.classList.remove('copied');
                        }, 2000);
                        
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
                        alert('Error: Could not copy command. Please select and copy manually.');
                    }
                }
            });
        });
    }
    
    // --- TOOL CATEGORY FILTERING (For the tools page) ---
    function initializeToolCategories() {
        const categoriesContainer = document.querySelector('.categories-container');
        const toolCards = document.querySelectorAll('.tool-card');

        if (!categoriesContainer || toolCards.length === 0) return;

        categoriesContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.category-tag');
            if (!target) return;

            const selectedCategory = target.getAttribute('data-category');
            
            // Update active tag class
            categoriesContainer.querySelectorAll('.category-tag').forEach(tag => {
                tag.classList.remove('active');
            });
            target.classList.add('active');

            // Filter tool cards
            toolCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'block'; // Show
                } else {
                    card.style.display = 'none'; // Hide
                }
            });
            
            console.log(`Filtering by category: ${selectedCategory}`);
        });
        
        // Ensure the 'All' tag is active by default on load
        const allTag = document.querySelector('.category-tag[data-category="all"]');
        if (allTag) {
            allTag.classList.add('active');
        }
    }


    // --- MAIN INITIALIZATION FUNCTION ---
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