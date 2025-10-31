document.addEventListener('DOMContentLoaded', () => {
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
        
        const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
        if (usefulInfoSearchInput) {
            usefulInfoSearchInput.placeholder = isUsefulInfoIndexBuilt ? 
                (lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...') : 
                (lang === 'gr' ? 'Πατήστε για φόρτωση αναζήτησης...' : 'Click to load search...');
        }
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

    // --- USEFUL INFORMATION FUNCTIONALITY ---
    const SearchEngine = {
        idfMaps: {},
        tokenize(text) { return text ? text.toLowerCase().replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(w => w.length > 1) : []; },
        preprocessItem(item) { return { ...item, titleTokens: this.tokenize(item.title), textTokens: this.tokenize(item.text) }; },
        calculateIdf(indexName, index) {
            const docFreq = new Map(), totalDocs = index.length;
            if (totalDocs === 0) return;
            index.forEach(item => new Set([...item.titleTokens, ...item.textTokens]).forEach(token => docFreq.set(token, (docFreq.get(token) || 0) + 1)));
            const idfMap = new Map();
            for (const [token, freq] of docFreq.entries()) { idfMap.set(token, Math.log(totalDocs / (1 + freq))); }
            this.idfMaps[indexName] = idfMap;
        },
        _getNgrams(word, n = 2) { const ngrams = new Set(); if (!word || word.length < n) return ngrams; for (let i = 0; i <= word.length - n; i++) ngrams.add(word.substring(i, i + n)); return ngrams; },
        _calculateSimilarity(word1, word2) { if (!word1 || !word2) return 0; const n1 = this._getNgrams(word1), n2 = this._getNgrams(word2); const intersect = new Set([...n1].filter(x => n2.has(x))); const union = n1.size + n2.size - intersect.size; return union === 0 ? 0 : intersect.size / union; },
        search(query, index, lang, indexName) {
            const queryTokens = this.tokenize(query);
            if (queryTokens.length === 0) return [];
            const idfMap = this.idfMaps[indexName] || new Map();
            return index.filter(item => item.lang === lang).map(item => {
                let score = 0;
                const foundTokens = new Set();
                queryTokens.forEach(qToken => {
                    const idf = idfMap.get(qToken) || 0.5;
                    let tokenFound = false;
                    if (item.titleTokens.includes(qToken)) { score += 10 * idf; tokenFound = true; }
                    if (item.textTokens.includes(qToken)) { score += 2 * idf; tokenFound = true; }
                    if (tokenFound) foundTokens.add(qToken);
                    else { let bestSim = 0; [...item.titleTokens, ...item.textTokens].forEach(tToken => { const sim = this._calculateSimilarity(qToken, tToken); if (sim > bestSim) bestSim = sim; }); if (bestSim > 0.7) { score += bestSim * 5 * idf; foundTokens.add(qToken); } }
                });
                if (foundTokens.size === queryTokens.length && queryTokens.length > 1) score *= 1.5;
                if (item.text.toLowerCase().includes(query.toLowerCase().trim())) score *= 1.2;
                return { ...item, score };
            }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
        },
        generateSnippet(text, query) {
            const queryTokens = this.tokenize(query);
            if (queryTokens.length === 0) return text.substring(0, 120) + (text.length > 120 ? '...' : '');
            let bestIndex = -1, lowerCaseText = text.toLowerCase();
            for (const token of queryTokens) { const index = lowerCaseText.indexOf(token); if (index !== -1) { bestIndex = index; break; } }
            if (bestIndex === -1) return text.substring(0, 120) + (text.length > 120 ? '...' : '');
            const start = Math.max(0, bestIndex - 30), end = Math.min(text.length, start + 120);
            let snippet = text.substring(start, end);
            if (start > 0) snippet = '... ' + snippet;
            if (end < text.length) snippet = snippet + ' ...';
            return snippet;
        },
        highlight(snippet, query) { const tokens = this.tokenize(query); return tokens.length === 0 ? snippet : snippet.replace(new RegExp(`(${tokens.join('|')})`, 'gi'), '<strong>$1</strong>'); }
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
                const match = file.name.match(/(.+?)_\((.+?)\)/);
                if (match && match[1] && match[2]) {
                    fallbackTitleEN = match[1].replace(/_/g, ' ').trim();
                    fallbackTitleGR = match[2].replace(/_/g, ' ').trim();
                }

                const titleEN = tempDiv.querySelector('#article-titles [data-lang="en"]')?.textContent.trim() || fallbackTitleEN;
                const titleGR = tempDiv.querySelector('#article-titles [data-lang="gr"]')?.textContent.trim() || fallbackTitleGR;

                tempDiv.querySelectorAll('[data-lang-section]').forEach(section => {
                    const lang = section.dataset.langSection;
                    section.querySelectorAll('h3, h4, p, li, b, code').forEach(el => {
                        const text = el.textContent.trim().replace(/\s\s+/g, ' ');
                        if (text.length > 5) {
                            usefulInfoSearchIndex.push(SearchEngine.preprocessItem({ lang, title: lang === 'gr' ? titleGR : titleEN, text, url: file.download_url }));
                        }
                    });
                });
            } catch (e) { console.error(`Failed to index file: ${file.name}`, e); }
            finally {
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

    function updateUsefulInfoButtonTitles() {
        const titleMap = new Map();
        usefulInfoSearchIndex.forEach(item => {
            if (!titleMap.has(item.url)) titleMap.set(item.url, {});
            const langTitles = titleMap.get(item.url);
            if (!langTitles[item.lang]) langTitles[item.lang] = item.title;
        });
        document.querySelectorAll('#useful-information-nav .app-icon[data-url]').forEach(button => {
            const titles = titleMap.get(button.dataset.url);
            if (titles) {
                const buttonSpan = button.querySelector('span');
                if(buttonSpan) {
                   buttonSpan.setAttribute('data-en', titles.en || '');
                   buttonSpan.setAttribute('data-gr', titles.gr || titles.en || '');
                   buttonSpan.textContent = (currentLanguage === 'gr' ? titles.gr : titles.en) || titles.en || '';
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
        progressBarContainer.append(progressBar, progressText);
        navContainer.parentNode.insertBefore(progressBarContainer, navContainer);
        
        const showNav = (shouldShow) => navContainer.querySelectorAll('.app-icon').forEach(article => article.style.display = shouldShow ? 'flex' : 'none');

        setTimeout(() => {
            if (isUsefulInfoIndexBuilt) return;
            searchInput.placeholder = currentLanguage === 'gr' ? 'Ευρετηρίαση άρθρων...' : 'Indexing articles...';
            searchInput.disabled = true;
            progressBarContainer.style.display = 'block';
            buildUsefulInfoSearchIndex(progressBar, progressText).then(() => {
                updateUsefulInfoButtonTitles();
                setTimeout(() => { progressBarContainer.style.display = 'none'; }, 500);
                searchInput.disabled = false;
                searchInput.placeholder = currentLanguage === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            });
        }, 1000);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = '';
            if (!isUsefulInfoIndexBuilt || query.length < 2) { resultsContainer.classList.add('hidden'); showNav(true); return; }
            showNav(false);
            const results = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage, 'usefulInfo');
            if (results.length > 0) {
                results.slice(0, 7).forEach(result => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    const snippet = SearchEngine.generateSnippet(result.text, query);
                    itemEl.innerHTML = `${SearchEngine.highlight(snippet, query)} <small>${result.title}</small>`;
                    itemEl.addEventListener('click', () => {
                        searchInput.value = '';
                        resultsContainer.classList.add('hidden');
                        loadInformationContent(result.url, result.title, result.text);
                    });
                    resultsContainer.appendChild(itemEl);
                });
                resultsContainer.classList.remove('hidden');
            } else { resultsContainer.classList.add('hidden'); showNav(true); }
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
            usefulInfoFiles = (await response.json()).filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            navContainer.innerHTML = '';
            if (usefulInfoFiles.length === 0) { navContainer.innerHTML = `<p>${currentLanguage === 'gr' ? 'Δεν βρέθηκαν πληροφορίες.' : 'No information found.'}</p>`; return; }
            
            usefulInfoFiles.forEach(file => {
                let titleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                let titleGR = titleEN; 
                const match = file.name.match(/(.+?)_\((.+?)\)/);
                if (match && match[1] && match[2]) { titleEN = match[1].replace(/_/g, ' ').trim(); titleGR = match[2].replace(/_/g, ' ').trim(); }
    
                const button = document.createElement('button');
                button.className = 'app-icon';
                button.dataset.url = file.download_url;
                button.innerHTML = `<i class="fas fa-book-open"></i><span data-en="${titleEN}" data-gr="${titleGR}">${currentLanguage === 'gr' ? titleGR : titleEN}</span>`;
                button.addEventListener('click', () => {
                    const span = button.querySelector('span');
                    const modalTitle = (currentLanguage === 'gr' ? span.getAttribute('data-gr') : span.getAttribute('data-en')) || '';
                    loadInformationContent(file.download_url, modalTitle);
                });
                navContainer.appendChild(button);
            });
            usefulInformationLoaded = true;
        } catch (error) {
            console.error('Failed to fetch useful information:', error);
            navContainer.innerHTML = `<p style="color: var(--nm-danger);">${currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης.' : 'Failed to load.'}</p>`;
        } finally { isFetchingUsefulInfo = false; }
    }

    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        document.querySelectorAll('.article-modal-overlay').forEach(m => m.remove());
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay article-modal-overlay'; 
        modalOverlay.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>${title}</h2><button class="close-modal">&times;</button></div><div class="modal-body">${htmlContent}</div></div>`;
        document.body.appendChild(modalOverlay);

        let counter = 0;
        modalOverlay.querySelectorAll('.code-container').forEach(container => {
            const copyBtn = container.querySelector('.copy-btn');
            const codeEl = container.querySelector('code');
            if (copyBtn && codeEl) {
                if (!codeEl.id) codeEl.id = `dynamic-code-${Date.now()}-${counter++}`;
                copyBtn.addEventListener('click', () => window.copyToClipboard(copyBtn, codeEl.id));
            }
        });
        
        setTimeout(() => modalOverlay.classList.add('visible'), 10);
        changeLanguage(currentLanguage);
    
        if (textToHighlight) {
            setTimeout(() => {
                const modalBody = modalOverlay.querySelector('.modal-body');
                const targetElement = Array.from(modalBody.querySelectorAll('p, li, h3, h4, b, code, .tip, .note')).find(el => el.textContent.trim().replace(/\s\s+/g, ' ') === textToHighlight.trim());
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
            document.querySelectorAll('#useful-information-nav .app-icon').forEach(article => article.style.display = 'flex');
        };

        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
        modalOverlay.querySelector('.close-modal').addEventListener('click', closeModal);
    }

    async function loadInformationContent(url, title, textToHighlight = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            createAndShowArticleModal(title, await response.text(), textToHighlight);
        } catch (error) { console.error('Failed to load content:', error); }
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

        if (document.getElementById('useful-information-nav')) {
            initializeUsefulInfoSearch();
            fetchUsefulInformation();
        }

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
