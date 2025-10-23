document.addEventListener('DOMContentLoaded', () => {
    let currentLanguage = localStorage.getItem('dedsec-language') || 'en';
    let usefulInfoSearchIndex = [];
    let usefulInfoFiles = [];
    let isUsefulInfoIndexBuilt = false;
    let isFetchingUsefulInfo = false;

    // --- SEARCH ENGINE LOGIC ---
    const SearchEngine = {
        tokenize: text => text.toLowerCase().replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean),
        preprocessItem: item => ({ ...item, titleTokens: SearchEngine.tokenize(item.title), textTokens: SearchEngine.tokenize(item.text) }),
        calculateIdf: (index) => {
            const docFreq = new Map();
            index.forEach(item => {
                new Set([...item.titleTokens, ...item.textTokens]).forEach(token => docFreq.set(token, (docFreq.get(token) || 0) + 1));
            });
            const idfMap = new Map();
            docFreq.forEach((freq, token) => idfMap.set(token, Math.log(index.length / (1 + freq))));
            return idfMap;
        },
        search: (query, index, idfMap) => {
            const queryTokens = SearchEngine.tokenize(query);
            if (!queryTokens.length) return [];
            const results = index.map(item => {
                let score = 0;
                queryTokens.forEach(qToken => {
                    const idf = idfMap.get(qToken) || 0.5;
                    if (item.titleTokens.includes(qToken)) score += 10 * idf;
                    if (item.textTokens.includes(qToken)) score += 1 * idf;
                });
                return { ...item, score };
            });
            return results.filter(item => item.score > 0).sort((a, b) => b.score - a.score);
        },
    };

    let idfMap = new Map();

    // --- GITHUB API & ARTICLE HANDLING ---
    async function fetchUsefulInformation() {
        if (isFetchingUsefulInfo) return;
        isFetchingUsefulInfo = true;
        const navContainer = document.getElementById('useful-information-nav');
        const loadingMessage = navContainer.querySelector('.loading-message');
        const GITHUB_API_URL = 'https://api.github.com/repos/dedsec1121fk/dedsec1121fk.github.io/contents/Useful_Information';

        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const files = await response.json();
            usefulInfoFiles = files.filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            if (loadingMessage) loadingMessage.remove();
            navContainer.innerHTML = '';

            usefulInfoFiles.forEach(file => {
                let titleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                let titleGR = titleEN;
                const match = file.name.match(/(.+?)_\((.+?)\)/);
                if (match) {
                    titleEN = match[1].replace(/_/g, ' ').trim();
                    titleGR = match[2].replace(/_/g, ' ').trim();
                }

                const button = document.createElement('a');
                button.href = '#';
                button.className = 'app-icon';
                button.innerHTML = `<i class="fas fa-book-open"></i><span data-en="${titleEN}" data-gr="${titleGR}">${currentLanguage === 'gr' ? titleGR : titleEN}</span>`;
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadArticleContent(file.download_url, currentLanguage === 'gr' ? titleGR : titleEN);
                });
                navContainer.appendChild(button);
            });
            await buildSearchIndex();
        } catch (error) {
            console.error('Failed to fetch useful information:', error);
            if (loadingMessage) loadingMessage.textContent = 'Failed to load articles.';
        } finally {
            isFetchingUsefulInfo = false;
        }
    }

    async function buildSearchIndex() {
        const indexPromises = usefulInfoFiles.map(async (file) => {
            const response = await fetch(file.download_url);
            const htmlContent = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            let titleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
            let titleGR = titleEN;
            const match = file.name.match(/(.+?)_\((.+?)\)/);
            if (match) {
                titleEN = match[1].replace(/_/g, ' ').trim();
                titleGR = match[2].replace(/_/g, ' ').trim();
            }

            const textEN = tempDiv.querySelector('[data-lang-section="en"]')?.textContent || '';
            const textGR = tempDiv.querySelector('[data-lang-section="gr"]')?.textContent || '';
            
            usefulInfoSearchIndex.push(SearchEngine.preprocessItem({ title: titleEN, text: textEN, url: file.download_url, lang: 'en'}));
            usefulInfoSearchIndex.push(SearchEngine.preprocessItem({ title: titleGR, text: textGR, url: file.download_url, lang: 'gr' }));
        });
        await Promise.all(indexPromises);
        idfMap = SearchEngine.calculateIdf(usefulInfoSearchIndex);
        isUsefulInfoIndexBuilt = true;
        console.log('Search index built.');
    }

    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = '';

            if (query.length < 2 || !isUsefulInfoIndexBuilt) {
                resultsContainer.classList.add('hidden');
                navContainer.style.display = 'grid';
                return;
            }

            const langIndex = usefulInfoSearchIndex.filter(item => item.lang === currentLanguage);
            const results = SearchEngine.search(query, langIndex, idfMap);
            
            if (results.length > 0) {
                navContainer.style.display = 'none';
                results.slice(0, 5).forEach(result => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'search-result-item';
                    itemEl.innerHTML = `<strong>${result.title}</strong><br><small>${result.text.substring(0, 100)}...</small>`;
                    itemEl.addEventListener('click', () => {
                        loadArticleContent(result.url, result.title);
                        searchInput.value = '';
                        resultsContainer.classList.add('hidden');
                    });
                    resultsContainer.appendChild(itemEl);
                });
                resultsContainer.classList.remove('hidden');
            } else {
                resultsContainer.classList.add('hidden');
                navContainer.style.display = 'grid';
            }
        });
    }

    async function loadArticleContent(url, title) {
        const modal = document.getElementById('article-modal');
        const modalTitle = document.getElementById('article-modal-title');
        const modalContent = document.getElementById('article-modal-content');
        
        modalTitle.textContent = 'Loading...';
        modalContent.innerHTML = '';
        modal.classList.add('visible');

        try {
            const response = await fetch(url);
            const htmlContent = await response.text();
            modalTitle.textContent = title;
            modalContent.innerHTML = htmlContent;
            // Re-apply language to the new modal content
            window.changeLanguage(currentLanguage);
        } catch (error) {
            modalTitle.textContent = 'Error';
            modalContent.innerHTML = '<p>Failed to load article content.</p>';
        }
    }
    
    // --- INITIALIZE PAGE ---
    fetchUsefulInformation();
    initializeUsefulInfoSearch();

    // Re-use common language switcher
    window.addEventListener('languageChanged', (e) => {
        currentLanguage = e.detail.lang;
        document.querySelectorAll('#useful-information-nav span').forEach(span => {
            span.textContent = span.getAttribute(`data-${currentLanguage}`) || span.getAttribute('data-en');
        });
    });
});