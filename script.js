document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentLanguage = 'en';
    let usefulInfoSearchIndex = [];
    let usefulInfoFiles = [];
    let isUsefulInfoIndexBuilt = false;
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

    // --- CERTIFICATE TRANSLATIONS ---
    const certificateTranslations = {
        en: {
            title: 'Certificate of Participation',
            subtitle: 'DedSec Project - 1 Year Anniversary',
            certifies: 'This certifies that',
            participated: 'participated in the 1 Year Anniversary version of the DedSec Project website.',
            event: 'Event held October 20 - October 31, 2025.',
            issuedTo: 'Issued To',
            age: 'Age',
            location: 'Location',
            dateIssued: 'Date Issued',
            team: 'DedSec Project Team'
        },
        gr: {
            title: 'Πιστοποιητικό Συμμετοχής',
            subtitle: 'DedSec Project - 1η Επέτειος',
            certifies: 'Το παρόν πιστοποιεί ότι',
            participated: 'συμμετείχε στην έκδοση της 1ης επετείου της ιστοσελίδας του DedSec Project.',
            event: 'Η εκδήλωση πραγματοποιήθηκε από 20 Οκτωβρίου έως 31 Οκτωβρίου 2025.',
            issuedTo: 'Εκδόθηκε σε',
            age: 'Ηλικία',
            location: 'Τοποθεσία',
            dateIssued: 'Ημερομηνία Έκδοσης',
            team: 'Ομάδα DedSec Project'
        }
    };

    // --- INITIALIZE ALL FUNCTIONALITY ---
    initializeBurgerMenu();
    initializeLanguageSwitcher();
    initializeThemeSwitcher();
    initializeWebSearchSuggestions();
    initializeCopyButtons();
    initializeCertificateFeature();
    initializeUsefulInfoSearch();
    initializeCarousels();

    // Show language modal on load (like original)
    showLanguageModal();

    // --- BURGER MENU FUNCTIONALITY ---
    function initializeBurgerMenu() {
        const burgerIcon = document.getElementById('burger-icon');
        const navMenu = document.getElementById('nav-menu');

        if (burgerIcon && navMenu) {
            burgerIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                burgerIcon.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !burgerIcon.contains(e.target)) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });

            // Close menu when clicking a link
            navMenu.querySelectorAll('.nav-item').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                });
            });
        }
    }

    // --- LANGUAGE FUNCTIONALITY ---
    function showLanguageModal() {
        const langModal = document.getElementById('language-selection-modal');
        if (langModal) {
            langModal.classList.add('visible');
        }
    }

    function initializeLanguageSwitcher() {
        const langModal = document.getElementById('language-selection-modal');
        const langButtons = document.querySelectorAll('.language-button');
        const langSwitcherBtn = document.getElementById('lang-switcher-btn');

        // Main language change function
        window.changeLanguage = (lang) => {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            
            // Update all elements with data attributes
            document.querySelectorAll('[data-en]').forEach(el => {
                const hasDirectText = Array.from(el.childNodes).some(node => 
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                );
                
                if (hasDirectText) {
                    const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                    Array.from(el.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                            node.textContent = text;
                        }
                    });
                } else if (el.children.length === 0) {
                    const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
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
            
            // Update buttons and placeholders
            document.querySelectorAll('.language-button').forEach(button => {
                button.classList.toggle('selected', button.dataset.lang === lang);
            });

            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
            }

            const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
            if (usefulInfoSearchInput) {
                usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            }

            updateThemeButtonText();
        };

        // Modal functionality
        if (langModal) {
            const closeModal = () => {
                langModal.classList.remove('visible');
                localStorage.setItem('preferredLanguage', currentLanguage);
            };
            
            langModal.addEventListener('click', e => {
                if (e.target === langModal) closeModal();
            });
            
            langModal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        }

        // Language buttons
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeLanguage(button.dataset.lang);
                if (langModal) langModal.classList.remove('visible');
            });
        });

        // Language switcher in burger menu
        if (langSwitcherBtn) {
            langSwitcherBtn.addEventListener('click', () => {
                showLanguageModal();
                const navMenu = document.getElementById('nav-menu');
                const burgerIcon = document.getElementById('burger-icon');
                if (navMenu && burgerIcon) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });
        }

        // Check for saved preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && langModal) {
            changeLanguage(savedLanguage);
            langModal.classList.remove('visible');
        }
    }

    // --- THEME FUNCTIONALITY ---
    function initializeThemeSwitcher() {
        const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
        
        const updateThemeButtonText = () => {
            if (themeSwitcherBtn) {
                const themeIcon = themeSwitcherBtn.querySelector('i');
                const themeSpan = themeSwitcherBtn.querySelector('span');
                const isLight = document.body.classList.contains('light-theme');
                
                if (isLight) {
                    themeIcon.className = 'fas fa-sun';
                    themeSpan.setAttribute('data-en', 'Light Theme');
                    themeSpan.setAttribute('data-gr', 'Φωτεινό Θέμα');
                } else {
                    themeIcon.className = 'fas fa-moon';
                    themeSpan.setAttribute('data-en', 'Dark Theme');
                    themeSpan.setAttribute('data-gr', 'Σκούρο Θέμα');
                }
                
                const text = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
                themeSpan.textContent = text;
            }
        };

        if (themeSwitcherBtn) {
            themeSwitcherBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButtonText();
                
                const navMenu = document.getElementById('nav-menu');
                const burgerIcon = document.getElementById('burger-icon');
                if (navMenu && burgerIcon) {
                    navMenu.classList.remove('active');
                    burgerIcon.classList.remove('active');
                }
            });
            
            // Set initial theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
            }
            updateThemeButtonText();
        }
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
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        };

        const fetchSuggestions = (query) => {
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.id = 'jsonp-script';
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                console.error("Error loading Google suggestions");
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

    // --- COPY TO CLIPBOARD FUNCTIONALITY ---
    function initializeCopyButtons() {
        window.copyToClipboard = (button, targetId) => {
            const codeElement = document.getElementById(targetId);
            if (!codeElement || !navigator.clipboard) {
                console.warn('Clipboard not available');
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
                console.error('Failed to copy:', err);
                button.textContent = 'Failed!';
                setTimeout(() => { button.textContent = originalText; }, 1500);
            });
        };

        // Attach copy buttons dynamically
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                const codeContainer = e.target.closest('.code-container');
                if (codeContainer) {
                    const codeElement = codeContainer.querySelector('code');
                    if (codeElement) {
                        copyToClipboard(e.target, codeElement.id);
                    }
                }
            }
        });
    }

    // --- CERTIFICATE FUNCTIONALITY ---
    function initializeCertificateFeature() {
        const certificateBtn = document.querySelector('.certificate-btn');
        const generateCertificateBtn = document.getElementById('generate-certificate');
        const certificateForm = document.getElementById('certificate-form');
        const certificateModal = document.getElementById('certificate-modal');

        if (certificateBtn) {
            certificateBtn.addEventListener('click', () => {
                certificateModal?.classList.add('visible');
            });
        }

        if (generateCertificateBtn && certificateForm) {
            // Set initial button color to purple
            generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateCertificateBtn.style.borderColor = 'var(--nm-accent)';
            generateCertificateBtn.style.color = '#000000';

            // Add mouse listeners to control purple hover state
            generateCertificateBtn.addEventListener('mouseenter', () => {
                if (!generateCertificateBtn.querySelector('.fa-check')) {
                    generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent-hover), var(--nm-accent))';
                }
            });
            generateCertificateBtn.addEventListener('mouseleave', () => {
                if (!generateCertificateBtn.querySelector('.fa-check')) {
                    generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
                }
            });

            generateCertificateBtn.addEventListener('click', generateCertificate);
        }

        if (certificateModal) {
            const closeModal = () => {
                certificateModal.classList.remove('visible');
                certificateForm?.reset();
                const preview = document.getElementById('certificate-preview');
                if (preview) {
                    preview.classList.add('hidden');
                }
            };
            
            certificateModal.addEventListener('click', e => {
                if (e.target === certificateModal) closeModal();
            });
            
            certificateModal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        }
    }

    function generateCertificate() {
        const form = document.getElementById('certificate-form');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            console.error("CRITICAL: jsPDF library (window.jspdf.jsPDF) not found.");
            alert('Error: Certificate generator failed to load. Please check your internet connection, disable ad-blockers, and try again.');
            return;
        }

        if (typeof html2canvas === 'undefined') {
            console.error("CRITICAL: html2canvas library not found.");
            alert('Error: Certificate generator failed to load. Please check your internet connection, disable ad-blockers, and try again.');
            return;
        }

        const formData = new FormData(form);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const age = formData.get('age');
        const country = formData.get('country');
        const city = formData.get('city');

        generateCertificateWithCanvas(firstName, lastName, age, country, city);
    }

    function generateCertificateWithCanvas(firstName, lastName, age, country, city) {
        try {
            const tempCertificate = createCertificateHTML(firstName, lastName, age, country, city);
            document.body.appendChild(tempCertificate);

            html2canvas(tempCertificate, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                document.body.removeChild(tempCertificate);
                const imgData = canvas.toDataURL('image/png');
                
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('landscape', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                
                const fileName = currentLanguage === 'gr' 
                    ? `Πιστοποιητικό_Επετείου_DedSec_${firstName}_${lastName}.pdf`
                    : `DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`;
                
                doc.save(fileName);
                showCertificateSuccess(firstName);
            }).catch(error => {
                console.error("Error generating certificate with html2canvas:", error);
                document.body.removeChild(tempCertificate);
                alert("An error occurred while generating the certificate. Please try again.");
            });

        } catch (error) {
            console.error("Error in certificate generation:", error);
            alert("An error occurred while generating the certificate. Please try again.");
        }
    }

    function createCertificateHTML(firstName, lastName, age, country, city) {
        const translations = certificateTranslations[currentLanguage];
        const fullName = `${firstName} ${lastName}`;
        const today = new Date().toLocaleDateString(currentLanguage === 'gr' ? 'el-GR' : 'en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const certificateDiv = document.createElement('div');
        certificateDiv.style.cssText = `
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: 1123px;
            height: 794px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 4px solid #FFD700;
            border-radius: 15px;
            padding: 40px 30px;
            color: #ffffff;
            font-family: 'Noto Serif', serif;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            box-sizing: border-box;
        `;

        certificateDiv.innerHTML = `
            <div style="margin-bottom: 30px;">
                <div style="font-size: 3rem; color: #FFD700; margin-bottom: 15px;">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h1 style="font-size: 2.2rem; color: #FFD700; margin: 0 0 10px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-family: 'Noto Serif', serif;">
                    ${translations.title}
                </h1>
                <h2 style="font-size: 1.5rem; color: #9966FF; margin: 0; font-weight: normal; font-style: italic; font-family: 'Noto Serif', serif;">
                    ${translations.subtitle}
                </h2>
            </div>
            
            <div style="margin: 30px 0;">
                <p style="font-size: 1.1rem; margin: 15px 0; line-height: 1.6; font-family: 'Noto Serif', serif;">
                    ${translations.certifies}
                </p>
                <div style="font-size: 2.5rem; font-weight: bold; color: #FFD700; margin: 20px 0; padding: 10px; border-bottom: 2px solid #FFD700; border-top: 2px solid #FFD700; font-family: 'Noto Serif', serif; text-transform: uppercase; letter-spacing: 1px;">
                    ${fullName}
                </div>
                <p style="font-size: 1.1rem; margin: 15px 0; line-height: 1.6; font-family: 'Noto Serif', serif;">
                    ${translations.participated}
                </p>
                <p style="font-size: 1.1rem; margin: 15px 0; line-height: 1.6; font-family: 'Noto Serif', serif;">
                    ${translations.event}
                </p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #3A4A5E;">
                <div style="text-align: left;">
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${translations.issuedTo}:</span> ${fullName}
                    </div>
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${translations.age}:</span> ${age}
                    </div>
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${translations.location}:</span> ${city}, ${country}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${translations.dateIssued}:</span> ${today}
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <div style="width: 200px; height: 1px; background: #ffffff; margin: 0 auto 10px auto;"></div>
                        <span style="font-style: italic; color: #7A8899; font-family: 'Noto Serif', serif;">
                            ${translations.team}
                        </span>
                    </div>
                </div>
            </div>
        `;

        return certificateDiv;
    }

    function showCertificateSuccess(firstName) {
        const generateBtn = document.getElementById('generate-certificate');
        const originalHTML = generateBtn.innerHTML;
        
        generateBtn.innerHTML = `
            <i class="fas fa-check"></i>
            <span data-en="Certificate Downloaded!" data-gr="Το Πιστοποιητικό Λήφθηκε!">Certificate Downloaded!</span>
        `;
        
        generateBtn.style.background = '#FFFFFF';
        generateBtn.style.borderColor = 'var(--nm-accent)';
        generateBtn.style.color = 'var(--nm-accent)';
        
        changeLanguage(currentLanguage);
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateBtn.style.borderColor = 'var(--nm-accent)';
            generateBtn.style.color = '#000000';
            changeLanguage(currentLanguage);
        }, 3000);
    }

    // --- USEFUL INFORMATION SEARCH FUNCTIONALITY ---
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

            this.idfMaps[indexName] = new Map();
            docFreq.forEach((freq, token) => {
                this.idfMaps[indexName].set(token, Math.log(totalDocs / freq));
            });
        },

        calculateTf(tokens) {
            const tf = new Map();
            tokens.forEach(token => {
                tf.set(token, (tf.get(token) || 0) + 1);
            });
            tokens.forEach(token => {
                tf.set(token, tf.get(token) / tokens.length);
            });
            return tf;
        },

        search(query, index, indexName, lang) {
            if (!query || !index || index.length === 0) return [];

            const queryTokens = this.tokenize(query, lang);
            if (queryTokens.length === 0) return [];

            if (!this.idfMaps[indexName]) {
                this.calculateIdf(indexName, index);
            }

            const idfMap = this.idfMaps[indexName];
            const queryTf = this.calculateTf(queryTokens);
            const queryVector = new Map();
            let queryNorm = 0;

            queryTokens.forEach(token => {
                const tf = queryTf.get(token) || 0;
                const idf = idfMap.get(token) || 0;
                const tfidf = tf * idf;
                queryVector.set(token, tfidf);
                queryNorm += tfidf * tfidf;
            });
            queryNorm = Math.sqrt(queryNorm);

            const scores = index.map(item => {
                const docTfTitle = this.calculateTf(item.titleTokens);
                const docTfText = this.calculateTf(item.textTokens);
                const docVector = new Map();
                let docNorm = 0;

                const allTokens = new Set([...queryTokens, ...item.titleTokens, ...item.textTokens]);
                allTokens.forEach(token => {
                    const tfTitle = docTfTitle.get(token) || 0;
                    const tfText = docTfText.get(token) || 0;
                    const tf = tfTitle * 1.5 + tfText;
                    const idf = idfMap.get(token) || 0;
                    const tfidf = tf * idf;
                    docVector.set(token, tfidf);
                    docNorm += tfidf * tfidf;
                });
                docNorm = Math.sqrt(docNorm);

                let dotProduct = 0;
                queryTokens.forEach(token => {
                    dotProduct += (queryVector.get(token) || 0) * (docVector.get(token) || 0);
                });

                const similarity = queryNorm > 0 && docNorm > 0 ? dotProduct / (queryNorm * docNorm) : 0;
                return { item, score: similarity };
            });

            return scores
                .filter(result => result.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(result => result.item);
        }
    };

    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const searchBtn = document.getElementById('useful-info-search-btn');
        const resultsContainer = document.getElementById('useful-info-results');
        const loadingIndicator = document.getElementById('useful-info-loading');

        if (!searchInput || !searchBtn || !resultsContainer) return;

        const performSearch = () => {
            const query = searchInput.value.trim();
            
            if (query.length === 0) {
                resultsContainer.innerHTML = '';
                resultsContainer.classList.add('hidden');
                return;
            }

            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            resultsContainer.classList.add('hidden');

            if (!isUsefulInfoIndexBuilt || !usefulInformationLoaded) {
                loadUsefulInformation().then(() => {
                    executeSearch(query);
                }).catch(error => {
                    console.error('Error loading useful information:', error);
                    if (loadingIndicator) loadingIndicator.classList.add('hidden');
                });
            } else {
                executeSearch(query);
            }
        };

        const executeSearch = (query) => {
            const searchResults = SearchEngine.search(query, usefulInfoSearchIndex, 'usefulInfo', currentLanguage);
            displaySearchResults(searchResults, query);
            
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
        };

        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        };

        searchInput.addEventListener('input', debounce(() => {
            if (searchInput.value.trim().length > 2) {
                performSearch();
            } else if (searchInput.value.trim().length === 0) {
                resultsContainer.innerHTML = '';
                resultsContainer.classList.add('hidden');
            }
        }, 300));
    }

    async function loadUsefulInformation() {
        if (isFetchingUsefulInfo) return;
        if (usefulInformationLoaded) return;

        isFetchingUsefulInfo = true;
        const loadingIndicator = document.getElementById('useful-info-loading');
        
        try {
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');

            const response = await fetch('/api/useful-info');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            usefulInfoFiles = data.files || [];
            usefulInfoSearchIndex = [];

            usefulInfoFiles.forEach(file => {
                const processedItem = SearchEngine.preprocessItem(file);
                usefulInfoSearchIndex.push(processedItem);
            });

            isUsefulInfoIndexBuilt = true;
            usefulInformationLoaded = true;
            
        } catch (error) {
            console.error('Error fetching useful information:', error);
            usefulInfoFiles = [];
            usefulInfoSearchIndex = [];
        } finally {
            isFetchingUsefulInfo = false;
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
        }
    }

    function displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('useful-info-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p data-en="No articles found matching your search." data-gr="Δεν βρέθηκαν άρθρα που να ταιριάζουν με την αναζήτησή σας.">
                        No articles found matching your search.
                    </p>
                </div>
            `;
            changeLanguage(currentLanguage);
            return;
        }

        resultsContainer.innerHTML = results.map(item => `
            <div class="search-result-item">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text.substring(0, 150))}...</p>
                <div class="result-meta">
                    <span class="result-category">${escapeHtml(item.category)}</span>
                    <span class="result-date">${escapeHtml(item.date)}</span>
                </div>
            </div>
        `).join('');

        changeLanguage(currentLanguage);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- CAROUSEL FUNCTIONALITY ---
    function initializeCarousels() {
        const carousels = document.querySelectorAll('.carousel');
        
        carousels.forEach(carousel => {
            const track = carousel.querySelector('.carousel-track');
            const items = Array.from(track.children);
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const dotsContainer = carousel.querySelector('.carousel-dots');
            
            if (!track || items.length === 0) return;
            
            let currentIndex = 0;
            const itemWidth = items[0].getBoundingClientRect().width;
            
            // Set initial positions
            items.forEach((item, index) => {
                item.style.left = `${itemWidth * index}px`;
            });
            
            // Create dots
            if (dotsContainer) {
                items.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.classList.add('carousel-dot');
                    if (index === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => moveToIndex(index));
                    dotsContainer.appendChild(dot);
                });
            }
            
            const moveToIndex = (index) => {
                currentIndex = index;
                track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                
                // Update dots
                if (dotsContainer) {
                    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                        dot.classList.toggle('active', i === currentIndex);
                    });
                }
            };
            
            const moveNext = () => {
                currentIndex = (currentIndex + 1) % items.length;
                moveToIndex(currentIndex);
            };
            
            const movePrev = () => {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                moveToIndex(currentIndex);
            };
            
            if (nextBtn) nextBtn.addEventListener('click', moveNext);
            if (prevBtn) prevBtn.addEventListener('click', movePrev);
            
            // Auto-advance carousel every 5 seconds
            let autoAdvance = setInterval(moveNext, 5000);
            
            // Pause auto-advance on hover
            carousel.addEventListener('mouseenter', () => clearInterval(autoAdvance));
            carousel.addEventListener('mouseleave', () => {
                autoAdvance = setInterval(moveNext, 5000);
            });
            
            // Touch/swipe support
            let startX = 0;
            let currentX = 0;
            
            track.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
            });
            
            track.addEventListener('touchmove', e => {
                currentX = e.touches[0].clientX;
            });
            
            track.addEventListener('touchend', () => {
                const diff = startX - currentX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        moveNext();
                    } else {
                        movePrev();
                    }
                }
            });
        });
    }
});