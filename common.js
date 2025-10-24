// Common JavaScript for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize burger menu
    initializeBurgerMenu();
    
    // Initialize theme switcher
    initializeThemeSwitcher();
    
    // Initialize language switcher
    initializeLanguageSwitcher();
    
    // Initialize copy buttons
    initializeCopyButtons();
    
    // Set initial theme
    setInitialTheme();
    
    // Set initial language
    setInitialLanguage();
    
    // Initialize search functionality for useful info page
    if (document.getElementById('useful-info-search-input')) {
        initializeUsefulInfoSearch();
    }
});

// Burger menu functionality
function initializeBurgerMenu() {
    const burgerIcon = document.getElementById('burger-icon');
    const navMenu = document.getElementById('nav-menu');
    
    if (burgerIcon && navMenu) {
        burgerIcon.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!burgerIcon.contains(event.target) && !navMenu.contains(event.target)) {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Theme switcher functionality
function initializeThemeSwitcher() {
    const themeSwitcher = document.getElementById('theme-switcher-btn');
    
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', toggleTheme);
        
        // Update theme button text and icon
        updateThemeButton();
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    updateThemeButton();
}

function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateThemeButton();
}

function updateThemeButton() {
    const themeSwitcher = document.getElementById('theme-switcher-btn');
    if (!themeSwitcher) return;
    
    const themeIcon = themeSwitcher.querySelector('i');
    const themeSpan = themeSwitcher.querySelector('span');
    const isLight = document.body.classList.contains('light-theme');
    
    if (isLight) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeSpan.setAttribute('data-en', 'Light Theme');
        themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeSpan.setAttribute('data-en', 'Theme');
        themeSpan.setAttribute('data-gr', 'Θέμα');
    }
    
    // Update text based on current language
    const currentLanguage = localStorage.getItem('language') || 'en';
    themeSpan.textContent = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
}

// Language switcher functionality
function initializeLanguageSwitcher() {
    const langSwitcher = document.getElementById('lang-switcher-btn');
    
    if (langSwitcher) {
        // === UPDATED: Language button text ===
        const langSpan = langSwitcher.querySelector('span');
        langSpan.setAttribute('data-en', 'Change Language');
        langSpan.setAttribute('data-gr', 'Αλλάξτε Γλώσσα');
        
        langSwitcher.addEventListener('click', function() {
            const currentLanguage = localStorage.getItem('language') || 'en';
            const newLanguage = currentLanguage === 'en' ? 'gr' : 'en';
            changeLanguage(newLanguage);
        });
    }
}

function setInitialLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    changeLanguage(savedLanguage);
}

function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-en]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
        
        // Check if element has direct text content
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
        const shouldShow = el.dataset.langSection === lang;
        el.style.display = shouldShow ? 'block' : 'none';
        el.classList.toggle('hidden', !shouldShow);
        
        if (shouldShow) {
            el.classList.remove('hidden-by-default');
        }
    });
    
    // Update search placeholders
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
        searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
    }
    
    const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
    if (usefulInfoSearchInput) {
        usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
    }
    
    // Update document language
    document.documentElement.lang = lang;
}

// Copy button functionality
function initializeCopyButtons() {
    // This function will be extended by individual pages as needed
}

// Global copy function
function copyToClipboard(button, targetId) {
    const codeElement = document.getElementById(targetId);
    if (!codeElement || !navigator.clipboard) {
        console.warn('Clipboard API not available or element not found.');
        button.textContent = 'Error';
        setTimeout(() => { 
            button.textContent = (localStorage.getItem('language') === 'gr') ? 'Αντιγραφή' : 'Copy'; 
        }, 1500);
        return;
    }
    
    const originalText = button.textContent;
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    navigator.clipboard.writeText(codeElement.innerText).then(() => {
        button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
        setTimeout(() => { button.textContent = originalText; }, 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        button.textContent = 'Failed!';
        setTimeout(() => { button.textContent = originalText; }, 1500);
    });
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('visible');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('visible');
    }
}

// Initialize modals
function initializeModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('visible');
            }
        });
    });
    
    // Close modals when clicking close button
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('visible');
            }
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('main-search-input');
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    
    if (searchInput && suggestionsContainer) {
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        };
        
        const fetchSuggestions = debounce((query) => {
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) oldScript.remove();
            
            const script = document.createElement('script');
            script.id = 'jsonp-script';
            const currentLanguage = localStorage.getItem('language') || 'en';
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
            };
            
            document.head.appendChild(script);
        }, 250);
        
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            
            if (query.length < 1) {
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
                return;
            }
            
            fetchSuggestions(query);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
        
        // Hide on Escape key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }
}

// === ADDED: Useful Information Search Functionality ===
function initializeUsefulInfoSearch() {
    const searchInput = document.getElementById('useful-info-search-input');
    const resultsContainer = document.getElementById('useful-info-results-container');
    const navContainer = document.getElementById('useful-information-nav');
    
    if (!searchInput || !resultsContainer || !navContainer) return;

    let usefulInfoSearchIndex = [];
    let isUsefulInfoIndexBuilt = false;
    let usefulInfoFiles = [];

    // Simple search utility
    const SearchEngine = {
        tokenize(text) {
            if (!text) return [];
            return text
                .toLowerCase()
                .replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .split(/\s+/)
                .filter(word => word.length > 1);
        },

        search(query, index, lang) {
            const queryTokens = this.tokenize(query);
            if (queryTokens.length === 0) return [];

            const scoredResults = index
                .filter(item => item.lang === lang)
                .map(item => {
                    let score = 0;
                    const itemTokens = [...this.tokenize(item.title), ...this.tokenize(item.text)];
                    
                    queryTokens.forEach(qToken => {
                        if (itemTokens.includes(qToken)) {
                            score += 10;
                        }
                        
                        // Partial matches
                        itemTokens.forEach(iToken => {
                            if (iToken.includes(qToken) || qToken.includes(iToken)) {
                                score += 5;
                            }
                        });
                    });

                    return { ...item, score };
                });

            return scoredResults
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score);
        },

        generateSnippet(text, query) {
            const queryTokens = this.tokenize(query);
            if (queryTokens.length === 0) return text.substring(0, 120) + (text.length > 120 ? '...' : '');

            const lowerCaseText = text.toLowerCase();
            let bestIndex = -1;

            for (const token of queryTokens) {
                const index = lowerCaseText.indexOf(token);
                if (index !== -1) {
                    bestIndex = index;
                    break;
                }
            }

            if (bestIndex === -1) {
                return text.substring(0, 120) + (text.length > 120 ? '...' : '');
            }

            const snippetLength = 120;
            const start = Math.max(0, bestIndex - Math.round(snippetLength / 4));
            const end = Math.min(text.length, start + snippetLength);
            
            let snippet = text.substring(start, end);
            if (start > 0) snippet = '... ' + snippet;
            if (end < text.length) snippet = snippet + ' ...';

            return snippet;
        },

        highlight(snippet, query) {
            const queryTokens = this.tokenize(query);
            if (queryTokens.length === 0) return snippet;
            
            let highlighted = snippet;
            queryTokens.forEach(token => {
                const regex = new RegExp(`(${token})`, 'gi');
                highlighted = highlighted.replace(regex, '<strong>$1</strong>');
            });
            return highlighted;
        }
    };

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        resultsContainer.innerHTML = '';

        if (!isUsefulInfoIndexBuilt || query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const currentLanguage = localStorage.getItem('language') || 'en';
        const results = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage);

        if (results.length > 0) {
            results.slice(0, 7).forEach(result => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('search-result-item');
                const snippet = SearchEngine.generateSnippet(result.text, query);
                const highlightedSnippet = SearchEngine.highlight(snippet, query);

                itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                itemEl.addEventListener('click', () => {
                    searchInput.value = '';
                    resultsContainer.classList.add('hidden');
                    // In a real implementation, you would load the article content here
                    alert(`Loading article: ${result.title}`);
                });
                resultsContainer.appendChild(itemEl);
            });
            resultsContainer.classList.remove('hidden');
        } else {
            resultsContainer.classList.add('hidden');
        }
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });

    // Sample data - in a real implementation, this would come from an API
    usefulInfoSearchIndex = [
        {
            lang: 'en',
            title: 'Cybersecurity Basics',
            text: 'Learn the fundamental concepts of cybersecurity and how to protect yourself online. This guide covers essential security practices and common threats.'
        },
        {
            lang: 'gr',
            title: 'Βασικές Αρχές Κυβερνοασφάλειας',
            text: 'Μάθετε τις βασικές έννοιες της κυβερνοασφάλειας και πώς να προστατεύεστε online. Αυτός ο οδηγός καλύπτει βασικές πρακτικές ασφαλείας και κοινούς κινδύνους.'
        },
        {
            lang: 'en',
            title: 'Password Security',
            text: 'Best practices for creating and managing secure passwords and authentication methods. Learn about password managers and two-factor authentication.'
        },
        {
            lang: 'gr',
            title: 'Ασφάλεια Κωδικών',
            text: 'Καλές πρακτικές για τη δημιουργία και διαχείριση ασφαλών κωδικών και μεθόδων πιστοποίησης. Μάθετε για τους διαχειριστές κωδικών και την διπλή πιστοποίηση.'
        }
    ];

    isUsefulInfoIndexBuilt = true;
}

// Global callback for Google suggestions
window.handleGoogleSuggestions = function(data) {
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = '';
    const suggestions = data[1];
    
    if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
        suggestions.slice(0, 5).forEach(suggestion => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('search-result-item');
            itemEl.textContent = suggestion;
            
            itemEl.addEventListener('click', () => {
                const searchInput = document.getElementById('main-search-input');
                const searchForm = document.getElementById('main-search-form');
                if (searchInput && searchForm) {
                    searchInput.value = suggestion;
                    suggestionsContainer.classList.add('hidden');
                    searchForm.submit();
                    setTimeout(() => { searchInput.value = ''; }, 100);
                }
            });
            suggestionsContainer.appendChild(itemEl);
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
};