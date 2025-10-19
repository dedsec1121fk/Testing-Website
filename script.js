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

    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');

        if (!searchInput || !suggestionsContainer || !searchForm) return;

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
                        // Use a short delay to clear the input after the form submits
                        setTimeout(() => { searchInput.value = ''; }, 100);
                    });
                    suggestionsContainer.appendChild(itemEl);
                });
                suggestionsContainer.classList.remove('hidden');
            } else {
                suggestionsContainer.classList.add('hidden');
            }
        };

        let debounceTimer;
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 1) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            debounceTimer = setTimeout(() => {
                const oldScript = document.getElementById('jsonp-script');
                if (oldScript) {
                    oldScript.remove();
                }

                const script = document.createElement('script');
                script.id = 'jsonp-script';
                script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=handleGoogleSuggestions`;
                document.body.appendChild(script);
            }, 300);
        });

        searchInput.addEventListener('focus', () => {
             if (searchInput.value.trim().length > 0) {
                 suggestionsContainer.classList.remove('hidden');
             }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
             if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
                 suggestionsContainer.classList.add('hidden');
             }
        });
        
        // Handle form submission
        searchForm.addEventListener('submit', (e) => {
             e.preventDefault(); 
             const query = searchInput.value.trim();
             if (query) {
                 window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
             }
        });
    }
    
    // --- USEFUL INFORMATION FETCHING ---
    async function fetchUsefulInformation() {
        if (usefulInformationLoaded || isFetchingUsefulInfo) return;
        isFetchingUsefulInfo = true;
        const navContainer = document.getElementById('useful-information-nav');
        if (!navContainer) return;
        
        navContainer.innerHTML = (currentLanguage === 'gr') ? 
            `<p>Φορτώνονται πληροφορίες...</p>` : 
            `<p>Loading information...</p>`;
        
        try {
            // Step 1: Fetch the index file which contains the list of articles
            const indexResponse = await fetch('Assets/UsefulInformation/index.json');
            if (!indexResponse.ok) throw new Error("Failed to fetch index.json");
            const indexData = await indexResponse.json();
            usefulInfoFiles = indexData.files || [];
            
            // Step 2: Clear the loading message
            navContainer.innerHTML = ''; 
            
            // Step 3: Create the navigation/app-grid elements
            usefulInfoFiles.forEach(file => {
                const wrapper = document.createElement('button');
                wrapper.classList.add('app-wrapper');
                wrapper.dataset.url = file.url;
                wrapper.dataset.titleEn = file.title.en;
                wrapper.dataset.titleGr = file.title.gr;
                wrapper.dataset.langSection = currentLanguage;

                const appIcon = document.createElement('div');
                appIcon.classList.add('app-icon');
                appIcon.style.backgroundColor = file.color;
                
                const icon = document.createElement('i');
                icon.classList.add('fas', file.icon);
                appIcon.appendChild(icon);

                const appLabel = document.createElement('span');
                appLabel.classList.add('app-label');
                appLabel.setAttribute('data-en', file.title.en);
                appLabel.setAttribute('data-gr', file.title.gr);
                
                wrapper.appendChild(appIcon);
                wrapper.appendChild(appLabel);
                
                wrapper.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Load the content and display it in the content area
                    loadInformationContent(file.url, file.title[currentLanguage]);
                });

                navContainer.appendChild(wrapper);
                
                // --- PREPARE DATA FOR SEARCH INDEX (Step 4) ---
                const enItem = {
                    lang: 'en',
                    title: file.title.en,
                    text: file.summary.en,
                    url: file.url,
                    weight: file.weight || 1,
                    color: file.color,
                    icon: file.icon
                };
                usefulInfoSearchIndex.push(SearchEngine.preprocessItem(enItem));

                const grItem = {
                    lang: 'gr',
                    title: file.title.gr,
                    text: file.summary.gr,
                    url: file.url,
                    weight: file.weight || 1,
                    color: file.color,
                    icon: file.icon
                };
                usefulInfoSearchIndex.push(SearchEngine.preprocessItem(grItem));
            });

            usefulInformationLoaded = true;
            changeLanguage(currentLanguage); // Re-run to ensure all new elements are translated
            
            // Step 4.5: Update the search placeholder now that data is ready
            const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
            if (usefulInfoSearchInput) {
                usefulInfoSearchInput.placeholder = currentLanguage === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            }

            // Step 5: Build the IDF index for searching (can take a moment)
            SearchEngine.calculateIdf('usefulInfoIndex', usefulInfoSearchIndex);
            isUsefulInfoIndexBuilt = true;

        } catch (error) {
            console.error("Error loading useful information:", error);
            navContainer.innerHTML = (currentLanguage === 'gr') ? 
                `<p class="note note-danger">Αδυναμία φόρτωσης πληροφοριών. Ελέγξτε τη σύνδεσή σας.</p>` : 
                `<p class="note note-danger">Failed to load information. Check your connection.</p>`;
        } finally {
            isFetchingUsefulInfo = false;
        }
    }
    
    // --- USEFUL INFORMATION SEARCH ---
    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        const contentContainer = document.getElementById('useful-information-content');
        const promptText = document.getElementById('useful-info-prompt');
        
        if (!searchInput || !resultsContainer || !navContainer || !promptText) return;

        // Load content from a specific URL into the main content area
        async function loadInformationContent(url, title) {
             try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const htmlContent = await response.text();
                
                // Display the content
                contentContainer.innerHTML = `<h3 class="modal-article-title">${title}</h3><hr class="modal-divider">${htmlContent}`;
                contentContainer.scrollTop = 0; // Scroll to top of the article
                
                // Remove existing app-icons (nav) and show content
                navContainer.classList.add('hidden');
                promptText.classList.add('hidden');
                contentContainer.classList.remove('hidden');
                
                // Re-run language change to apply translations within the article
                changeLanguage(currentLanguage); 

            } catch (error) {
                console.error('Failed to load article content:', error);
                contentContainer.innerHTML = `<p class="note note-danger">${currentLanguage === 'gr' ? 'Αδυναμία φόρτωσης του άρθρου.' : 'Failed to load article content.'}</p>`;
                contentContainer.classList.remove('hidden');
                navContainer.classList.add('hidden');
                promptText.classList.add('hidden');
            }
        }
        
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = searchInput.value.trim();

            if (!isUsefulInfoIndexBuilt) {
                 if (query.length > 0 && !isFetchingUsefulInfo) {
                     fetchUsefulInformation();
                 }
                 resultsContainer.classList.add('hidden');
                 return;
            }

            if (query.length < 2) {
                resultsContainer.classList.add('hidden');
                navContainer.classList.remove('hidden');
                contentContainer.classList.add('hidden');
                promptText.classList.remove('hidden');
                return;
            }

            debounceTimer = setTimeout(() => {
                const searchResults = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage, 'usefulInfoIndex');
                
                resultsContainer.innerHTML = '';
                contentContainer.classList.add('hidden');
                promptText.classList.add('hidden');
                navContainer.classList.add('hidden');

                if (searchResults.length > 0) {
                    searchResults.slice(0, 10).forEach(result => {
                        const itemEl = document.createElement('div');
                        itemEl.classList.add('search-result-item');
                        
                        // Main Title/Highlight
                        const titleEl = document.createElement('strong');
                        titleEl.innerHTML = SearchEngine.highlight(result.title, query, currentLanguage);
                        itemEl.appendChild(titleEl);

                        // Snippet
                        const snippetText = SearchEngine.generateSnippet(result.text, query, currentLanguage);
                        const snippetEl = document.createElement('small');
                        snippetEl.innerHTML = SearchEngine.highlight(snippetText, query, currentLanguage);
                        itemEl.appendChild(snippetEl);
                        
                        // Bind click event to load the full article
                        itemEl.addEventListener('click', () => {
                            // Show content and hide results
                            resultsContainer.classList.add('hidden');
                            
                            // Load the full article
                            loadInformationContent(result.url, result.title);
                            
                            // Optional: Scroll to the article content within the modal body
                            document.querySelector('#useful-information-modal .modal-body').scrollTop = 0;
                        });

                        resultsContainer.appendChild(itemEl);
                    });
                    resultsContainer.classList.remove('hidden');
                } else {
                     resultsContainer.innerHTML = `<div class="search-result-item">${currentLanguage === 'gr' ? 'Δεν βρέθηκαν άρθρα.' : 'No articles found.'}</div>`;
                     resultsContainer.classList.remove('hidden');
                }
            }, 300);
        });
        
        // Load index if search input is clicked and data is not loaded
        searchInput.addEventListener('click', () => {
            if (!usefulInformationLoaded && !isFetchingUsefulInfo) {
                fetchUsefulInformation();
            }
        });
        
        searchInput.addEventListener('focus', () => {
             if (searchInput.value.trim().length > 1 && !resultsContainer.classList.contains('hidden')) {
                 // Do nothing, results are already visible
             } else if (searchInput.value.trim().length > 1 && resultsContainer.classList.contains('hidden')) {
                 // Re-run search logic if focus returns and there is text
                 searchInput.dispatchEvent(new Event('input'));
             } else {
                 // Show the navigation grid when there's no search text
                 resultsContainer.classList.add('hidden');
                 contentContainer.classList.add('hidden');
                 navContainer.classList.remove('hidden');
                 promptText.classList.remove('hidden');
             }
        });

        // Event listener to clear results and show nav when the modal is closed
        document.getElementById('useful-information-modal')?.addEventListener('click', e => {
            const modalContent = document.querySelector('#useful-information-modal .modal-content');
            if (e.target.classList.contains('close-modal') || (e.target.classList.contains('modal-overlay') && e.target.id === 'useful-information-modal')) {
                 searchInput.value = '';
                 resultsContainer.classList.add('hidden');
                 contentContainer.classList.add('hidden');
                 navContainer.classList.remove('hidden');
                 promptText.classList.remove('hidden');
            }
        });
    }

    // This function is for dynamic content loading, which is no longer needed 
    // for simple highlight, but kept for full functionality.
    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        const contentContainer = document.getElementById('useful-information-content');
        const navContainer = document.getElementById('useful-information-nav');
        const promptText = document.getElementById('useful-info-prompt');

        contentContainer.innerHTML = `<h3 class="modal-article-title">${title}</h3><hr class="modal-divider">${htmlContent}`;
        contentContainer.scrollTop = 0;
        
        navContainer.classList.add('hidden');
        promptText.classList.add('hidden');
        contentContainer.classList.remove('hidden');
        
        changeLanguage(currentLanguage); // Apply language to article content

        if (textToHighlight) {
            setTimeout(() => {
                const modalBody = document.querySelector('#useful-information-modal .modal-body');
                if (!modalBody) return;
                
                const allElements = contentContainer.querySelectorAll('h3, h4, p, li, b, code, span, .note, .tip, .modal-disclaimer');
                // Find element by trying to match the normalized text
                const targetElement = Array.from(allElements).find(el => el.textContent.trim().replace(/\s\s+/g, ' ') === textToHighlight.trim());

                if (targetElement) {
                    // Scroll to the element within the modal body
                    modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                    targetElement.classList.add('content-highlight');
                    setTimeout(() => targetElement.classList.remove('content-highlight'), 2500);
                }
            }, 150);
        }
        
        const closeModal = () => {
            // Note: This function is not the main close handler for the modal, 
            // but for a potential dynamically created one, which is now integrated
            // into the main 'useful-information-modal'. The logic below is redundant
            // because the main modal overlay listener handles closing and state reset.
            // It's kept here as a function that might have been used elsewhere.
            const modalOverlay = document.getElementById('useful-information-modal');
            if (modalOverlay) {
                modalOverlay.classList.remove('visible');
            }
            
            const searchInput = document.getElementById('useful-info-search-input');
            if (searchInput) searchInput.value = '';
            
            if (navContainer) {
                navContainer.querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'flex';
                });
            }
        };

        // Note: The click handlers for closing are now handled by the main 
        // initializePortfolio function's modal overlay loop.
        // These lines are from the old structure and are commented out/removed.
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
