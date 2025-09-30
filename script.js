document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PORTFOLIO STATE ---
    let currentLanguage = 'en';
    let usefulInfoSearchIndex = []; // Dedicated index for the modal, BUILT ON DEMAND
    let usefulInfoFiles = []; // Stores the list of files to avoid re-fetching
    let isUsefulInfoIndexBuilt = false; // Flag to check if the full index is ready
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

    // --- EVEN MORE ADVANCED SEARCH UTILITY (Used for 'Useful Information' modal) ---
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

    // --- PORTFOLIO INITIALIZATION ---
    function initializePortfolio() {
        function showModal(modal) {
            if (!modal) return;
            modal.classList.add('visible');
        }

        function hideModal(modal) {
            if (!modal) return;
            modal.classList.remove('visible');
        }

        const languageModal = document.getElementById('language-selection-modal');
        if (!languageModal) {
            console.error("Fatal: Language modal not found. Site cannot start.");
            return;
        }
        const languageModalCloseBtn = languageModal.querySelector('.close-modal');
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const installationModal = document.getElementById('installation-modal');

        window.changeLanguage = (lang) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            document.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                const hasElementChild = el.children.length > 0;
                if (!hasElementChild) {
                     el.textContent = text;
                }
            });

            document.querySelectorAll('[data-lang-section]').forEach(el => {
                el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
                if (el.classList.contains('hidden-by-default')) {
                    el.classList.toggle('hidden-by-default', el.dataset.langSection !== lang);
                }
            });
            
            document.querySelectorAll('.language-button').forEach(button => {
                button.classList.toggle('selected', button.dataset.lang === lang);
            });

            document.title = "DedSec Project";

            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
            }
            
            const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
            if (usefulInfoSearchInput && !isUsefulInfoIndexBuilt) {
                 usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Πατήστε για φόρτωση αναζήτησης...' : 'Click to load search...';
            } else if (usefulInfoSearchInput) {
                usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            }
        };
        
        languageModal.querySelectorAll('.language-button').forEach(button => {
            button.addEventListener('click', () => {
                try {
                    changeLanguage(button.dataset.lang);
                } catch (error) {
                    console.error("Error changing language:", error);
                } finally {
                    hideModal(languageModal);
                }
            });
        });
        
        document.getElementById('lang-switcher-btn')?.addEventListener('click', () => {
            if (languageModalCloseBtn) languageModalCloseBtn.style.display = ''; 
            showModal(languageModal);
        });

        const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
        if (themeSwitcherBtn) {
            const themeIcon = themeSwitcherBtn.querySelector('i');
            const themeSpan = themeSwitcherBtn.querySelector('span');

            const updateThemeButton = (isLightTheme) => {
                if (isLightTheme) {
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
                changeLanguage(currentLanguage);
            };

            themeSwitcherBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButton(isLight);
            });
            
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
            }
            updateThemeButton(document.body.classList.contains('light-theme'));
        }

        document.getElementById('accept-disclaimer')?.addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            hideModal(disclaimerModal);
            if (installationModal) {
                showModal(installationModal);
            }
        });
        document.getElementById('decline-disclaimer')?.addEventListener('click', () => window.location.href = 'https://www.google.com');
        
        window.openModalAndHighlight = (modalId, highlightText = null) => {
            if (modalId === 'installation' && !localStorage.getItem('disclaimerAccepted') && disclaimerModal) {
                showModal(disclaimerModal);
                return;
            }
            const modal = document.getElementById(`${modalId}-modal`);
            if (modal) {
                if (modalId === 'language-selection' && languageModalCloseBtn) {
                     languageModalCloseBtn.style.display = '';
                }
                showModal(modal);
                
                if (modalId === 'useful-information' && !usefulInformationLoaded) {
                    fetchUsefulInformation();
                }
                
                if (highlightText) {
                    setTimeout(() => highlightModalContent(modal, highlightText), 100); 
                }
            }
        };

        const highlightModalContent = (modal, text) => {
            const modalBody = modal.querySelector('.modal-body');
            if (!modalBody) return;
            
            const allElements = modalBody.querySelectorAll('h3, h4, p, li, b, code, span, .note, .tip, .modal-disclaimer');
            const targetElement = Array.from(allElements).find(el => el.textContent.trim().replace(/\s\s+/g, ' ') === text.trim());

            if (targetElement) {
                modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                targetElement.classList.add('content-highlight');
                setTimeout(() => targetElement.classList.remove('content-highlight'), 2500);
            }
        };
        
        document.querySelectorAll('button.app-wrapper[data-modal]').forEach(wrapper => {
            wrapper.addEventListener('click', () => openModalAndHighlight(wrapper.dataset.modal));
        });

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const closeModal = () => {
                hideModal(modal);
                if (modal.id === 'useful-information-modal') {
                    document.getElementById('useful-info-search-input').value = '';
                    document.getElementById('useful-info-results-container').classList.add('hidden');
                    document.getElementById('useful-information-nav').querySelectorAll('.app-icon').forEach(article => {
                        article.style.display = 'flex';
                    });
                }
                modal.querySelectorAll('.content-highlight').forEach(el => el.classList.remove('content-highlight'));
            };
            
            modal.addEventListener('click', e => {
                if (e.target === modal && modal.id !== 'language-selection-modal') closeModal();
            });
            
            modal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        });
        
        window.copyToClipboard = (button, targetId) => {
            const codeElement = document.getElementById(targetId);
            if (!codeElement || !navigator.clipboard) return; 
            navigator.clipboard.writeText(codeElement.innerText).then(() => {
                const originalText = button.textContent;
                button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηке!' : 'Copied!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            }).catch(err => console.error('Failed to copy text: ', err));
        };
        
        const carousel = document.querySelector('.gym-carousel');
        if (carousel) {
            const images = carousel.querySelectorAll('.gym-clothing-images img');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            if (images.length > 0) {
                let currentIndex = 0;
                const showImage = (index) => images.forEach((img, i) => img.classList.toggle('active', i === index));
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
        }
        
        initializeWebSearchSuggestions(); 
        initializeUsefulInfoSearch();
        
        if (languageModalCloseBtn) languageModalCloseBtn.style.display = 'none';
        showModal(languageModal);
        changeLanguage('en'); 
    }

    // UPDATED: This function now includes debugging and error handling.
    function initializeWebSearchSuggestions() {
        console.log("DEBUG: Initializing web search suggestions...");

        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        if (!searchInput || !suggestionsContainer || !searchForm) {
            console.error("DEBUG: Search suggestions elements not found in HTML.");
            return;
        }

        // Use a global callback function for JSONP
        window.handleSuggestions = (data) => {
            console.log("DEBUG: Suggestions received from API:", data);
            suggestionsContainer.innerHTML = '';
            // DuckDuckGo's API returns suggestions in the second element of the main array.
            const suggestions = data[1]; 

            if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
                suggestions.slice(0, 5).forEach(suggestion => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item'); // Reuse existing style
                    itemEl.textContent = suggestion;
                    
                    itemEl.addEventListener('click', () => {
                        searchInput.value = suggestion;
                        suggestionsContainer.classList.add('hidden');
                        searchForm.submit(); // Submit the form with the chosen suggestion
                    });
                    suggestionsContainer.appendChild(itemEl);
                });
                suggestionsContainer.classList.remove('hidden');
            } else {
                console.log("DEBUG: No suggestions in the received data or data is in an unexpected format.");
                suggestionsContainer.classList.add('hidden');
            }
        };

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();

            if (query.length < 2) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            console.log(`DEBUG: Fetching suggestions for "${query}"`);

            // Remove previous script tag to avoid conflicts
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) {
                oldScript.remove();
            }

            // Use JSONP to fetch suggestions from DuckDuckGo's API
            const script = document.createElement('script');
            script.id = 'jsonp-script';
            script.src = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&callback=handleSuggestions`;
            
            // ADDED: Error handling for the script tag
            script.onerror = () => {
                console.error("DEBUG: Failed to load suggestions script. This is very likely caused by an AD-BLOCKER, privacy extension, or a network issue.");
                suggestionsContainer.classList.add('hidden');
            };
            
            document.body.appendChild(script);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }


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
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }
        });

        await Promise.all(indexPromises);
        SearchEngine.calculateIdf('usefulInfo', usefulInfoSearchIndex);
        isUsefulInfoIndexBuilt = true;
    }

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
                   buttonSpan.textContent = (currentLanguage === 'gr' ? titles.gr : titles.en) || titles.en || buttonSpan.textContent;
                }
            }
        });
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

        searchInput.addEventListener('focus', async () => {
            if (isUsefulInfoIndexBuilt) return;

            searchInput.placeholder = currentLanguage === 'gr' ? 'Ευρετηρίαση άρθρων...' : 'Indexing articles...';
            searchInput.disabled = true;

            progressBarContainer.style.display = 'block';
            progressBar.style.width = '0%';

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
    
    // --- INITIALIZE ALL FEATURES ---
    initializePortfolio();
});