document.addEventListener('DOMContentLoaded', () => {
    // Global state
    let currentLanguage = 'en';

    // Initialize all functionality
    initializeBurgerMenu();
    initializeLanguageSwitcher();
    initializeThemeSwitcher();
    initializeWebSearchSuggestions();

    // Show language modal on load (like original)
    showLanguageModal();

    // Burger Menu functionality - Fixed top right
    function initializeBurgerMenu() {
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');

        if (burgerIcon && navMenu) {
            burgerIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                burgerIcon.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !burgerIcon.contains(e.target)) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });

            // Close menu when clicking a link
            navMenu.querySelectorAll('.nav-item').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                });
            });
        }
    }

    // Show language modal on page load (like original)
    function showLanguageModal() {
        const langModal = document.getElementById('language-selection-modal');
        if (langModal) {
            langModal.classList.add('visible');
        }
    }

    // Language switching functionality - Fixed
    function initializeLanguageSwitcher() {
        const langModal = document.getElementById('language-selection-modal');
        const langButtons = document.querySelectorAll('.language-button');
        const langSwitcherBtn = document.getElementById('lang-switcher-btn');

        // Change language function (from original)
        window.changeLanguage = (lang) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            // Update all elements with data attributes (original logic)
            document.querySelectorAll('[data-en]').forEach(el => {
                // Check if the element itself has text content directly
                const hasDirectText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
                
                if (hasDirectText) {
                    const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                    // Find only the direct text nodes and update them
                    Array.from(el.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                            node.textContent = text;
                        }
                    });
                } else if (el.children.length === 0) { 
                    // Fallback for elements with no children but maybe text set via JS later
                     const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                     el.textContent = text;
                }
                // If it has children with text, assume those children have their own data attributes
            });

            // Update lang sections (original logic)
            document.querySelectorAll('[data-lang-section]').forEach(el => {
                el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
                // Use `hidden` class for better accessibility and consistency
                el.classList.toggle('hidden', el.dataset.langSection !== lang);
                 // Remove hidden-by-default after initial language set if it matches
                if (el.dataset.langSection === lang) {
                   el.classList.remove('hidden-by-default');
                }
            });
            
            document.querySelectorAll('.language-button').forEach(button => {
                button.classList.toggle('selected', button.dataset.lang === lang);
            });

            // Update search placeholder
            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
            }

            // Update theme button text
            updateThemeButtonText();
        };

        // Language modal functionality (original logic)
        if (langModal) {
            const closeModal = () => {
                langModal.classList.remove('visible');
                // Save language preference
                localStorage.setItem('preferredLanguage', currentLanguage);
            };
            
            langModal.addEventListener('click', e => {
                if (e.target === langModal) closeModal();
            });
            
            langModal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        }

        // Language button functionality
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
                if (langModal) langModal.classList.remove('visible');
            });
        });

        // Language switcher in burger menu
        if (langSwitcherBtn) {
            langSwitcherBtn.addEventListener('click', () => {
                showLanguageModal();
                // Close burger menu
                const navMenu = document.getElementById('nav-menu');
                const burgerIcon = document.getElementById('burger-icon');
                if (navMenu && burgerIcon) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });
        }

        // Check for saved language preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && langModal) {
            changeLanguage(savedLanguage);
            langModal.classList.remove('visible');
        } else {
            // Initialize with English if no preference
            changeLanguage('en');
        }
    }

    // Theme switching functionality - Fixed (original logic)
    function initializeThemeSwitcher() {
        const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
        
        const updateThemeButtonText = () => {
            if (themeSwitcherBtn) {
                const themeIcon = themeSwitcherBtn.querySelector('i');
                const themeSpan = themeSwitcherBtn.querySelector('span');
                const isLight = document.body.classList.contains('light-theme');
                
                if (isLight) {
                    themeIcon.className = 'fas fa-sun';
                    themeSpan.setAttribute('data-en', 'Light Theme');
                    themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
                } else {
                    themeIcon.className = 'fas fa-moon';
                    themeSpan.setAttribute('data-en', 'Dark Theme');
                    themeSpan.setAttribute('data-gr', 'Σκούρο Θέμα');
                }
                
                // Update text content
                const text = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
                themeSpan.textContent = text;
            }
        };

        if (themeSwitcherBtn) {
            themeSwitcherBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButtonText();
                
                // Close burger menu after theme change
                const navMenu = document.getElementById('nav-menu');
                const burgerIcon = document.getElementById('burger-icon');
                if (navMenu && burgerIcon) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });
            
            // Set initial theme from localStorage (original logic)
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
            updateThemeButtonText();
        }
    }

    // Web Search Suggestions (from original script)
    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        if (!searchInput || !suggestionsContainer || !searchForm) return;

        // Debounce function to limit API calls (from original)
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        };

        // Function to fetch and display suggestions (from original)
        const fetchSuggestions = (query) => {
            // Remove any existing script tag to prevent multiple callbacks
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) {
                oldScript.remove();
            }

            // Create new script tag for JSONP request
            const script = document.createElement('script');
            script.id = 'jsonp-script';
            // Include language parameter if Google supports it (hl=...)
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                console.error("Error loading Google suggestions. Network issue or ad-blocker likely.");
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = ''; // Clear stale suggestions on error
            };
            
            document.head.appendChild(script);
        };

        // Debounced version of the fetch function
        const debouncedFetchSuggestions = debounce(fetchSuggestions, 250); // 250ms delay

        // Global callback function for JSONP (from original)
        window.handleGoogleSuggestions = (data) => {
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions
            const suggestions = data[1]; // Suggestions are usually in the second element

            if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
                suggestions.slice(0, 5).forEach(suggestion => { // Limit to 5 suggestions
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    itemEl.textContent = suggestion;
                    
                    // Event listener for clicking a suggestion
                    itemEl.addEventListener('click', () => {
                        searchInput.value = suggestion; // Fill input with suggestion
                        suggestionsContainer.classList.add('hidden'); // Hide container
                        searchForm.submit(); // Submit the form
                        
                        // Clear input slightly after submission allows form data to be sent
                        setTimeout(() => { searchInput.value = ''; }, 100); 
                    });
                    suggestionsContainer.appendChild(itemEl);
                });
                suggestionsContainer.classList.remove('hidden'); // Show container
            } else {
                suggestionsContainer.classList.add('hidden'); // Hide if no suggestions
            }
        };

        // Input event listener (from original)
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();

            if (query.length < 1) { // Hide suggestions if input is empty
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = ''; // Clear content
                return;
            }
            
            debouncedFetchSuggestions(query); // Call the debounced fetch function
        });

        // Click outside listener to hide suggestions (from original)
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) { // If click is outside the search form
                suggestionsContainer.classList.add('hidden');
            }
        });

        // Optional: Hide on Escape key press (from original)
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }

    // Copy to clipboard functionality for other pages (from original)
    window.copyToClipboard = (button, targetId) => {
        const codeElement = document.getElementById(targetId);
        if (!codeElement || !navigator.clipboard) {
            console.warn('Clipboard API not available or element not found.');
            button.textContent = 'Error'; // Give feedback
            setTimeout(() => { button.textContent = (currentLanguage === 'gr') ? 'Αντιγραφή' : 'Copy'; }, 1500);
            return;
        }
        
        const originalText = button.textContent; // Store text before changing
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
            button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
            setTimeout(() => { button.textContent = originalText; }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            button.textContent = 'Failed!';
            setTimeout(() => { button.textContent = originalText; }, 1500);
        });
    };
});