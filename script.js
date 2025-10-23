document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentLanguage = 'en';
    let usefulInfoSearchIndex = [];
    let usefulInfoFiles = [];
    let isUsefulInfoIndexBuilt = false;
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

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
            generateCertificateBtn.addEventListener('click', generateCertificate);
        }

        if (certificateModal) {
            const closeModal = () => {
                certificateModal.classList.remove('visible');
                certificateForm?.reset();
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

        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('Error: Certificate generator libraries not loaded. Please check your internet connection.');
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
                    ? `Πιστοποιητικό_${firstName}_${lastName}.pdf`
                    : `Certificate_${firstName}_${lastName}.pdf`;
                
                doc.save(fileName);
                showCertificateSuccess(firstName);
            }).catch(error => {
                console.error("Error generating certificate:", error);
                document.body.removeChild(tempCertificate);
                alert("An error occurred while generating the certificate.");
            });

        } catch (error) {
            console.error("Error in certificate generation:", error);
            alert("An error occurred while generating the certificate.");
        }
    }

    function createCertificateHTML(firstName, lastName, age, country, city) {
        const translations = {
            en: {
                title: 'Certificate of Participation',
                subtitle: 'DedSec Project',
                certifies: 'This certifies that',
                participated: 'has successfully participated in the DedSec Project cybersecurity program.',
                issuedTo: 'Issued To',
                age: 'Age',
                location: 'Location',
                dateIssued: 'Date Issued',
                team: 'DedSec Project Team'
            },
            gr: {
                title: 'Πιστοποιητικό Συμμετοχής',
                subtitle: 'DedSec Project',
                certifies: 'Το παρόν πιστοποιεί ότι',
                participated: 'συμμετείχε επιτυχώς στο πρόγραμμα κυβερνοασφάλειας DedSec Project.',
                issuedTo: 'Εκδόθηκε σε',
                age: 'Ηλικία',
                location: 'Τοποθεσία',
                dateIssued: 'Ημερομηνία Έκδοσης',
                team: 'Ομάδα DedSec Project'
            }
        };

        const trans = translations[currentLanguage];
        const fullName = `${firstName} ${lastName}`;
        const today = new Date().toLocaleDateString(currentLanguage === 'gr' ? 'el-GR' : 'en-US');

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
                    ${trans.title}
                </h1>
                <h2 style="font-size: 1.5rem; color: #9966FF; margin: 0; font-weight: normal; font-style: italic; font-family: 'Noto Serif', serif;">
                    ${trans.subtitle}
                </h2>
            </div>
            
            <div style="margin: 30px 0;">
                <p style="font-size: 1.1rem; margin: 15px 0; line-height: 1.6; font-family: 'Noto Serif', serif;">
                    ${trans.certifies}
                </p>
                <div style="font-size: 2.5rem; font-weight: bold; color: #FFD700; margin: 20px 0; padding: 10px; border-bottom: 2px solid #FFD700; border-top: 2px solid #FFD700; font-family: 'Noto Serif', serif; text-transform: uppercase; letter-spacing: 1px;">
                    ${fullName}
                </div>
                <p style="font-size: 1.1rem; margin: 15px 0; line-height: 1.6; font-family: 'Noto Serif', serif;">
                    ${trans.participated}
                </p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #3A4A5E;">
                <div style="text-align: left;">
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${trans.issuedTo}:</span> ${fullName}
                    </div>
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${trans.age}:</span> ${age}
                    </div>
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${trans.location}:</span> ${city}, ${country}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="margin: 8px 0; font-size: 0.9rem;">
                        <span style="font-weight: bold; color: #FFD700;">${trans.dateIssued}:</span> ${today}
                    </div>
                    <div style="text-align: center; margin-top: 10px;">
                        <div style="width: 200px; height: 1px; background: #ffffff; margin: 0 auto 10px auto;"></div>
                        <span style="font-style: italic; color: #7A8899; font-family: 'Noto Serif', serif;">
                            ${trans.team}
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
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-success), #00CC00)';
            generateBtn.style.borderColor = 'var(--nm-success)';
            generateBtn.style.color = '#000000';
            changeLanguage(currentLanguage);
        }, 3000);
    }

    // --- USEFUL INFORMATION SEARCH FUNCTIONALITY ---
    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        
        if (!searchInput || !resultsContainer || !navContainer) return;

        const SearchEngine = {
            tokenize(text, lang) {
                if (!text) return [];
                return text
                    .toLowerCase()
                    .replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, "")
                    .split(/\s+/)
                    .filter(word => word.length > 1);
            },

            search(query, index, lang) {
                const queryTokens = this.tokenize(query, lang);
                if (queryTokens.length === 0) return [];

                const scoredResults = index
                    .filter(item => item.lang === lang)
                    .map(item => {
                        let score = 0;
                        queryTokens.forEach(qToken => {
                            const exactTitleMatches = item.titleTokens.filter(t => t === qToken).length;
                            if (exactTitleMatches > 0) score += exactTitleMatches * 10;
                            
                            const exactTextMatches = item.textTokens.filter(t => t === qToken).length;
                            if (exactTextMatches > 0) score += exactTextMatches * 2;
                        });

                        if (item.text.toLowerCase().includes(query.toLowerCase().trim())) score *= 1.2;
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

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = '';

            if (!isUsefulInfoIndexBuilt || query.length < 2) {
                resultsContainer.classList.add('hidden');
                return;
            }

            const results = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage);

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
            }
        });

        // Load useful information when modal opens
        const usefulInfoModal = document.getElementById('useful-information-modal');
        if (usefulInfoModal) {
            usefulInfoModal.addEventListener('click', (e) => {
                if (e.target === usefulInfoModal || e.target.classList.contains('close-modal')) {
                    searchInput.value = '';
                    resultsContainer.classList.add('hidden');
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

        // Attach copy buttons to dynamic content
        setTimeout(() => {
            const codeContainers = modalOverlay.querySelectorAll('.code-container');
            codeContainers.forEach(container => {
                const copyBtn = container.querySelector('.copy-btn');
                const codeEl = container.querySelector('code');
                if (copyBtn && codeEl && !codeEl.id) {
                    const uniqueId = `dynamic-code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    codeEl.id = uniqueId;
                    copyBtn.addEventListener('click', () => copyToClipboard(copyBtn, uniqueId));
                }
            });
        }, 100);

        setTimeout(() => modalOverlay.classList.add('visible'), 10);
        changeLanguage(currentLanguage);

        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            modalOverlay.addEventListener('transitionend', () => modalOverlay.remove(), { once: true });
        };

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        modalOverlay.querySelector('.close-modal').addEventListener('click', closeModal);
    }

    // --- CAROUSEL FUNCTIONALITY ---
    function initializeCarousels() {
        const carousels = document.querySelectorAll('.gym-carousel');
        carousels.forEach(carousel => {
            const images = carousel.querySelectorAll('.gym-clothing-images img');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            
            if (images.length > 0 && prevBtn && nextBtn) {
                let currentIndex = 0;
                
                const showImage = (index) => {
                    images.forEach((img, i) => img.classList.toggle('active', i === index));
                };
                
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
        });
    }

    // --- MODAL MANAGEMENT ---
    function initializeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const closeModalBtn = modal.querySelector('.close-modal');
            const closeModal = () => modal.classList.remove('visible');
            
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal();
            });
            
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', closeModal);
            }
        });
    }

    // Initialize modals
    initializeModals();

    // --- SCROLL INDICATOR ---
    function initializeScrollIndicator() {
        const scrollThumb = document.getElementById('scroll-indicator-thumb');
        const homeScreen = document.querySelector('.home-screen');
        
        if (scrollThumb && homeScreen) {
            homeScreen.addEventListener('scroll', () => {
                const scrollTop = homeScreen.scrollTop;
                const scrollHeight = homeScreen.scrollHeight - homeScreen.clientHeight;
                const scrollPercentage = (scrollTop / scrollHeight) * 100;
                
                scrollThumb.style.opacity = scrollPercentage > 0 ? '1' : '0';
                scrollThumb.style.top = `${scrollPercentage}%`;
            });
        }
    }

    initializeScrollIndicator();

    console.log('DedSec Project - All functionalities initialized successfully');
});