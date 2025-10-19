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
                .replace(/[.,/#!$%\\^&\\*;:{}=\\-_`~()]/g, "")
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

            this.idfMaps[indexName] = new Map();
            docFreq.forEach((freq, token) => {
                this.idfMaps[indexName].set(token, Math.log(totalDocs / (freq + 1)));
            });
        },

        getTfIdf(tokens, indexName) {
            if (!this.idfMaps[indexName]) return 0;
            const tf = new Map();
            tokens.forEach(token => {
                tf.set(token, (tf.get(token) || 0) + 1);
            });

            let score = 0;
            tf.forEach((count, token) => {
                const idf = this.idfMaps[indexName].get(token) || 0;
                score += (count / tokens.length) * idf;
            });
            return score;
        },

        search(query, indexName, index) {
            const queryTokens = this.tokenize(query, 'en'); // Assume search query is generally language-agnostic
            if (queryTokens.length === 0 || index.length === 0) return [];

            const results = index.map(item => {
                const titleScore = this.getTfIdf(queryTokens.filter(q => item.titleTokens.includes(q)), indexName) * 3; // Boost title score
                const bodyScore = this.getTfIdf(queryTokens.filter(q => item.textTokens.includes(q)), indexName) * 1;
                const totalScore = titleScore + bodyScore;

                // Simple check for exact match in title or body for a minimum score
                const matchesTitle = queryTokens.some(q => item.titleTokens.includes(q));
                const matchesBody = queryTokens.some(q => item.textTokens.includes(q));
                
                if (totalScore > 0 || matchesTitle || matchesBody) {
                    return { item, score: totalScore, matches: queryTokens.filter(q => item.titleTokens.includes(q) || item.textTokens.includes(q)) };
                }
                return null;
            }).filter(Boolean);

            results.sort((a, b) => b.score - a.score);

            // Filter out low-scoring results and return only top 10
            return results
                .filter(res => res.score > 0 || res.matches.length > 0)
                .slice(0, 10);
        }
    };

    // --- INITIALIZATION ---
    function initializePortfolio() {
        loadLanguageSettings();
        setupLanguageToggle();
        setupAppInteractions();
        setupModals();
        setupUsefulInfoModal();
        setupGymCarousel();
        setupMainSearch();
        setupCertificateGeneration(); // Added call for setup
        
        // Hide the pre-filled certificate template container initially
        const certificateModal = document.getElementById('certificate-modal');
        if (certificateModal) {
            certificateModal.classList.add('hidden');
        }

        // Set up scroll indicator
        const homeScreen = document.querySelector('.home-screen');
        const scrollIndicator = document.getElementById('scroll-indicator-thumb');
        if (homeScreen && scrollIndicator) {
            const updateScrollIndicator = () => {
                const scrollableHeight = homeScreen.scrollHeight - homeScreen.clientHeight;
                if (scrollableHeight > 0) {
                    const scrollFraction = homeScreen.scrollTop / scrollableHeight;
                    const indicatorHeight = scrollIndicator.clientHeight;
                    const maxTop = homeScreen.clientHeight - indicatorHeight;
                    const newTop = scrollFraction * maxTop;
                    scrollIndicator.style.top = `${newTop}px`;
                    scrollIndicator.style.opacity = '1'; 
                } else {
                    scrollIndicator.style.opacity = '0';
                }
            };

            homeScreen.addEventListener('scroll', updateScrollIndicator);
            updateScrollIndicator(); 
            window.addEventListener('resize', updateScrollIndicator);
        }
    }

    // --- LANGUAGE UTILITY ---
    function loadLanguageSettings() {
        const savedLang = localStorage.getItem('dedsec-lang') || 'en';
        setLanguage(savedLang);
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('dedsec-lang', lang);

        document.querySelectorAll('[data-en]').forEach(el => {
            const enText = el.getAttribute('data-en');
            const grText = el.getAttribute('data-gr');
            el.textContent = lang === 'gr' ? (grText || enText) : enText;
        });

        document.querySelectorAll('[data-en-placeholder]').forEach(el => {
            const enPlaceholder = el.getAttribute('data-en-placeholder');
            const grPlaceholder = el.getAttribute('data-gr-placeholder');
            el.placeholder = lang === 'gr' ? (grPlaceholder || enPlaceholder) : enPlaceholder;
        });

        document.querySelectorAll('.language-button').forEach(button => {
            button.classList.remove('selected');
        });
        document.querySelector(`.language-button[data-lang="${lang}"]`).classList.add('selected');
    }

    function setupLanguageToggle() {
        document.querySelectorAll('.language-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                if (lang) {
                    setLanguage(lang);
                }
            });
        });
    }

    // --- MODAL UTILITY ---
    function showModal(modalElement) {
        modalElement.classList.remove('hidden');
        modalElement.classList.add('visible');
        document.body.style.overflow = 'hidden'; 
    }

    function hideModal(modalElement) {
        modalElement.classList.remove('visible');
        modalElement.addEventListener('transitionend', () => {
            modalElement.classList.add('hidden');
            document.body.style.overflow = ''; 
        }, { once: true });
    }

    function setupModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('close-modal')) {
                    hideModal(modal);
                }
            });
            modal.querySelector('.close-modal').addEventListener('click', () => hideModal(modal));
        });
    }

    // --- APP INTERACTION ---
    function setupAppInteractions() {
        document.querySelectorAll('.app-wrapper').forEach(wrapper => {
            wrapper.addEventListener('click', (e) => {
                e.preventDefault();
                const appName = wrapper.getAttribute('data-app');
                const appUrl = wrapper.getAttribute('data-url');
                
                if (appName) {
                    openApp(appName, appUrl);
                }
            });
        });
    }

    function openApp(appName, appUrl) {
        const modalId = `${appName}-modal`;
        const modal = document.getElementById(modalId);
        
        if (modal) {
            showModal(modal);
        } else if (appUrl) {
            window.open(appUrl, '_blank');
        } else {
            console.warn(`App not configured: ${appName}`);
        }
    }

    // --- MAIN SEARCH (Local/Modal Trigger) ---
    function setupMainSearch() {
        const searchInput = document.getElementById('main-search-input');
        const resultsContainer = document.getElementById('search-results-container');
        const homeScreen = document.querySelector('.home-screen');
        const allWrappers = document.querySelectorAll('.app-wrapper');
        const sections = document.querySelectorAll('[data-search-tag]');

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            resultsContainer.innerHTML = '';

            if (query.length < 2) {
                resultsContainer.classList.add('hidden');
                sections.forEach(sec => sec.classList.remove('hidden'));
                allWrappers.forEach(app => app.classList.remove('hidden'));
                homeScreen.querySelectorAll('.content-highlight').forEach(el => {
                    el.classList.remove('content-highlight');
                });
                return;
            }

            const results = [];
            const appSearch = [
                { name: 'DedSec Terminal', tag: 'terminal', icon: 'fa-terminal', app: 'terminal', type: 'App' },
                { name: 'DedSec Database', tag: 'database', icon: 'fa-server', app: 'database', type: 'App' },
                { name: 'Fox Chat', tag: 'chat communication', icon: 'fa-comment', app: 'chat', type: 'App' },
                { name: 'Radio Music Player', tag: 'radio music player', icon: 'fa-radio', app: 'radio', type: 'App' },
                { name: 'OSINTDS', tag: 'osint intelligence', icon: 'fa-globe', app: 'osintds', type: 'App' },
                { name: 'AdGen', tag: 'adgen ad generator', icon: 'fa-pen-nib', app: 'adgen', type: 'App' },
                { name: 'Termux Customization', tag: 'termux customization', icon: 'fa-brush', app: 'termux-customization', type: 'App' },
                { name: 'Python Gym Clothing', tag: 'python gym clothing', icon: 'fa-shirt', app: 'python-gym', type: 'App' },
                { name: 'URL Masker', tag: 'url masker link shortener', icon: 'fa-link', app: 'url-masker', type: 'App' },
                { name: 'XSS Validator', tag: 'xss cross site scripting validator', icon: 'fa-code', app: 'xss-validator', type: 'App' },
                { name: 'Android App Launcher', tag: 'android app launcher', icon: 'fa-mobile-alt', app: 'app-launcher', type: 'App' },
                { name: 'SQLi Tester', tag: 'sqli sql injection tester', icon: 'fa-database', app: 'sqli-tester', type: 'App' },
            ];

            // 1. Search Apps (Higher Priority)
            appSearch.forEach(app => {
                const combinedText = `${app.name} ${app.tag}`.toLowerCase();
                if (combinedText.includes(query)) {
                    results.push({ 
                        name: app.name, 
                        type: app.type, 
                        app: app.app,
                        description: `Open the ${app.name} App`
                    });
                }
            });

            // 2. Search Useful Information Index (Lower Priority - only show top result/prompt)
            if (isUsefulInfoIndexBuilt) {
                const infoResults = SearchEngine.search(query, 'useful-info-index', usefulInfoSearchIndex);
                if (infoResults.length > 0) {
                    const topResult = infoResults[0];
                    results.push({
                        name: topResult.item.title,
                        type: 'Article',
                        app: 'useful-information',
                        description: `Search "${query}" in Useful Information`
                    });
                } else if (query.length >= 2) {
                     results.push({
                        name: `Search: "${query}"`,
                        type: 'Article',
                        app: 'useful-information',
                        description: `No direct article found. Click to search inside the Useful Information modal.`
                    });
                }
            }


            if (results.length > 0) {
                resultsContainer.classList.remove('hidden');
                
                results.forEach(result => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `<strong>${result.name}</strong><small>${result.description}</small>`;
                    
                    item.addEventListener('click', () => {
                        searchInput.value = '';
                        resultsContainer.classList.add('hidden');
                        
                        // Handle result click
                        if (result.app === 'useful-information') {
                            const infoModal = document.getElementById('useful-information-modal');
                            if (infoModal) {
                                showModal(infoModal);
                                // The useful info modal handles its own search logic
                                const infoSearchInput = document.getElementById('useful-info-search-input');
                                infoSearchInput.value = query;
                                infoSearchInput.dispatchEvent(new Event('input'));
                            }
                        } else {
                            openApp(result.app);
                        }
                    });
                    resultsContainer.appendChild(item);
                });
            } else {
                resultsContainer.classList.add('hidden');
            }
            
            // Highlight/filter apps on main screen (only when search is active)
            const queryWords = query.split(/\s+/).filter(w => w.length > 1);

            allWrappers.forEach(app => {
                const appName = app.getAttribute('data-app');
                const appData = appSearch.find(a => a.app === appName);
                if (appData) {
                    const combinedText = `${appData.name} ${appData.tag}`.toLowerCase();
                    const isMatch = queryWords.every(word => combinedText.includes(word));
                    app.classList.toggle('hidden', !isMatch);
                }
            });

            // Highlight/filter sections
            sections.forEach(sec => {
                const tag = sec.getAttribute('data-search-tag');
                const isSectionVisible = Array.from(sec.querySelectorAll('.app-wrapper')).some(app => !app.classList.contains('hidden'));
                sec.classList.toggle('hidden', !isSectionVisible);
            });
        });

        // Hide results when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!resultsContainer.contains(e.target) && e.target !== searchInput) {
                resultsContainer.classList.add('hidden');
            }
        });
    }

    // --- USEFUL INFORMATION MODAL ---
    function setupUsefulInfoModal() {
        const infoModal = document.getElementById('useful-information-modal');
        const navContainer = document.getElementById('useful-information-nav');
        const contentContainer = document.getElementById('useful-information-content');
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const promptElement = document.getElementById('useful-info-prompt');
        const progressBarContainer = document.querySelector('.progress-bar-container');
        const progressBar = document.querySelector('.progress-bar');
        const progressBarText = document.querySelector('.progress-bar-text');

        infoModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('app-icon') && e.target.closest('#useful-information-nav')) {
                const file = usefulInfoFiles.find(f => f.filename === e.target.getAttribute('data-file'));
                if (file) {
                    loadInformationContent(file.url, file.title, searchInput.value);
                }
            }
        });

        infoModal.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && infoModal.classList.contains('visible') && !usefulInformationLoaded && !isFetchingUsefulInfo) {
                loadUsefulInformationIndex();
            }
            
            if (!infoModal.classList.contains('visible')) {
                // Reset state when modal closes
                contentContainer.innerHTML = '';
                promptElement.classList.remove('hidden');
                navContainer.classList.remove('hidden');
                searchInput.value = '';
                resultsContainer.innerHTML = '';
                resultsContainer.classList.add('hidden');
                navContainer.querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'flex';
                });
            }
        });
        
        async function loadUsefulInformationIndex() {
            isFetchingUsefulInfo = true;
            progressBarContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressBarText.textContent = currentLanguage === 'gr' ? 'Φόρτωση Άρθρων...' : 'Loading Articles...';
            
            try {
                const response = await fetch('Useful%20Information/index.json');
                if (!response.ok) throw new Error(`Failed to load index: ${response.status}`);
                const files = await response.json();
                usefulInfoFiles = files; // Store the file list
                
                progressBar.style.width = '30%';
                progressBarText.textContent = currentLanguage === 'gr' ? 'Δημιουργία Ευρετηρίου...' : 'Building Search Index...';
                
                // 1. Display Navigation Links
                navContainer.innerHTML = '';
                files.forEach(file => {
                    const article = document.createElement('div');
                    article.className = 'app-icon';
                    article.setAttribute('data-file', file.filename);
                    article.innerHTML = `
                        <i class="fas fa-file-alt"></i>
                        <span>${file.title}<span class="sub-item">${file.description}</span></span>
                    `;
                    navContainer.appendChild(article);
                });
                
                // 2. Build Search Index
                usefulInfoSearchIndex = files.map(file => SearchEngine.preprocessItem({
                    title: file.title,
                    text: file.description, // Use description as searchable text for pre-index
                    url: file.url,
                    filename: file.filename,
                    lang: 'en'
                }));
                SearchEngine.calculateIdf('useful-info-index', usefulInfoSearchIndex);
                isUsefulInfoIndexBuilt = true;
                usefulInformationLoaded = true;
                
                progressBar.style.width = '100%';
                progressBarText.textContent = currentLanguage === 'gr' ? 'Έτοιμο!' : 'Ready!';

                // Hide progress bar and trigger any pending search
                setTimeout(() => {
                    progressBarContainer.style.display = 'none';
                    if (searchInput.value.trim()) {
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }, 500);

            } catch (error) {
                console.error('Error loading useful information index:', error);
                navContainer.innerHTML = currentLanguage === 'gr' ? '<p>Αποτυχία φόρτωσης πληροφοριών.</p>' : '<p>Failed to load information.</p>';
                progressBarContainer.style.display = 'none';
            } finally {
                isFetchingUsefulInfo = false;
            }
        }
        
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            contentContainer.innerHTML = ''; 
            promptElement.classList.remove('hidden');
            
            if (query.length < 2) {
                resultsContainer.classList.add('hidden');
                navContainer.classList.remove('hidden');
                navContainer.querySelectorAll('.app-icon').forEach(article => {
                    article.style.display = 'flex';
                });
                return;
            }
            
            if (!isUsefulInfoIndexBuilt) return; // Wait for index to build

            const searchResults = SearchEngine.search(query, 'useful-info-index', usefulInfoSearchIndex);
            
            navContainer.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
            resultsContainer.innerHTML = '';
            
            if (searchResults.length > 0) {
                searchResults.forEach(res => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `<strong>${res.item.title}</strong><small>${res.item.text}</small>`;
                    
                    item.addEventListener('click', () => {
                        loadInformationContent(res.item.url, res.item.title, query);
                        resultsContainer.classList.add('hidden');
                        searchInput.value = ''; // Clear search after selection
                    });
                    resultsContainer.appendChild(item);
                });
            } else {
                resultsContainer.innerHTML = currentLanguage === 'gr' ? '<p style="padding: 15px;">Δεν βρέθηκαν αποτελέσματα.</p>' : '<p style="padding: 15px;">No results found.</p>';
            }
        });

        // Hide results when clicking elsewhere inside the modal
        infoModal.addEventListener('click', (e) => {
            if (!resultsContainer.contains(e.target) && e.target !== searchInput) {
                resultsContainer.classList.add('hidden');
                if (searchInput.value.trim() === '') {
                    navContainer.classList.remove('hidden');
                }
            }
        });

    }

    function createAndShowArticleModal(title, htmlContent, textToHighlight) {
        const infoModal = document.getElementById('useful-information-modal');
        const navContainer = document.getElementById('useful-information-nav');
        const contentContainer = document.getElementById('useful-information-content');
        const promptElement = document.getElementById('useful-info-prompt');

        promptElement.classList.add('hidden');
        navContainer.classList.add('hidden');
        contentContainer.innerHTML = `<h3>${title}</h3>${htmlContent}`;

        // Highlight logic
        if (textToHighlight) {
            const highlightText = textToHighlight.toLowerCase().trim();
            const elementsToHighlight = contentContainer.querySelectorAll('p, li, span, h4, h5, h6');
            
            elementsToHighlight.forEach(el => {
                let innerHTML = el.innerHTML;
                const regex = new RegExp(`(${highlightText})`, 'gi');
                
                if (innerHTML.toLowerCase().includes(highlightText)) {
                    // Temporarily replace < and > to protect HTML tags
                    innerHTML = innerHTML.replace(/<(?=[^>]*>)/g, '&#60;').replace(/(?<=<[^>]*?)>/g, '&#62;');
                    
                    // Apply highlight wrapper (using a unique marker to avoid recursive highlighting)
                    innerHTML = innerHTML.replace(regex, (match) => 
                        `<span class="content-highlight-temp">${match}</span>`
                    );
                    
                    // Restore < and >
                    innerHTML = innerHTML.replace(/&#60;/g, '<').replace(/&#62;/g, '>');
                    
                    el.innerHTML = innerHTML;

                    // Rename the temp marker to the final class
                    el.querySelectorAll('.content-highlight-temp').forEach(span => {
                        span.classList.add('content-highlight');
                        span.classList.remove('content-highlight-temp');
                    });
                    
                    // Scroll to first highlight
                    const firstHighlight = contentContainer.querySelector('.content-highlight');
                    if (firstHighlight) {
                        firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Fade out highlight after a delay
                        setTimeout(() => {
                            contentContainer.querySelectorAll('.content-highlight').forEach(highlight => {
                                highlight.classList.remove('content-highlight');
                            });
                        }, 2500);
                    }
                }
            });
        }
    }

    async function loadInformationContent(url, title, textToHighlight = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            const htmlContent = await response.text();
            createAndShowArticleModal(title, htmlContent, textToHighlight);
        } catch (error) {
            console.error('Failed to load content:', error);
            const contentContainer = document.getElementById('useful-information-content');
            contentContainer.innerHTML = `<h3>${title}</h3><p style="color: var(--nm-danger);">Failed to load article content.</p>`;
        }
    }


    // --- PYTHON GYM CAROUSEL ---
    function setupGymCarousel() {
        const carousel = document.querySelector('.gym-clothing-images');
        if (!carousel) return;
        
        const images = Array.from(carousel.querySelectorAll('img'));
        if (images.length === 0) return;

        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        function nextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }

        function prevImage() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        }

        // Initialize carousel
        showImage(0);

        // Setup buttons
        document.querySelector('.carousel-btn.next').addEventListener('click', nextImage);
        document.querySelector('.carousel-btn.prev').addEventListener('click', prevImage);
    }
    
    // --- CERTIFICATE GENERATION ---
    function setupCertificateGeneration() {
        document.getElementById('generate-certificate').addEventListener('click', generateCertificate);
        
        // Setup close button on the form modal
        const certificateModal = document.getElementById('certificate-modal');
        if (certificateModal) {
            certificateModal.querySelector('.close-modal').addEventListener('click', () => {
                document.getElementById('certificate-form').reset();
                hideModal(certificateModal);
            });
        }
        
        // Setup anniversary button to show the form modal
        document.getElementById('show-certificate-form').addEventListener('click', () => {
            const formModal = document.getElementById('certificate-form-modal');
            if (formModal) {
                showModal(formModal);
            }
        });
        
        // Setup button to start generation
        document.getElementById('start-certificate-generation').addEventListener('click', () => {
            const formModal = document.getElementById('certificate-form-modal');
            hideModal(formModal);
            // The generateCertificate function is called directly by the inner button's listener
            // which is handled by document.getElementById('generate-certificate').addEventListener('click', generateCertificate);
            // This button's listener should just trigger the final step, but for the current setup:
            // The start-certificate-generation button is redundant if generate-certificate is the final action.
            // Assuming 'start-certificate-generation' just triggers the final form check and generation:
            generateCertificate();
        });
    }

    // Certificate Generation Function - FIXED VERSION with Delay
    function generateCertificate() {
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const age = document.getElementById('age').value;
        const country = document.getElementById('country').value.trim();
        const city = document.getElementById('city').value.trim();

        // Validate form
        if (!firstName || !lastName || !age || !country || !city) {
            alert(currentLanguage === 'gr' ? 'Παρακαλώ συμπληρώστε όλα τα πεδία.' : 'Please fill in all fields.');
            return;
        }

        // 1. Update certificate template with user data
        const fullName = `${firstName} ${lastName}`;
        const location = `${city}, ${country}`;
        const issueDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        document.getElementById('certificate-name').textContent = fullName;
        document.getElementById('certificate-age').textContent = age;
        document.getElementById('certificate-location').textContent = location;
        document.getElementById('certificate-issue-date').textContent = issueDate;

        // 2. Prepare the element for capture (Off-screen but visible)
        const { jsPDF } = window.jspdf;
        const certificateElement = document.getElementById('certificate-content');
        
        // Save original display properties
        const originalDisplay = certificateElement.style.display;

        // Force visibility and move off-screen for capture compatibility
        certificateElement.style.display = 'block';
        certificateElement.style.visibility = 'visible'; // Important: ensures it's fully ready
        certificateElement.style.position = 'fixed';
        certificateElement.style.left = '-9999px';
        certificateElement.style.top = '0';
        certificateElement.style.width = '800px';
        certificateElement.style.height = '600px';

        // 3. Add a small delay to ensure the browser fully renders the changes
        setTimeout(() => {
            html2canvas(certificateElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#0B121C',
                width: 800,
                height: 600
            }).then(canvas => {
                // 4. Restore original display immediately after capture
                certificateElement.style.display = originalDisplay;
                certificateElement.style.visibility = 'hidden'; 
                certificateElement.style.position = 'fixed';
                certificateElement.style.left = '0';
                certificateElement.style.top = '0';
                certificateElement.style.width = '800px';
                certificateElement.style.height = '600px';

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('landscape', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate dimensions to fit the PDF
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = (pdfHeight - imgHeight * ratio) / 2;
                
                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save(`DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`);
                
                // Reset form and close modal
                document.getElementById('certificate-form').reset();
                
                // Hide both form and main certificate modal just in case
                const formModal = document.getElementById('certificate-form-modal');
                if (formModal) hideModal(formModal); 
                const certModal = document.getElementById('certificate-modal');
                if (certModal) hideModal(certModal);

                
                // Show success message
                alert(currentLanguage === 'gr' 
                    ? 'Το πιστοποιητικό λήφθηκε επιτυχώς!' 
                    : 'Certificate downloaded successfully!');
            }).catch(error => {
                console.error('Error generating certificate:', error);
                // Restore original display in case of error
                certificateElement.style.display = originalDisplay;
                certificateElement.style.visibility = 'hidden';
                certificateElement.style.position = 'fixed';
                certificateElement.style.left = '0';
                certificateElement.style.top = '0';
                certificateElement.style.width = '800px';
                certificateElement.style.height = '600px';
                
                alert(currentLanguage === 'gr' 
                    ? 'Σφάλμα κατά τη δημιουργία του πιστοποιητικού.' 
                    : 'Error generating certificate.');
                
                // Ensure form modal is closed on failure
                const formModal = document.getElementById('certificate-form-modal');
                if (formModal) hideModal(formModal); 
            });
        }, **50**); // The crucial 50ms delay for browser repaint
    }

    // --- INITIALIZE ALL FEATURES ---
    initializePortfolio();
});