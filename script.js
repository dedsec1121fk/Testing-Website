document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PORTFOLIO STATE ---
    let currentLanguage = 'en';
    let searchIndex = []; // Stores site-wide content snippets
    let usefulInfoSearchIndex = []; // Dedicated index for the modal, BUILT ON DEMAND
    let usefulInfoFiles = []; // Stores the list of files to avoid re-fetching
    let isUsefulInfoIndexBuilt = false; // Flag to check if the full index is ready
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

    // --- LOGO URLS ---
    const LOGO_URLS = {
        dark: 'https://raw.githubusercontent.com/dedsec1121fk/dedsec1121fk.github.io/5860edb8a7468d955336c9cf1d8b357597d6d645/Assets/Images/Logos/Custom%20Black%20Purple%20Fox%20Logo.png',
        light: 'https://raw.githubusercontent.com/dedsec1121fk/dedsec1121fk.github.io/6f776cd9772a079a6d26370dddab911bf7cde8cd/Assets/Images/Logos/Custom%20White%20Purple%20Fox%20Logo.jpg'
    };

    // --- PORTFOLIO INITIALIZATION ---
    function initializePortfolio() {
        // --- MODAL HELPER FUNCTIONS ---
        function showModal(modal) {
            if (!modal) return;
            modal.classList.add('visible');
        }

        function hideModal(modal) {
            if (!modal) return;
            modal.classList.remove('visible');
        }

        // --- LANGUAGE AND MODAL LOGIC ---
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
            if (searchInput) searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση...' : 'Search...';
            
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

        // --- THEME SWITCHER LOGIC ---
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

        // --- DISCLAIMER AND MODAL OPENING LOGIC ---
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
            const targetElement = Array.from(allElements).find(el => el.textContent.trim().includes(text.trim()));

            if (targetElement) {
                modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                targetElement.classList.add('content-highlight');
                setTimeout(() => targetElement.classList.remove('content-highlight'), 2500);
            }
        };
        
        document.querySelectorAll('button.app-wrapper[data-modal]').forEach(wrapper => {
            wrapper.addEventListener('click', () => openModalAndHighlight(wrapper.dataset.modal));
        });

        // --- MODAL CLOSING AND RESET LOGIC ---
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
        
        buildSiteWideSearchIndex();
        initializeSearch();
        initializeUsefulInfoSearch();
        
        // --- INITIAL PAGE LOAD ---
        if (languageModalCloseBtn) languageModalCloseBtn.style.display = 'none';
        showModal(languageModal);
        changeLanguage('en'); 
    }

    function buildSiteWideSearchIndex() {
        if (searchIndex.length > 0) return;
        document.querySelectorAll('.modal-overlay:not(#language-selection-modal):not(#disclaimer-modal)').forEach(modal => {
            const modalId = modal.id.replace('-modal', '');
            const modalTitle = modal.querySelector('.modal-header h2')?.textContent.trim() || modalId;
            modal.querySelectorAll('h3, h4, p, li, code, .tip, .note, .modal-disclaimer').forEach(el => {
                const text = el.textContent.trim().replace(/\s\s+/g, ' ');
                if (text.length < 5) return;
                ['en', 'gr'].forEach(lang => {
                    const langSection = el.closest('[data-lang-section]');
                    if (!langSection || langSection.dataset.langSection === lang) {
                        searchIndex.push({ lang, title: modalTitle, text, modalId, weight: ['H3', 'H4'].includes(el.tagName) ? 5 : 1 });
                    }
                });
            });
        });
    }

    function initializeSearch() {
        const searchInput = document.getElementById('main-search-input');
        const resultsContainer = document.getElementById('search-results-container');
        const searchContainer = searchInput?.closest('.search-container');
        if (!searchInput || !resultsContainer || !searchContainer) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            resultsContainer.innerHTML = '';
            if (query.length < 2) {
                resultsContainer.classList.add('hidden');
                return;
            }
            
            const results = searchIndex
                .filter(item => item.lang === currentLanguage && item.text.toLowerCase().includes(query))
                .sort((a, b) => b.weight - a.weight);

            if (results.length > 0) {
                results.slice(0, 7).forEach(result => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    const snippet = result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '');
                    const highlightedSnippet = snippet.replace(new RegExp(query, 'gi'), '<strong>$&</strong>');
                    itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                    itemEl.addEventListener('click', (e) => {
                        e.preventDefault(); 
                        searchInput.value = '';
                        resultsContainer.classList.add('hidden');
                        openModalAndHighlight(result.modalId, result.text);
                    });
                    resultsContainer.appendChild(itemEl);
                });
                resultsContainer.classList.remove('hidden');
            } else {
                resultsContainer.innerHTML = `<div class="search-result-item">${currentLanguage === 'gr' ? 'Δεν βρέθηκαν αποτελέσματα' : 'No results found'}</div>`;
                resultsContainer.classList.remove('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                resultsContainer.classList.add('hidden');
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

                // Extract multilingual titles from the article HTML, with a fallback to the filename
                const fallbackTitle = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                const titlesContainer = tempDiv.querySelector('#article-titles');
                const titleEN = titlesContainer?.querySelector('[data-lang="en"]')?.textContent.trim() || fallbackTitle;
                const titleGR = titlesContainer?.querySelector('[data-lang="gr"]')?.textContent.trim() || titleEN;

                tempDiv.querySelectorAll('[data-lang-section]').forEach(section => {
                    const lang = section.dataset.langSection;
                    // Use the correct title for the language section being indexed
                    const articleTitle = lang === 'gr' ? titleGR : titleEN;
                    section.querySelectorAll('h3, h4, p, li, b, code').forEach(el => {
                        const text = el.textContent.trim();
                        if (text.length > 5) {
                            usefulInfoSearchIndex.push({
                                lang, title: articleTitle, text, url: file.download_url,
                                weight: (el.tagName === 'H3' ? 5 : 1)
                            });
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
        isUsefulInfoIndexBuilt = true;
    }

    function updateUsefulInfoButtonTitles() {
        const titleMap = new Map();

        // Create a map of URLs to their multilingual titles from the now-built search index
        usefulInfoSearchIndex.forEach(item => {
            if (!titleMap.has(item.url)) {
                titleMap.set(item.url, {});
            }
            const langTitles = titleMap.get(item.url);
            if (!langTitles[item.lang]) { // Store title once per language to avoid overwrite
                langTitles[item.lang] = item.title;
            }
        });

        // Update the data attributes and text content of the navigation buttons
        document.querySelectorAll('#useful-information-nav .app-icon[data-url]').forEach(button => {
            const url = button.dataset.url;
            const titles = titleMap.get(url);
            if (titles) {
                const buttonSpan = button.querySelector('span');
                if(buttonSpan) {
                   buttonSpan.setAttribute('data-en', titles.en || '');
                   buttonSpan.setAttribute('data-gr', titles.gr || titles.en || ''); // Fallback GR to EN
                   // Update the visible text to the current language
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
            
            updateUsefulInfoButtonTitles(); // Update titles now that index is built

            setTimeout(() => {
                progressBarContainer.style.display = 'none';
            }, 500);

            searchInput.disabled = false;
            searchInput.placeholder = currentLanguage === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            searchInput.focus();
        }, { once: true });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            resultsContainer.innerHTML = '';

            if (!isUsefulInfoIndexBuilt || query.length < 2) {
                resultsContainer.classList.add('hidden');
                showNav(true);
                return;
            }
            
            showNav(false);

            const results = usefulInfoSearchIndex
                .filter(item => item.lang === currentLanguage && item.text.toLowerCase().includes(query))
                .sort((a, b) => b.weight - a.weight);

            if (results.length > 0) {
                results.slice(0, 7).forEach(result => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    const snippet = result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '');
                    const highlightedSnippet = snippet.replace(new RegExp(query, 'gi'), '<strong>$&</strong>');
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
                const articleTitle = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                const button = document.createElement('button');
                button.className = 'app-icon';
                button.dataset.url = file.download_url; // For later identification
                // Add data attributes to the span for translation, pre-filled with filename
                button.innerHTML = `<i class="fas fa-book-open"></i><span data-en="${articleTitle}" data-gr="${articleTitle}">${articleTitle}</span>`;
                button.addEventListener('click', () => {
                    const span = button.querySelector('span');
                    // Determine the correct title for the modal based on current language attributes
                    const modalTitle = (currentLanguage === 'gr' ? span.getAttribute('data-gr') : span.getAttribute('data-en')) || articleTitle;
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
                const targetElement = Array.from(allElements).find(el => el.textContent.trim().includes(textToHighlight.trim()));
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
            
            // --- FIX: Reset the underlying modal's state when closing an article ---
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