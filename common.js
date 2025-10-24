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
    
    // Create overlay if it doesn't exist
    if (!document.getElementById('nav-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'nav-overlay';
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }
    
    const navOverlay = document.getElementById('nav-overlay');
    
    if (burgerIcon && navMenu && navOverlay) {
        burgerIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            navOverlay.classList.toggle('active');
        });
        
        // Close menu when clicking on overlay
        navOverlay.addEventListener('click', function() {
            burgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
            this.classList.remove('active');
        });
        
        // Close menu when clicking on a nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
            });
        });
        
        // Close menu when clicking on control buttons
        const navControls = document.querySelectorAll('.nav-control-btn');
        navControls.forEach(button => {
            button.addEventListener('click', () => {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
            });
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
        // Language button text
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

// === UPDATED: Complete Useful Information Search Functionality ===
function initializeUsefulInfoSearch() {
    const searchInput = document.getElementById('useful-info-search-input');
    const resultsContainer = document.getElementById('useful-info-results-container');
    const navContainer = document.getElementById('useful-information-nav');
    
    if (!searchInput || !resultsContainer || !navContainer) return;

    // Global state for useful information
    let usefulInfoSearchIndex = [];
    let isUsefulInfoIndexBuilt = false;
    let usefulInfoFiles = [];
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

    // Advanced Search Engine (from original script)
    const SearchEngine = {
        idfMaps: {},

        tokenize(text, lang) {
            if (!text) return [];
            return text
                .toLowerCase()
                .replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .split(/\s+/)
                .filter(word => word.length > 1);
        },

        preprocessItem(item) {
            return {
                ...item,
                titleTokens: this.tokenize(item.title, item.lang),
                textTokens: this.tokenize(item.text, item.lang)
            };
        },

        calculateIdf(indexName, index) {
            const docFreq = new Map();
            const totalDocs = index.length;
            if (totalDocs === 0) return;

            index.forEach(item => {
                const seenTokens = new Set([...item.titleTokens, ...item.textTokens]);
                seenTokens.forEach(token => {
                    docFreq.set(token, (docFreq.get(token) || 0) + 1);
                });
            });

            const idfMap = new Map();
            for (const [token, freq] of docFreq.entries()) {
                idfMap.set(token, Math.log(totalDocs / (1 + freq)));
            }
            this.idfMaps[indexName] = idfMap;
        },

        _getNgrams(word, n = 2) {
            const ngrams = new Set();
            if (!word || word.length < n) return ngrams;
            for (let i = 0; i <= word.length - n; i++) {
                ngrams.add(word.substring(i, i + n));
            }
            return ngrams;
        },

        _calculateSimilarity(word1, word2) {
            if (!word1 || !word2) return 0;
            const ngrams1 = this._getNgrams(word1);
            const ngrams2 = this._getNgrams(word2);
            const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
            const union = ngrams1.size + ngrams2.size - intersection.size;
            return union === 0 ? 0 : intersection.size / union;
        },

        search(query, index, lang, indexName) {
            const queryTokens = this.tokenize(query, lang);
            if (queryTokens.length === 0) return [];
            const idfMap = this.idfMaps[indexName] || new Map();

            const scoredResults = index
                .filter(item => item.lang === lang)
                .map(item => {
                    let score = 0;
                    const foundTokens = new Set();

                    queryTokens.forEach(qToken => {
                        const idf = idfMap.get(qToken) || 0.5;
                        let tokenFound = false;

                        let exactTitleMatches = item.titleTokens.filter(t => t === qToken).length;
                        if (exactTitleMatches > 0) {
                            score += exactTitleMatches * 10 * idf;
                            tokenFound = true;
                        }
                        let exactTextMatches = item.textTokens.filter(t => t === qToken).length;
                        if (exactTextMatches > 0) {
                            score += exactTextMatches * 2 * idf;
                            tokenFound = true;
                        }
                        if(tokenFound) foundTokens.add(qToken);

                        if (!tokenFound) {
                            let bestSimilarity = 0;
                            const allItemTokens = [...item.titleTokens, ...item.textTokens];
                            allItemTokens.forEach(tToken => {
                                const similarity = this._calculateSimilarity(qToken, tToken);
                                if (similarity > bestSimilarity) bestSimilarity = similarity;
                            });
                            
                            if (bestSimilarity > 0.7) {
                               score += bestSimilarity * 5 * idf;
                               foundTokens.add(qToken);
                            }
                        }
                    });

                    if (foundTokens.size === queryTokens.length && queryTokens.length > 1) score *= 1.5;
                    if (item.text.toLowerCase().includes(query.toLowerCase().trim())) score *= 1.2;
                    score *= item.weight || 1;

                    return { ...item, score };
                });

            return scoredResults
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score);
        },
        
        generateSnippet(text, query, lang) {
            const queryTokens = this.tokenize(query, lang);
            if (queryTokens.length === 0) return text.substring(0, 120) + (text.length > 120 ? '...' : '');
    
            let bestIndex = -1;
            const lowerCaseText = text.toLowerCase();
    
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

        highlight(snippet, query, lang) {
            const queryTokens = this.tokenize(query, lang);
            if (queryTokens.length === 0) return snippet;
            const regex = new RegExp(`(${queryTokens.join('|')})`, 'gi');
            return snippet.replace(regex, '<strong>$1</strong>');
        }
    };

    // Build search index
    async function buildUsefulInfoSearchIndex(progressBar, progressText) {
        if (isUsefulInfoIndexBuilt || usefulInfoFiles.length === 0) return;

        let filesLoaded = 0;
        const totalFiles = usefulInfoFiles.length;

        const indexPromises = usefulInfoFiles.map(async (file) => {
            try {
                const response = await fetch(file.download_url);
                if (!response.ok) return;
                const htmlContent = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;

                let fallbackTitleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                let fallbackTitleGR = fallbackTitleEN;

                const titleRegex = /(.+?)_\((.+?)\)/;
                const match = file.name.match(titleRegex);

                if (match && match[1] && match[2]) {
                    fallbackTitleEN = match[1].replace(/_/g, ' ').trim();
                    fallbackTitleGR = match[2].replace(/_/g, ' ').trim();
                }

                const titlesContainer = tempDiv.querySelector('#article-titles');
                const titleEN = titlesContainer?.querySelector('[data-lang="en"]')?.textContent.trim() || fallbackTitleEN;
                const titleGR = titlesContainer?.querySelector('[data-lang="gr"]')?.textContent.trim() || fallbackTitleGR;

                tempDiv.querySelectorAll('[data-lang-section]').forEach(section => {
                    const lang = section.dataset.langSection;
                    const articleTitle = lang === 'gr' ? titleGR : titleEN;
                    section.querySelectorAll('h3, h4, p, li, b, code').forEach(el => {
                        const text = el.textContent.trim().replace(/\s\s+/g, ' ');
                        if (text.length > 5) {
                            const item = {
                                lang,
                                title: articleTitle,
                                text,
                                url: file.download_url,
                                weight: (el.tagName === 'H3' ? 5 : 1)
                            };
                            usefulInfoSearchIndex.push(SearchEngine.preprocessItem(item));
                        }
                    });
                });
            } catch (e) {
                console.error(`Failed to index file: ${file.name}`, e);
            } finally {
                filesLoaded++;
                const progress = (filesLoaded / totalFiles) * 100;
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${Math.round(progress)}%`;
            }
        });

        await Promise.all(indexPromises);
        SearchEngine.calculateIdf('usefulInfo', usefulInfoSearchIndex);
        isUsefulInfoIndexBuilt = true;
    }

    // Update button titles
    function updateUsefulInfoButtonTitles() {
        const titleMap = new Map();

        usefulInfoSearchIndex.forEach(item => {
            if (!titleMap.has(item.url)) {
                titleMap.set(item.url, {});
            }
            const langTitles = titleMap.get(item.url);
            if (!langTitles[item.lang]) {
                langTitles[item.lang] = item.title;
            }
        });

        document.querySelectorAll('#useful-information-nav .app-icon[data-url]').forEach(button => {
            const url = button.dataset.url;
            const titles = titleMap.get(url);
            if (titles) {
                const buttonSpan = button.querySelector('span');
                if(buttonSpan) {
                   buttonSpan.setAttribute('data-en', titles.en || '');
                   buttonSpan.setAttribute('data-gr', titles.gr || titles.en || '');
                   const currentLanguage = localStorage.getItem('language') || 'en';
                   buttonSpan.textContent = (currentLanguage === 'gr' ? titles.gr : titles.en) || titles.en || buttonSpan.textContent;
                }
            }
        });
    }

    // Fetch useful information from GitHub
    async function fetchUsefulInformation() {
        if (usefulInformationLoaded || isFetchingUsefulInfo) return;
        isFetchingUsefulInfo = true;
        const navContainer = document.getElementById('useful-information-nav');
        const GITHUB_API_URL = 'https://api.github.com/repos/dedsec1121fk/dedsec1121fk.github.io/contents/Useful_Information';
        navContainer.innerHTML = `<p>${localStorage.getItem('language') === 'gr' ? 'Φόρτωση...' : 'Loading...'}</p>`;
        
        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const files = await response.json();
            usefulInfoFiles = files.filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            navContainer.innerHTML = '';
            if (usefulInfoFiles.length === 0) {
                 navContainer.innerHTML = `<p>${localStorage.getItem('language') === 'gr' ? 'Δεν βρέθηκαν πληροφορίες.' : 'No information found.'}</p>`;
                 return;
            }
            
            usefulInfoFiles.forEach(file => {
                let titleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                let titleGR = titleEN; 
    
                const titleRegex = /(.+?)_\((.+?)\)/;
                const match = file.name.match(titleRegex);
    
                if (match && match[1] && match[2]) {
                    titleEN = match[1].replace(/_/g, ' ').trim();
                    titleGR = match[2].replace(/_/g, ' ').trim();
                }
    
                const button = document.createElement('button');
                button.className = 'app-icon';
                button.dataset.url = file.download_url;
                
                const currentLanguage = localStorage.getItem('language') || 'en';
                const initialTitle = currentLanguage === 'gr' ? titleGR : titleEN;
                button.innerHTML = `<i class="fas fa-book-open"></i><span data-en="${titleEN}" data-gr="${titleGR}">${initialTitle}</span>`;
                
                button.addEventListener('click', () => {
                    const span = button.querySelector('span');
                    const modalTitle = (currentLanguage === 'gr' ? span.getAttribute('data-gr') : span.getAttribute('data-en')) || titleEN;
                    loadInformationContent(file.download_url, modalTitle);
                });
                navContainer.appendChild(button);
            });
            usefulInformationLoaded = true;
        } catch (error) {
            console.error('Failed to fetch useful information:', error);
            navContainer.innerHTML = `<p style="color: var(--nm-danger);">${localStorage.getItem('language') === 'gr' ? 'Αποτυχία φόρτωσης.' : 'Failed to load.'}</p>`;
        } finally {
            isFetchingUsefulInfo = false;
        }
    }

    // Load article content
    async function loadInformationContent(url, title, textToHighlight = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            const htmlContent = await response.text();
            createAndShowArticleModal(title, htmlContent, textToHighlight);
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }

    // Create and show article modal
    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        document.querySelectorAll('.article-modal-overlay').forEach(modal => modal.remove());
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay article-modal-overlay'; 
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">${htmlContent}</div>
            </div>`;
        document.body.appendChild(modalOverlay);

        // Handle copy buttons in the modal
        let dynamicCodeIdCounter = 0;
        const codeContainers = modalOverlay.querySelectorAll('.code-container');
        codeContainers.forEach(container => {
            const copyBtn = container.querySelector('.copy-btn');
            const codeEl = container.querySelector('code');

            if (copyBtn && codeEl) {
                if (!codeEl.id) {
                    const uniqueId = `dynamic-code-${Date.now()}-${dynamicCodeIdCounter++}`;
                    codeEl.id = uniqueId;
                }
                
                copyBtn.addEventListener('click', () => {
                    window.copyToClipboard(copyBtn, codeEl.id);
                });
            }
        });
        
        setTimeout(() => modalOverlay.classList.add('visible'), 10);
        changeLanguage(localStorage.getItem('language') || 'en');
    
        if (textToHighlight) {
            setTimeout(() => {
                const modalBody = modalOverlay.querySelector('.modal-body');
                const allElements = modalBody.querySelectorAll('p, li, h3, h4, b, code, .tip, .note');
                const targetElement = Array.from(allElements).find(el => el.textContent.trim().replace(/\s\s+/g, ' ') === textToHighlight.trim());
                if (targetElement) {
                    modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                    targetElement.classList.add('content-highlight');
                    setTimeout(() => targetElement.classList.remove('content-highlight'), 2500);
                }
            }, 150);
        }
        
        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            modalOverlay.addEventListener('transitionend', () => modalOverlay.remove(), { once: true });
            
            const searchInput = document.getElementById('useful-info-search-input');
            if (searchInput) searchInput.value = '';
            
            const navContainer = document.getElementById('useful-information-nav');
            if (navContainer) {
                navContainer.querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'flex';
                });
            }
        };

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        modalOverlay.querySelector('.close-modal').addEventListener('click', closeModal);
    }

    // Search functionality
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressText = document.createElement('span');
    progressText.className = 'progress-bar-text';
    progressText.textContent = '0%';

    progressBarContainer.appendChild(progressBar);
    progressBarContainer.appendChild(progressText);
    navContainer.parentNode.insertBefore(progressBarContainer, navContainer);

    const showNav = (shouldShow) => {
        navContainer.querySelectorAll('.app-icon').forEach(article => {
            article.style.display = shouldShow ? 'flex' : 'none';
        });
    };

    searchInput.addEventListener('focus', async () => {
        if (isUsefulInfoIndexBuilt) return;

        const currentLanguage = localStorage.getItem('language') || 'en';
        searchInput.placeholder = currentLanguage === 'gr' ? 'Ευρετηρίαση άρθρων...' : 'Indexing articles...';
        searchInput.disabled = true;

        progressBarContainer.style.display = 'block';
        progressBar.style.width = '0%';

        // Fetch articles first if not loaded
        if (!usefulInformationLoaded) {
            await fetchUsefulInformation();
        }

        await buildUsefulInfoSearchIndex(progressBar, progressText);
        
        updateUsefulInfoButtonTitles();

        setTimeout(() => {
            progressBarContainer.style.display = 'none';
        }, 500);

        searchInput.disabled = false;
        searchInput.placeholder = currentLanguage === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
        searchInput.focus();
    }, { once: true });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        resultsContainer.innerHTML = '';

        if (!isUsefulInfoIndexBuilt || query.length < 2) {
            resultsContainer.classList.add('hidden');
            showNav(true);
            return;
        }
        
        showNav(false);

        const currentLanguage = localStorage.getItem('language') || 'en';
        const results = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage, 'usefulInfo');

        if (results.length > 0) {
            results.slice(0, 7).forEach(result => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('search-result-item');
                const snippet = SearchEngine.generateSnippet(result.text, query, currentLanguage);
                const highlightedSnippet = SearchEngine.highlight(snippet, query, currentLanguage);

                itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                itemEl.addEventListener('click', () => {
                    searchInput.value = '';
                    resultsContainer.classList.add('hidden');
                    loadInformationContent(result.url, result.title, result.text);
                });
                resultsContainer.appendChild(itemEl);
            });
            resultsContainer.classList.remove('hidden');
        } else {
            resultsContainer.classList.add('hidden');
            showNav(true);
        }
    });

    // Initial load of articles
    fetchUsefulInformation();
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