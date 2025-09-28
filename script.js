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
        }

        // --- LANGUAGE AND MODAL LOGIC ---
        const languageModal = document.getElementById('language-selection-modal');
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const installationModal = document.getElementById('installation-modal');

        window.changeLanguage = (lang) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            document.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');

                // Update the data-text attribute for the H1 glow effect
                if (el.tagName === 'H1') el.dataset.text = text;
                
                // More robust check to prevent destroying child HTML elements.
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
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση...' : 'Search...';
            }
            const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
            if (usefulInfoSearchInput) {
                usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            }
        };
        
        // This logic will be attached to the buttons inside the lazy-loaded language modal
        document.body.addEventListener('click', event => {
            if (event.target.matches('.language-button')) {
                try {
                    changeLanguage(event.target.dataset.lang);
                } catch (error) {
                    console.error("An error occurred while changing the language:", error);
                } finally {
                    hideModal(languageModal);
                }
            }
        });
        
        document.getElementById('lang-switcher-btn').addEventListener('click', () => {
             openModalAndHighlight('language-selection');
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
        // Use event delegation for buttons that will be loaded later
        document.body.addEventListener('click', event => {
            if (event.target.id === 'accept-disclaimer') {
                localStorage.setItem('disclaimerAccepted', 'true');
                hideModal(disclaimerModal);
                showModal(installationModal);
            }
            if (event.target.id === 'decline-disclaimer') {
                window.location.href = 'https://www.google.com';
            }
        });

        // NEW LAZY-LOADING openModalAndHighlight FUNCTION
        window.openModalAndHighlight = async (modalId, highlightText = null) => {
            if (modalId === 'installation' && !localStorage.getItem('disclaimerAccepted')) {
                // Ensure disclaimer is loaded before showing
                await openModalAndHighlight('disclaimer');
                return;
            }
        
            const modal = document.getElementById(`${modalId}-modal`);
            if (!modal) return;
        
            // --- LAZY LOADING LOGIC ---
            if (modal.innerHTML.trim() === '') {
                try {
                    const response = await fetch(`modals/${modalId}.html`);
                    if (!response.ok) throw new Error(`Network response was not ok for ${modalId}.html`);
                    const content = await response.text();
                    modal.innerHTML = content;
        
                    const closeModalButton = modal.querySelector('.close-modal');
                    if (closeModalButton) {
                        closeModalButton.addEventListener('click', () => hideModal(modal));
                    }
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) hideModal(modal);
                    });
                    
                    changeLanguage(currentLanguage);
        
                } catch (error) {
                    console.error('Failed to fetch modal content:', error);
                    modal.innerHTML = '<div class="modal-content" style="text-align:center; padding: 2rem; color: var(--nm-danger);">Error: Could not load content.</div>';
                }
            }
            // --- END LAZY LOADING LOGIC ---
        
            showModal(modal);
            
            if (modalId === 'useful-information' && !usefulInformationLoaded) {
                fetchUsefulInformation();
            }
            
            if (highlightText) {
                setTimeout(() => {
                    highlightModalContent(modal, highlightText);
                }, 150); 
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
                modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                targetElement.classList.add('content-highlight');
                setTimeout(() => {
                    targetElement.classList.remove('content-highlight');
                }, 2500);
            }
        };
        
        document.querySelectorAll('button.app-wrapper[data-modal]').forEach(wrapper => {
            const modalId = wrapper.dataset.modal;
            if (modalId) {
                wrapper.addEventListener('click', () => openModalAndHighlight(modalId));
            }
        });

        // Global handler for dynamically loaded close buttons and overlays
        document.body.addEventListener('click', event => {
            if (event.target.classList.contains('close-modal')) {
                const modal = event.target.closest('.modal-overlay');
                if (modal) hideModal(modal);
            }
            if (event.target.classList.contains('modal-overlay')) {
                hideModal(event.target);
            }
        });
        
        window.copyToClipboard = (button, targetId) => {
            const codeElement = document.getElementById(targetId);
            if (!codeElement || !navigator.clipboard) return; 

            const textToCopy = codeElement.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = button.textContent;
                button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηке!' : 'Copied!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        };
        
        // Carousel logic (delegated click)
        document.body.addEventListener('click', event => {
            const carousel = event.target.closest('.gym-carousel');
            if (!carousel) return;

            const images = carousel.querySelectorAll('.gym-clothing-images img');
            if (images.length === 0) return;
            
            let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
            const totalImages = images.length;

            if (event.target.matches('.carousel-btn.next')) {
                currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
            } else if (event.target.matches('.carousel-btn.prev')) {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
            }
            images.forEach((img, i) => img.classList.toggle('active', i === currentIndex));
        });
        
        
        // --- SITE-WIDE SEARCH INDEXING (DEFERRED) ---
        function buildSiteWideSearchIndex() {
            // This is a placeholder now. Ideally, you would fetch a pre-built JSON index.
            // For now, we will leave it empty to prevent blocking the main thread.
            // You can re-implement this using a Web Worker or by fetching a JSON file.
            searchIndex = []; 
        }
        
        function initializeSearch() {
            const searchInput = document.getElementById('main-search-input');
            const resultsContainer = document.getElementById('search-results-container');
            const searchContainer = document.querySelector('.search-container');
            // Search will be disabled until an index is built or fetched.
        }
        
        function initializeUsefulInfoSearch() {
            const searchInput = document.getElementById('useful-info-search-input');
            const resultsContainer = document.getElementById('useful-info-results-container');
            // This logic can remain as it depends on an async fetch.
        }
        
        // --- INITIAL PAGE LOAD ---
        openModalAndHighlight('language-selection').then(() => {
            const langModal = document.getElementById('language-selection-modal');
            const closeBtn = langModal.querySelector('.close-modal');
            if (closeBtn) closeBtn.style.display = 'none'; // Ensure it's hidden on first load
        });

        changeLanguage('en');
        buildSiteWideSearchIndex();
        initializeSearch();
    }

    // --- USEFUL INFORMATION LOGIC (UNCHANGED) ---
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
            
            // This part is now just for navigation, not indexing
            navContainer.innerHTML = '';
            htmlFiles.forEach(file => {
                const button = document.createElement('button');
                button.className = 'app-icon';
                const icon = document.createElement('i');
                icon.className = 'fas fa-book-open';
                const span = document.createElement('span');
                
                const articleTitle = file.name
                    .replace(/\.html$/, '') 
                    .replace(/^\d+_/, '') 
                    .replace(/_/g, ' ');
                span.textContent = articleTitle;
                
                button.appendChild(icon);
                button.appendChild(span);
                
                button.addEventListener('click', async () => await loadInformationContent(file.download_url, articleTitle));
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

    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        document.querySelectorAll('.article-modal-overlay').forEach(modal => modal.remove());

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay article-modal-overlay'; 
    
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
    
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `<h2>${title}</h2><button class="close-modal">&times;</button>`;
    
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = htmlContent;
    
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        setTimeout(() => modalOverlay.classList.add('visible'), 10);
    
        changeLanguage(currentLanguage);
    
        if (textToHighlight) {
            setTimeout(() => {
                const allElements = modalBody.querySelectorAll('p, li, h3, h4, b, code, .tip, .note');
                const targetElement = Array.from(allElements).find(el => el.textContent.trim().includes(textToHighlight.trim()));
    
                if (targetElement) {
                    modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                    targetElement.classList.add('content-highlight');
                    setTimeout(() => {
                        targetElement.classList.remove('content-highlight');
                    }, 2500);
                }
            }, 150);
        }
        
        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            modalOverlay.addEventListener('transitionend', () => modalOverlay.remove(), { once: true });
        };
    
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    
        modalHeader.querySelector('.close-modal').addEventListener('click', closeModal);
    }

    async function loadInformationContent(url, title, textToHighlight = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content: ${response.status}`);
            const htmlContent = await response.text();
            
            createAndShowArticleModal(title, htmlContent, textToHighlight);

        } catch (error) {
            console.error('Failed to load content:', error);
            alert(currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης περιεχομένου.' : 'Failed to load content.');
        }
    }
    
    // --- INITIALIZE ALL FEATURES ---
    initializePortfolio();
});