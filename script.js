// script.js - Fixed Version
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- GLOBAL STATE ---
    let currentLanguage = 'en';
    let usefulInfoSearchIndex = [];
    let usefulInfoFiles = [];
    let isUsefulInfoIndexBuilt = false;
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

    // --- NAVIGATION FUNCTIONALITY ---
    function initializeNavigation() {
        const burgerMenu = document.getElementById('burger-menu');
        const navMenu = document.getElementById('nav-menu');
        
        if (burgerMenu && navMenu) {
            burgerMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                burgerMenu.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const burgerMenu = document.getElementById('burger-menu');
            const navMenu = document.getElementById('nav-menu');
            
            if (navMenu?.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !burgerMenu?.contains(e.target)) {
                closeMobileMenu();
            }
        });

        function closeMobileMenu() {
            const burgerMenu = document.getElementById('burger-menu');
            const navMenu = document.getElementById('nav-menu');
            
            burgerMenu?.classList.remove('active');
            navMenu?.classList.remove('active');
        }
    }

    // --- FIXED THEME SWITCHER ---
    function initializeThemeSwitcher() {
        const themeBtn = document.getElementById('nav-theme-switcher');
        const themeIcon = themeBtn?.querySelector('i');
        const themeSpan = themeBtn?.querySelector('span');

        const updateThemeButton = (isLightTheme) => {
            if (!themeBtn || !themeIcon || !themeSpan) return;
            
            if (isLightTheme) {
                themeIcon.className = 'fas fa-sun';
                themeSpan.setAttribute('data-en', 'Light Theme');
                themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
            } else {
                themeIcon.className = 'fas fa-moon';
                themeSpan.setAttribute('data-en', 'Dark Theme');
                themeSpan.setAttribute('data-gr', 'Σκοτεινό Θέμα');
            }
            // Update text immediately
            const text = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
            themeSpan.textContent = text;
        };

        themeBtn?.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-theme');
            if (isLight) {
                document.body.classList.remove('light-theme');
                localStorage.setItem('theme', 'dark');
                updateThemeButton(false);
            } else {
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
                updateThemeButton(true);
            }
        });

        // Set initial theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            updateThemeButton(true);
        } else {
            updateThemeButton(false);
        }
    }

    // --- LANGUAGE MANAGEMENT ---
    function initializeLanguageSwitcher() {
        const langBtn = document.getElementById('nav-lang-switcher');
        const disclaimerLangBtn = document.getElementById('disclaimer-lang-btn');
        const languageModal = document.getElementById('language-selection-modal');
        
        langBtn?.addEventListener('click', () => {
            if (languageModal) {
                languageModal.classList.add('visible');
            }
        });

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

        // Update search placeholder
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
        }

        // Update buttons
        document.querySelectorAll('.btn').forEach(btn => {
            const text = btn.getAttribute(`data-${lang}`) || btn.textContent;
            if (btn.getAttribute('data-en')) {
                btn.textContent = text;
            }
        });

        // Update feature cards
        document.querySelectorAll('.feature-card h3, .feature-card p').forEach(el => {
            const text = el.getAttribute(`data-${lang}`) || el.textContent;
            if (el.getAttribute('data-en')) {
                el.textContent = text;
            }
        });

        // Update quick access cards
        document.querySelectorAll('.quick-access-card span').forEach(span => {
            const text = span.getAttribute(`data-${lang}`) || span.textContent;
            if (span.getAttribute('data-en')) {
                span.textContent = text;
            }
        });
    };

    // --- FIXED DISCLAIMER FUNCTIONALITY ---
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
            }, 1000);
        }

        // Handle accept button
        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            if (disclaimerModal) {
                disclaimerModal.classList.remove('visible');
            }
        });

        // Handle decline button - go back
        declineBtn?.addEventListener('click', () => {
            window.history.back();
        });

        // Prevent closing the disclaimer modal by clicking outside
        disclaimerModal?.addEventListener('click', (e) => {
            if (e.target === disclaimerModal) {
                // Don't allow closing by clicking outside - force user to make a choice
                return;
            }
        });
    }

    // --- SEARCH FUNCTIONALITY ---
    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        if (!searchInput || !suggestionsContainer || !searchForm) return;

        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        };

        const fetchSuggestions = (query) => {
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) {
                oldScript.remove();
            }

            const script = document.createElement('script');
            script.id = 'jsonp-script';
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                console.error("Error loading Google suggestions.");
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
            };
            
            document.head.appendChild(script);
        };

        const debouncedFetchSuggestions = debounce(fetchSuggestions, 250);

        window.handleGoogleSuggestions = (data) => {
            suggestionsContainer.innerHTML = '';
            const suggestions = data[1];

            if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
                suggestions.slice(0, 5).forEach(suggestion => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    itemEl.textContent = suggestion;
                    
                    itemEl.addEventListener('click', () => {
                        searchInput.value = suggestion;
                        suggestionsContainer.classList.add('hidden');
                        searchForm.submit();
                        setTimeout(() => { searchInput.value = ''; }, 100);
                    });
                    suggestionsContainer.appendChild(itemEl);
                });
                suggestionsContainer.classList.remove('hidden');
            } else {
                suggestionsContainer.classList.add('hidden');
            }
        };

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            if (query.length < 1) {
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
                return;
            }
            debouncedFetchSuggestions(query);
        });

        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                suggestionsContainer.classList.add('hidden');
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
                if (e.target === modal && modal.id !== 'disclaimer-modal') {
                    closeModal();
                }
            });
            
            closeModalBtn?.addEventListener('click', closeModal);
        });
    }

    // --- USEFUL INFORMATION FUNCTIONALITY ---
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

    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        if (!searchInput || !resultsContainer || !navContainer) return;

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

        // Start indexing 1 second after page load
        setTimeout(() => {
            if (isUsefulInfoIndexBuilt) return;

            searchInput.placeholder = currentLanguage === 'gr' ? 'Ευρετηρίαση άρθρων...' : 'Indexing articles...';
            searchInput.disabled = true;
            progressBarContainer.style.display = 'block';
            progressBar.style.width = '0%';

            buildUsefulInfoSearchIndex(progressBar, progressText).then(() => {
                setTimeout(() => {
                    progressBarContainer.style.display = 'none';
                }, 500);

                searchInput.disabled = false;
                searchInput.placeholder = currentLanguage === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            });
            
        }, 1000);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = '';

            if (!isUsefulInfoIndexBuilt || query.length < 2) {
                resultsContainer.classList.add('hidden');
                showNav(true);
                return;
            }
            
            showNav(false);

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
    }

    async function fetchUsefulInformation() {
        if (usefulInformationLoaded || isFetchingUsefulInfo) return;
        isFetchingUsefulInfo = true;
        const navContainer = document.getElementById('useful-information-nav');
        const GITHUB_API_URL = 'https://api.github.com/repos/dedsec1121fk/dedsec1121fk.github.io/contents/Useful_Information';
        navContainer.innerHTML = `<p>${currentLanguage === 'gr' ? 'Φόρτωση...' : 'Loading...'}</p>`;
        
        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const files = await response.json();
            usefulInfoFiles = files.filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            navContainer.innerHTML = '';
            if (usefulInfoFiles.length === 0) {
                 navContainer.innerHTML = `<p>${currentLanguage === 'gr' ? 'Δεν βρέθηκαν πληροφορίες.' : 'No information found.'}</p>`;
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
            navContainer.innerHTML = `<p style="color: var(--nm-danger);">${currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης.' : 'Failed to load.'}</p>`;
        } finally {
            isFetchingUsefulInfo = false;
        }
    }

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

        // Initialize copy buttons in the new modal
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
        changeLanguage(currentLanguage);
    
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

    // --- COPY FUNCTIONALITY ---
    function initializeCopyButtons() {
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

        document.querySelectorAll('.copy-btn').forEach(btn => {
            const targetId = btn.getAttribute('onclick')?.match(/'(.*?)'/)?.[1];
            if (targetId) {
                btn.addEventListener('click', () => {
                    window.copyToClipboard(btn, targetId);
                });
            }
        });
    }

    // --- INITIALIZATION ---
    function initializePortfolio() {
        initializeNavigation();
        initializeThemeSwitcher();
        initializeLanguageSwitcher();
        initializeWebSearchSuggestions();
        initializeModals();
        initializeCopyButtons();
        initializeDisclaimer();

        // Initialize useful information if on that page
        if (document.getElementById('useful-information-nav')) {
            initializeUsefulInfoSearch();
            fetchUsefulInformation();
        }

        // Set initial language
        const savedLanguage = localStorage.getItem('language') || 'en';
        changeLanguage(savedLanguage);

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