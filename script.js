document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PORTFOLIO STATE ---
    let currentLanguage = 'en';
    let searchIndex = []; // Now stores site-wide content snippets
    let usefulInfoSearchIndex = []; // Dedicated index for the modal
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;
    
    // --- LOGO URLS (Raw permalinks from request) ---
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
            
            // Reset specific modals on close
            if (modal.id === 'useful-information-modal') {
                document.getElementById('useful-info-prompt').style.display = 'block';
                document.getElementById('useful-info-search-input').value = '';
                document.getElementById('useful-info-results-container').classList.add('hidden');
                document.getElementById('useful-information-nav').querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'flex';
                });
            }
            
            modal.querySelectorAll('.content-highlight').forEach(el => {
                el.classList.remove('content-highlight');
            });
        }

        // --- LANGUAGE AND MODAL LOGIC ---
        const languageModal = document.getElementById('language-selection-modal');
        const languageModalCloseBtn = languageModal.querySelector('.close-modal');
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const installationModal = document.getElementById('installation-modal');

        const updateNodeText = (node, text) => {
            for (const child of node.childNodes) {
                if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                    child.textContent = text;
                    break;
                }
            }
        };

        const changeLanguage = (lang, container = document) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            container.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                if (el.children.length > 0) {
                     updateNodeText(el, text);
                } else {
                     el.textContent = text;
                }
            });

            container.querySelectorAll('[data-lang-section]').forEach(el => {
                el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
                if (el.classList.contains('hidden-by-default')) {
                    el.classList.toggle('hidden-by-default', el.dataset.langSection !== lang);
                }
            });
            
            if (container === document) {
                document.querySelectorAll('.language-button').forEach(button => {
                    button.classList.toggle('selected', button.dataset.lang === lang);
                });

                document.title = "DedSec Project";

                const searchInput = document.getElementById('main-search-input');
                if (searchInput) {
                    searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση...' : 'Search...';
                }
                const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
                if (usefulInfoSearchInput) {
                    usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
                }
            }
        };
        
        languageModal.querySelectorAll('.language-button').forEach(button => {
            button.addEventListener('click', () => {
                try {
                    changeLanguage(button.dataset.lang);
                } catch (error) {
                    console.error("An error occurred while changing the language:", error);
                } finally {
                    hideModal(languageModal);
                }
            });
        });
        
        document.getElementById('lang-switcher-btn').addEventListener('click', () => {
            if (languageModalCloseBtn) languageModalCloseBtn.style.display = ''; 
            showModal(languageModal);
        });

        // --- THEME SWITCHER LOGIC ---
        const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
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

        // --- DISCLAIMER AND MODAL OPENING LOGIC ---
        document.getElementById('accept-disclaimer').addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            hideModal(disclaimerModal);
            if (installationModal) {
                showModal(installationModal);
            }
        });
        document.getElementById('decline-disclaimer').addEventListener('click', () => window.location.href = 'https://www.google.com');
        
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
                    setTimeout(() => {
                        highlightModalContent(modal, highlightText);
                    }, 400); 
                }
            }
        };

        const highlightModalContent = (modal, text) => {
            const modalBody = modal.querySelector('.modal-body');
            if (!modalBody) return;
            
            const activeSections = modalBody.querySelectorAll(`[data-lang-section="${currentLanguage}"], :not([data-lang-section])`);
            let targetElement = null;

            activeSections.forEach(section => {
                 if (targetElement) return;
                 const searchRoot = section.hasAttribute('data-lang-section') ? section : modalBody;
                 const allElements = searchRoot.querySelectorAll('h3, h4, p, li, b, code, span, .note, .tip, .modal-disclaimer');
                 targetElement = Array.from(allElements).find(el => el.textContent.trim().includes(text.trim()));
            });

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.classList.add('content-highlight');
                setTimeout(() => {
                    targetElement.classList.remove('content-highlight');
                }, 2500);
            } else {
                console.warn("Could not find element to highlight for text:", text);
            }
        };
        
        document.querySelectorAll('button.app-wrapper[data-modal]').forEach(wrapper => {
            const modalId = wrapper.dataset.modal;
            if (modalId) {
                wrapper.addEventListener('click', () => openModalAndHighlight(modalId));
            }
        });

        // --- MODAL CLOSING AND RESET LOGIC ---
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal && modal.id !== 'language-selection-modal') {
                    hideModal(modal);
                }
            });
            const closeModalButton = modal.querySelector('.close-modal');
            if (closeModalButton) {
                if (modal.id !== 'language-selection-modal') { 
                    closeModalButton.addEventListener('click', () => hideModal(modal));
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const visibleModals = document.querySelectorAll('.modal-overlay.visible');
                if (visibleModals.length > 0) {
                    const topModal = visibleModals[visibleModals.length - 1];
                    if (topModal.id !== 'language-selection-modal') {
                        hideModal(topModal);
                    }
                }
            }
        });
        
        // This function remains on the window object as per the provided file structure
        window.copyToClipboard = (button, targetId) => {
            const codeElement = document.getElementById(targetId);
            if (!codeElement || !navigator.clipboard) return; 

            const textToCopy = codeElement.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        };
        
        const carousel = document.querySelector('.gym-carousel');
        if (carousel) {
            const images = carousel.querySelectorAll('.gym-clothing-images img');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            let currentIndex = 0;
            const totalImages = images.length;

            if (totalImages > 0) {
                const showImage = (index) => {
                    images.forEach((img, i) => img.classList.toggle('active', i === index));
                };
                prevBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
                    showImage(currentIndex);
                });
                nextBtn.addEventListener('click', () => {
                    currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
                    showImage(currentIndex);
                });
                showImage(currentIndex);
            }
        }
        
        // --- SITE-WIDE SEARCH INDEXING ---
        function buildSiteWideSearchIndex() {
            if (searchIndex.length > 0) return;
            
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (['language-selection-modal', 'disclaimer-modal', 'article-viewer-modal'].includes(modal.id)) return;
                
                const modalId = modal.id.replace('-modal', '');
                const modalTitle = modal.querySelector('.modal-header h2') ? modal.querySelector('.modal-header h2').textContent.trim() : modalId;
                
                modal.querySelectorAll('.modal-body').forEach(body => {
                    const lang = body.dataset.langSection || 'en';
                    body.querySelectorAll('h3, h4, p, li, code, .tip, .note, .modal-disclaimer').forEach(el => {
                        if (el.textContent.trim().length < 5) return;
                        const text = el.textContent.trim().replace(/\s\s+/g, ' ');
                        const isTitle = ['H3', 'H4'].includes(el.tagName);
                        searchIndex.push({ lang, title: modalTitle, text, modalId, weight: isTitle ? 5 : 1 });
                    });
                });
            });
        }
        
        // --- MAIN SEARCH FUNCTIONALITY ---
        function initializeSearch() {
            const searchInput = document.getElementById('main-search-input');
            const resultsContainer = document.getElementById('search-results-container');
            const searchContainer = document.querySelector('.search-container');

            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                resultsContainer.innerHTML = '';

                if (query.length < 2) {
                    resultsContainer.classList.add('hidden');
                    return;
                }
                
                let results = searchIndex.filter(item => {
                    return item.lang === currentLanguage && item.text.toLowerCase().includes(query);
                });
                results.sort((a, b) => b.weight - a.weight);
                
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
                    const noResultEl = document.createElement('div');
                    noResultEl.classList.add('search-result-item');
                    noResultEl.textContent = currentLanguage === 'gr' ? 'Δεν βρέθηκαν αποτελέσματα' : 'No results found';
                    resultsContainer.appendChild(noResultEl);
                    resultsContainer.classList.remove('hidden');
                }
            });

            searchInput.addEventListener('blur', () => {
                setTimeout(() => { resultsContainer.classList.add('hidden'); }, 150);
            });

            document.addEventListener('click', (e) => {
                if (searchContainer && !searchContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                }
            });
        }
        
        // --- USEFUL INFO SEARCH FUNCTIONALITY ---
        function initializeUsefulInfoSearch() {
            const searchInput = document.getElementById('useful-info-search-input');
            const resultsContainer = document.getElementById('useful-info-results-container');
            if (!searchInput || !resultsContainer) return;

            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                resultsContainer.innerHTML = '';

                if (query.length < 3) {
                    resultsContainer.classList.add('hidden');
                    document.getElementById('useful-information-nav').querySelectorAll('.app-icon').forEach(article => {
                        article.style.display = 'flex';
                    });
                    return;
                }
                
                document.getElementById('useful-information-nav').querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'none';
                });

                let results = usefulInfoSearchIndex.filter(item => 
                    item.lang === currentLanguage && item.text.toLowerCase().includes(query)
                );
                
                const sortedResults = results.sort((a, b) => b.weight - a.weight);

                if (sortedResults.length > 0) {
                    sortedResults.slice(0, 7).forEach(result => {
                        const itemEl = document.createElement('div');
                        itemEl.classList.add('search-result-item');
                        const snippet = result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '');
                        const highlightedSnippet = snippet.replace(new RegExp(query, 'gi'), '<strong>$&</strong>'); 
                        itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                        
                        itemEl.addEventListener('click', async () => {
                            searchInput.value = '';
                            resultsContainer.classList.add('hidden');
                            await loadInformationContent(result.url, result.text, result.title); 
                        });
                        resultsContainer.appendChild(itemEl);
                    });
                    resultsContainer.classList.remove('hidden');
                } else {
                    resultsContainer.classList.add('hidden');
                }
            });

            document.addEventListener('click', (e) => {
                const searchContainer = document.querySelector('.modal-search-container');
                if (searchContainer && !searchContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                }
            });
        }
        
        // --- INITIAL PAGE LOAD ---
        if (languageModalCloseBtn) {
            languageModalCloseBtn.style.display = 'none';
        }
        showModal(languageModal);
        changeLanguage('en'); 
        buildSiteWideSearchIndex();
        initializeSearch();
        initializeUsefulInfoSearch();
    }

    // --- USEFUL INFORMATION LOGIC (GITHUB API) ---
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
            
            const htmlFiles = files.filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            if (htmlFiles.length === 0) {
                 navContainer.innerHTML = `<p>${currentLanguage === 'gr' ? 'Δεν βρέθηκαν πληροφορίες.' : 'No information found.'}</p>`;
                 return;
            }
            
            usefulInfoSearchIndex = [];
            const indexPromises = htmlFiles.map(async (file) => {
                try {
                    const tipContentResponse = await fetch(file.download_url);
                    if (!tipContentResponse.ok) return;
                    const htmlContent = await tipContentResponse.text();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    const infoName = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' '); 

                    tempDiv.querySelectorAll('[data-lang-section]').forEach(section => {
                        const lang = section.dataset.langSection;
                        section.querySelectorAll('h3, h4, p, li, b, code').forEach(el => {
                            const text = el.textContent.trim();
                            if (text.length > 5) {
                                usefulInfoSearchIndex.push({
                                    lang: lang, title: infoName, text: text, url: file.download_url,
                                    weight: (el.tagName === 'H3' ? 5 : 1)
                                });
                            }
                        });
                    });
                } catch (e) { console.error(`Failed to index information: ${file.name}`, e); }
            });
            
            await Promise.all(indexPromises);

            navContainer.innerHTML = '';
            htmlFiles.forEach(file => {
                const button = document.createElement('button');
                button.className = 'app-icon';
                const icon = document.createElement('i');
                icon.className = 'fas fa-book-open';
                const span = document.createElement('span');
                const title = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                span.textContent = title;
                
                button.appendChild(icon);
                button.appendChild(span);
                
                button.addEventListener('click', async () => await loadInformationContent(file.download_url, null, title));
                navContainer.appendChild(button);
            });

            usefulInformationLoaded = true;

        } catch (error) {
            console.error('Failed to fetch useful information:', error);
            navContainer.innerHTML = `<p style="color: var(--nm-danger);">${currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης περιεχομένου.' : 'Failed to load content.'}</p>`;
        } finally {
            isFetchingUsefulInfo = false;
        }
    }

    // FIX: This function now targets the new #article-viewer-modal to create a pop-up effect.
    async function loadInformationContent(url, textToHighlight = null, title = 'Information') {
        const articleModal = document.getElementById('article-viewer-modal');
        if (!articleModal) {
            console.error('Article viewer modal is missing from index.html!');
            return;
        }
        
        const titleElement = articleModal.querySelector('.article-title');
        const contentContainer = articleModal.querySelector('.modal-body');
        
        if (!titleElement || !contentContainer) {
            console.error('Article viewer modal is not set up correctly in the HTML.');
            return;
        }

        titleElement.textContent = title;
        contentContainer.innerHTML = `<p>${currentLanguage === 'gr' ? 'Φόρτωση...' : 'Loading...'}</p>`;
        showModal(articleModal);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content: ${response.status}`);
            const htmlContent = await response.text();
            contentContainer.innerHTML = htmlContent;
            
            changeLanguage(currentLanguage, contentContainer);

            if (textToHighlight) {
                setTimeout(() => {
                    const allElements = contentContainer.querySelectorAll('p, li, h3, b, code, .tip, .note'); 
                    const targetElement = Array.from(allElements).find(el => el.textContent.trim().includes(textToHighlight.trim()));
    
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetElement.classList.add('content-highlight');
                        setTimeout(() => {
                            targetElement.classList.remove('content-highlight');
                        }, 2500);
                    } else {
                        console.warn("Could not find element to highlight for text:", textToHighlight);
                    }
                }, 400);
            }
        } catch (error) {
            console.error('Failed to load content:', error);
            contentContainer.innerHTML = `<p style="color: var(--nm-danger);">${currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης περιεχομένου.' : 'Failed to load content.'}</p>`;
        }
    }
    
    // --- INITIALIZE ALL FEATURES ---
    initializePortfolio();
});