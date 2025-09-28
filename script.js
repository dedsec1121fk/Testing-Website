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
        const languageModalCloseBtn = languageModal.querySelector('.close-modal');
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const installationModal = document.getElementById('installation-modal');

        window.changeLanguage = (lang) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            document.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                const isSimpleTextElement = el.matches('h1, h2, h3, p, label, button, span, a');

                // FIX: More robust check to prevent destroying child HTML elements.
                // Only update textContent if the element has no element children.
                const hasElementChild = el.children.length > 0;

                if (isSimpleTextElement && !hasElementChild) {
                     el.textContent = text;
                }
            });

            document.querySelectorAll('[data-lang-section]').forEach(el => {
                // Use inline style to show/hide sections based on language
                el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
                
                // Also ensure main elements that might use hidden-by-default class are handled
                if (el.classList.contains('hidden-by-default')) {
                    el.classList.toggle('hidden-by-default', el.dataset.langSection !== lang);
                }
            });
            
            document.querySelectorAll('.language-button').forEach(button => {
                button.classList.toggle('selected', button.dataset.lang === lang);
            });

            const pageTitleEl = document.querySelector('title');
            if (pageTitleEl) document.title = "DedSec Project";

            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση...' : 'Search...';
            }
            const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
            if (usefulInfoSearchInput) {
                usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
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
                    
                    // --- MODIFICATION START (To prevent autopend) ---
                    // REMOVED: Logic to automatically show the disclaimer modal here.
                    // The disclaimer will now ONLY show when the 'Installation' app button is clicked
                    // and 'disclaimerAccepted' is not set.
                    // --- MODIFICATION END ---
                }
            });
        });
        
        document.getElementById('lang-switcher-btn').addEventListener('click', () => {
            // Re-enable close button when using the language switcher button later
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
            updateLogo(); // <--- CALL LOGO UPDATE
        };

        const updateLogo = () => {
             // The logo is set via CSS now, but this function remains for potential future use or if CSS fails
             const screenAfter = document.querySelector('.screen::after');
             if (!screenAfter) return;
             
             const isLight = document.body.classList.contains('light-theme');
             // The actual logo swap is handled by the CSS :after selector in style.css for light-theme
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
        updateLogo(); // <--- INITIAL LOGO LOAD

        // --- DISCLAIMER AND MODAL OPENING LOGIC ---
        document.getElementById('accept-disclaimer').addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            hideModal(disclaimerModal);
            if (installationModal) {
                // The installation modal will now ONLY open if clicked from the home screen
                // or if it was the target of a search result. 
                // We leave this path open for demonstration/ease of access after accepting.
                showModal(installationModal);
            }
        });
        document.getElementById('decline-disclaimer').addEventListener('click', () => window.location.href = 'https://www.google.com');
        
        // This is a global function to be used by both search and home screen buttons
        window.openModalAndHighlight = (modalId, highlightText = null) => {
            if (modalId === 'installation' && !localStorage.getItem('disclaimerAccepted') && disclaimerModal) {
                // Special case for installation modal to show disclaimer first
                showModal(disclaimerModal);
                return;
            }
            const modal = document.getElementById(`${modalId}-modal`);
            if (modal) {
                // Ensure the language modal close button is available if we open it
                if (modalId === 'language-selection' && languageModalCloseBtn) {
                     languageModalCloseBtn.style.display = '';
                }
                showModal(modal);
                
                // If the Useful Info modal is opened, start fetching the content index if not loaded
                if (modalId === 'useful-information' && !usefulInformationLoaded) {
                    fetchUsefulInformation();
                }
                
                // Highlight the text after the modal is open and rendered
                if (highlightText) {
                    // Use a small delay to ensure the content is visible before searching for text
                    setTimeout(() => {
                        highlightModalContent(modal, highlightText);
                    }, 100); 
                }
            }
        };

        const highlightModalContent = (modal, text) => {
            const modalBody = modal.querySelector('.modal-body');
            if (!modalBody) return;
            
            // Look for the specific text within the currently active language section
            // FIX: Ensure we check both the lang-section wrapper AND the modalBody itself
            const activeSections = modalBody.querySelectorAll(`[data-lang-section="${currentLanguage}"], :not([data-lang-section])`);
            
            let targetElement = null;

            activeSections.forEach(section => {
                 if (targetElement) return; // Exit if found
                 
                 // Look within the section (or the whole body if no lang section)
                 const searchRoot = section.hasAttribute('data-lang-section') ? section : modalBody;
                 
                 const allElements = searchRoot.querySelectorAll('h3, h4, p, li, b, code, span, .note, .tip, .modal-disclaimer');
                 
                 // Find the element containing the exact search text. We use .includes for robustness.
                 targetElement = Array.from(allElements).find(el => el.textContent.trim().includes(text.trim()));
            });

            if (targetElement) {
                // Ensure the modal body scrolls to the target element
                // FIX: Scroll the containing modal body
                modalBody.scrollTo({ top: targetElement.offsetTop - 50, behavior: 'smooth' });
                
                // Add the highlight class
                targetElement.classList.add('content-highlight');

                // Remove the highlight after a delay for the pulsing effect
                setTimeout(() => {
                    targetElement.classList.remove('content-highlight');
                }, 2500);
            }
        };
        
        // Attach click handlers to the home screen app buttons
        document.querySelectorAll('button.app-wrapper[data-modal]').forEach(wrapper => {
            const modalId = wrapper.dataset.modal;
            if (modalId) {
                wrapper.addEventListener('click', () => openModalAndHighlight(modalId));
            }
        });

        // --- MODAL CLOSING AND RESET LOGIC ---
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const closeModal = () => {
                hideModal(modal);

                // --- MODIFICATION START: Simplified reset for Useful Info modal ---
                if (modal.id === 'useful-information-modal') {
                    // Content is now in a pop-up, so we only need to reset the search state
                    document.getElementById('useful-info-search-input').value = '';
                    document.getElementById('useful-info-results-container').classList.add('hidden');
                    document.getElementById('useful-information-nav').querySelectorAll('.app-icon').forEach(article => {
                        article.style.display = 'flex'; // Ensure nav buttons are visible again
                    });
                }
                // --- MODIFICATION END ---
                
                // Remove highlight from any closed modal content
                modal.querySelectorAll('.content-highlight').forEach(el => {
                    el.classList.remove('content-highlight');
                });
            };
            
            modal.addEventListener('click', e => {
                // MODIFICATION: Prevent closing the language modal by clicking the overlay
                if (e.target === modal && modal.id !== 'language-selection-modal') {
                    closeModal();
                }
            });
            const closeModalButton = modal.querySelector('.close-modal');
            if (closeModalButton) {
                // MODIFICATION: Only attach handler if it's NOT the language modal's close button (which is hidden anyway)
                if (modal.id !== 'language-selection-modal') { 
                    closeModalButton.addEventListener('click', closeModal);
                }
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
                // Skip the language and disclaimer modals as they are transient
                if (['language-selection-modal', 'disclaimer-modal'].includes(modal.id)) return;
                
                const modalId = modal.id.replace('-modal', '');
                const modalTitle = modal.querySelector('.modal-header h2') ? modal.querySelector('.modal-header h2').textContent.trim() : modalId;
                
                modal.querySelectorAll('.modal-body').forEach(body => {
                    // Determine language section
                    const lang = body.dataset.langSection || 'en'; // Default to en if no section defined

                    // Select all relevant text containers within the body
                    body.querySelectorAll('h3, h4, p, li, code, .tip, .note, .modal-disclaimer').forEach(el => {
                        // Skip elements with no actual text content
                        if (el.textContent.trim().length < 5) return;
                        
                        const text = el.textContent.trim().replace(/\s\s+/g, ' ');
                        const isTitle = ['H3', 'H4'].includes(el.tagName);
                        
                        searchIndex.push({
                            lang: lang,
                            title: modalTitle,
                            text: text,
                            modalId: modalId,
                            weight: isTitle ? 5 : 1
                        });
                    });
                });
            });
        }
        
        // --- MAIN SEARCH FUNCTIONALITY (NOW SITE-WIDE) ---
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
                
                // Search the full, site-wide index
                let results = searchIndex.filter(item => {
                    return item.lang === currentLanguage && item.text.toLowerCase().includes(query);
                });

                // Sort results by weight (to prioritize titles)
                results.sort((a, b) => b.weight - a.weight);
                
                if (results.length > 0) {
                    // Show top 7 results
                    results.slice(0, 7).forEach(result => {
                        const itemEl = document.createElement('div');
                        itemEl.classList.add('search-result-item');
                        
                        // Create a snippet and highlight the query
                        const snippet = result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '');
                        // FIX: Use $& to represent the full match, not $1 which implies a capturing group
                        const highlightedSnippet = snippet.replace(new RegExp(query, 'gi'), '<strong>$&</strong>'); 
                        
                        // Display the title (modal name) and the snippet
                        itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                        
                        itemEl.addEventListener('click', (e) => {
                            // Prevent default action (which is important for links, even if not here)
                            e.preventDefault(); 
                            searchInput.value = '';
                            resultsContainer.classList.add('hidden');
                            
                            // 1. Open the modal and 2. pass the full text for highlighting
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
                // Keep the small timeout to allow click events to register before hiding.
                setTimeout(() => {
                    resultsContainer.classList.add('hidden');
                }, 150);
            });

            document.addEventListener('click', (e) => {
                if (searchContainer && !searchContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                }
            });
        }
        
        // --- USEFUL INFO SEARCH FUNCTIONALITY (Internal to Modal) ---
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
                
                // Hide the main nav elements when search results appear
                document.getElementById('useful-information-nav').querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'none';
                });

                let results = usefulInfoSearchIndex.filter(item => 
                    item.lang === currentLanguage && item.text.toLowerCase().includes(query)
                );
                
                // Sorted results (no deduplication)
                const sortedResults = results.sort((a, b) => b.weight - a.weight);

                if (sortedResults.length > 0) {
                    sortedResults.slice(0, 7).forEach(result => {
                        const itemEl = document.createElement('div');
                        itemEl.classList.add('search-result-item');
                        const snippet = result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '');
                        // FIX: Use $& to represent the full match, not $1 which implies a capturing group
                        const highlightedSnippet = snippet.replace(new RegExp(query, 'gi'), '<strong>$&</strong>'); 
                        itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                        
                        // --- MODIFICATION START: Update click handler ---
                        itemEl.addEventListener('click', async () => {
                            searchInput.value = '';
                            resultsContainer.classList.add('hidden');
                            // Pass title from the result object to create the pop-up modal
                            await loadInformationContent(result.url, result.title, result.text); 
                        });
                        // --- MODIFICATION END ---
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
        // MODIFICATION: Ensure close button is hidden on initial load for language enforcement
        if (languageModalCloseBtn) {
            languageModalCloseBtn.style.display = 'none';
        }
        
        // Show language selection first
        showModal(languageModal);
        // Set default language, which will be overwritten by user click
        changeLanguage('en'); 
        
        // Removed unnecessary manual text overwrite for language modal header
        
        buildSiteWideSearchIndex(); // Index all modals
        initializeSearch();
        initializeUsefulInfoSearch();
    }

    // --- USEFUL INFORMATION LOGIC (GITHUB API - FIXED) ---
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
            // This promise array will hold all the fetch operations for individual files.
            const indexPromises = htmlFiles.map(async (file) => {
                try {
                    const tipContentResponse = await fetch(file.download_url);
                    if (!tipContentResponse.ok) return; // Skip failed fetches
                    const htmlContent = await tipContentResponse.text();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    
                    // MODIFICATION: Clean name for indexing: remove .html, then remove leading numbers/underscores, then replace internal underscores with spaces.
                    const infoName = file.name
                        .replace(/\.html$/, '') 
                        .replace(/^\d+_/, '') // Remove leading numbers and underscore (e.g., '1_')
                        .replace(/_/g, ' '); 

                    // FIX: Ensure we check both lang sections and root elements for content
                    tempDiv.querySelectorAll('[data-lang-section]').forEach(section => {
                        const lang = section.dataset.langSection;
                        section.querySelectorAll('h3, h4, p, li, b, code').forEach(el => {
                            const text = el.textContent.trim();
                            if (text.length > 5) {
                                usefulInfoSearchIndex.push({
                                    lang: lang,
                                    title: infoName,
                                    text: text,
                                    url: file.download_url,
                                    weight: (el.tagName === 'H3' ? 5 : 1)
                                });
                            }
                        });
                    });
                } catch (e) {
                    console.error(`Failed to index information: ${file.name}`, e);
                }
            });
            
            // CRITICAL FIX: Wait for all the file fetches and indexing to complete.
            await Promise.all(indexPromises);

            // Now that indexing is complete, populate the navigation.
            navContainer.innerHTML = '';
            htmlFiles.forEach(file => {
                const button = document.createElement('button'); // Use button for accessibility
                button.className = 'app-icon';
                const icon = document.createElement('i');
                icon.className = 'fas fa-book-open';
                const span = document.createElement('span');
                
                // MODIFICATION: Clean name for display and store it for the click handler.
                const articleTitle = file.name
                    .replace(/\.html$/, '') 
                    .replace(/^\d+_/, '') 
                    .replace(/_/g, ' ');
                span.textContent = articleTitle;
                
                button.appendChild(icon);
                button.appendChild(span);
                
                // --- MODIFICATION START: Update click handler ---
                // Clicking will now fetch the content and display it in a new pop-up modal.
                button.addEventListener('click', async () => await loadInformationContent(file.download_url, articleTitle));
                // --- MODIFICATION END ---
                
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

    // --- MODIFICATION START: New function to create and show article pop-up modals ---
    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        // Remove any other article pop-ups to prevent stacking
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
        
        // Make it visible with a slight delay to allow CSS transitions to work
        setTimeout(() => modalOverlay.classList.add('visible'), 10);
    
        // Apply language visibility to the new modal's content
        changeLanguage(currentLanguage);
    
        // Highlight logic if a search result was clicked
        if (textToHighlight) {
            setTimeout(() => { // Delay to ensure rendering
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
        
        // Function to close and remove the modal from the DOM
        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            // Wait for the fade-out transition to finish before removing the element
            modalOverlay.addEventListener('transitionend', () => modalOverlay.remove(), { once: true });
        };
    
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    
        modalHeader.querySelector('.close-modal').addEventListener('click', closeModal);
    }

    // --- MODIFICATION START: `loadInformationContent` now triggers the pop-up modal ---
    async function loadInformationContent(url, title, textToHighlight = null) {
        // This function now fetches content and passes it to the pop-up modal creator.
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content: ${response.status}`);
            const htmlContent = await response.text();
            
            // Call the new function to display the pop-up
            createAndShowArticleModal(title, htmlContent, textToHighlight);

        } catch (error) {
            console.error('Failed to load content:', error);
            alert(currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης περιεχομένου.' : 'Failed to load content.');
        }
    }
    // --- MODIFICATION END ---
    
    // --- INITIALIZE ALL FEATURES ---
    initializePortfolio();
});