// script.js - Index page specific functionality
// FIXED: Removed initializePortfolio wrapper and conflicting definitions
document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PORTFOLIO STATE ---
    let currentLanguage = 'en'; // Local variable, state is managed by common.js
    let usefulInfoSearchIndex = []; // Dedicated index for the modal, BUILT ON DEMAND
    let usefulInfoFiles = []; // Stores the list of files to avoid re-fetching
    let isUsefulInfoIndexBuilt = false; // Flag to check if the full index is ready
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

    // --- ANNIVERSARY CERTIFICATE FUNCTIONALITY ---
    function initializeCertificateFeature() {
        const certificateBtn = document.querySelector('.certificate-btn');
        const generateCertificateBtn = document.getElementById('generate-certificate');
        const certificateForm = document.getElementById('certificate-form');
        const certificateModal = document.getElementById('certificate-modal');
        
        if (certificateBtn) {
            certificateBtn.addEventListener('click', () => {
                // Use global openModalAndHighlight
                openModalAndHighlight('certificate');
            });
        }

        if (generateCertificateBtn && certificateForm) {
            // --- FIX: Set initial button color to purple to override CSS ---
            generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateCertificateBtn.style.borderColor = 'var(--nm-accent)';
            generateCertificateBtn.style.color = '#000000'; // Ensure text color is black like the green button

            // --- FIX: Add mouse listeners to control purple hover state ---
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
            // --- END FIX ---

            generateCertificateBtn.addEventListener('click', generateCertificate);
        }

        // Add close functionality to certificate modal
        if (certificateModal) {
            const closeModal = () => {
                hideModal(certificateModal); // Use global hideModal
                if(certificateForm) certificateForm.reset();
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
                
                const currentLang = localStorage.getItem('language') || 'en';
                const fileName = currentLang === 'gr' 
                    ? `Πιστοποιητικό_Επετείου_DedSec_${firstName}_${lastName}.pdf`
                    : `DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`;
                
                doc.save(fileName);
                showCertificateSuccess(firstName);
            }).catch(error => {
                console.error("Error generating certificate with html2canvas:", error);
                if (document.body.contains(tempCertificate)) {
                    document.body.removeChild(tempCertificate);
                }
                alert("An error occurred while generating the certificate. Please try again.");
            });

        } catch (error) {
            console.error("Error in certificate generation:", error);
            alert("An error occurred while generating the certificate. Please try again.");
        }
    }

    function createCertificateHTML(firstName, lastName, age, country, city) {
        const currentLang = localStorage.getItem('language') || 'en';
        const translations = certificateTranslations[currentLang];
        const fullName = `${firstName} ${lastName}`;
        const today = new Date().toLocaleDateString(currentLang === 'gr' ? 'el-GR' : 'en-US', { 
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
        
        if (window.changeLanguage) {
            window.changeLanguage(localStorage.getItem('language') || 'en');
        }
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateBtn.style.borderColor = 'var(--nm-accent)';
            generateBtn.style.color = '#000000';
            if (window.changeLanguage) {
                window.changeLanguage(localStorage.getItem('language') || 'en');
            }
        }, 3000);
    }

    // --- START: USEFUL INFORMATION FUNCTIONS ---
    // (These are not used on index.html, but are kept for consistency from old script)
    const SearchEngine = {
        idfMaps: {},
        tokenize(text, lang) {
            if (!text) return [];
            return text.toLowerCase().replace(/[.,/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(word => word.length > 1);
        },
        preprocessItem(item) {
            return { ...item, titleTokens: this.tokenize(item.title, item.lang), textTokens: this.tokenize(item.text, item.lang) };
        },
        calculateIdf(indexName, index) {
            const docFreq = new Map(); const totalDocs = index.length; if (totalDocs === 0) return;
            index.forEach(item => {
                const seenTokens = new Set([...item.titleTokens, ...item.textTokens]);
                seenTokens.forEach(token => { docFreq.set(token, (docFreq.get(token) || 0) + 1); });
            });
            const idfMap = new Map();
            for (const [token, freq] of docFreq.entries()) { idfMap.set(token, Math.log(totalDocs / (1 + freq))); }
            this.idfMaps[indexName] = idfMap;
        },
        _getNgrams(word, n = 2) {
            const ngrams = new Set(); if (!word || word.length < n) return ngrams;
            for (let i = 0; i <= word.length - n; i++) { ngrams.add(word.substring(i, i + n)); }
            return ngrams;
        },
        _calculateSimilarity(word1, word2) {
            if (!word1 || !word2) return 0;
            const ngrams1 = this._getNgrams(word1); const ngrams2 = this._getNgrams(word2);
            const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
            const union = ngrams1.size + ngrams2.size - intersection.size;
            return union === 0 ? 0 : intersection.size / union;
        },
        search(query, index, lang, indexName) {
            const queryTokens = this.tokenize(query, lang); if (queryTokens.length === 0) return [];
            const idfMap = this.idfMaps[indexName] || new Map();
            const currentLang = localStorage.getItem('language') || 'en';
            const scoredResults = index.filter(item => item.lang === currentLang).map(item => {
                let score = 0; const foundTokens = new Set();
                queryTokens.forEach(qToken => {
                    const idf = idfMap.get(qToken) || 0.5; let tokenFound = false;
                    let exactTitleMatches = item.titleTokens.filter(t => t === qToken).length;
                    if (exactTitleMatches > 0) { score += exactTitleMatches * 10 * idf; tokenFound = true; }
                    let exactTextMatches = item.textTokens.filter(t => t === qToken).length;
                    if (exactTextMatches > 0) { score += exactTextMatches * 2 * idf; tokenFound = true; }
                    if(tokenFound) foundTokens.add(qToken);
                    if (!tokenFound) {
                        let bestSimilarity = 0; const allItemTokens = [...item.titleTokens, ...item.textTokens];
                        allItemTokens.forEach(tToken => {
                            const similarity = this._calculateSimilarity(qToken, tToken);
                            if (similarity > bestSimilarity) bestSimilarity = similarity;
                        });
                        if (bestSimilarity > 0.7) { score += bestSimilarity * 5 * idf; foundTokens.add(qToken); }
                    }
                });
                if (foundTokens.size === queryTokens.length && queryTokens.length > 1) score *= 1.5;
                if (item.text.toLowerCase().includes(query.toLowerCase().trim())) score *= 1.2;
                score *= item.weight || 1;
                return { ...item, score };
            });
            return scoredResults.filter(item => item.score > 0).sort((a, b) => b.score - a.score);
        },
        generateSnippet(text, query, lang) {
            const queryTokens = this.tokenize(query, lang); if (queryTokens.length === 0) return text.substring(0, 120) + (text.length > 120 ? '...' : '');
            let bestIndex = -1; const lowerCaseText = text.toLowerCase();
            for (const token of queryTokens) { const index = lowerCaseText.indexOf(token); if (index !== -1) { bestIndex = index; break; } }
            if (bestIndex === -1) { return text.substring(0, 120) + (text.length > 120 ? '...' : ''); }
            const snippetLength = 120; const start = Math.max(0, bestIndex - Math.round(snippetLength / 4));
            const end = Math.min(text.length, start + snippetLength);
            let snippet = text.substring(start, end);
            if (start > 0) snippet = '... ' + snippet; if (end < text.length) snippet = snippet + ' ...';
            return snippet;
        },
        highlight(snippet, query, lang) {
            const queryTokens = this.tokenize(query, lang); if (queryTokens.length === 0) return snippet;
            const regex = new RegExp(`(${queryTokens.join('|')})`, 'gi');
            return snippet.replace(regex, '<strong>$1</strong>');
        }
    };
    // ... (rest of search/useful info functions, not needed for index.html)
    // --- END: USEFUL INFORMATION FUNCTIONS ---


    // --- MODAL AND PAGE INITIALIZATION (FROM old script.js) ---
    
    // This function is needed for this page's modals
    window.openModalAndHighlight = (modalId, highlightText = null) => {
        const disclaimerModal = document.getElementById('disclaimer-modal');
        const installationModal = document.getElementById('installation-modal');

         if (modalId === 'installation' && !localStorage.getItem('disclaimerAccepted') && disclaimerModal) {
             showModal(disclaimerModal); // USES GLOBAL
             return; 
         }

        const modal = document.getElementById(`${modalId}-modal`);
        if (modal) {
             const languageModalCloseBtn = document.querySelector('#language-selection-modal .close-modal');
            if (modalId === 'language-selection' && languageModalCloseBtn) {
                 languageModalCloseBtn.style.display = '';
            }
            showModal(modal); // USES GLOBAL
            
            if (modalId === 'useful-information' && !usefulInformationLoaded) {
                // fetchUsefulInformation(); // This function doesn't exist here
            }
            
            if (highlightText) {
                setTimeout(() => highlightModalContent(modal, highlightText), 100);
            }
        } else {
            console.warn(`Modal with ID "${modalId}-modal" not found.`);
        }
    };

    // This is a helper for the above
    const highlightModalContent = (modal, text) => {
        const modalBody = modal.querySelector('.modal-body');
        if (!modalBody) return;
        
         const treeWalker = document.createTreeWalker(modalBody, NodeFilter.SHOW_TEXT);
         let targetNode = null;
         while (treeWalker.nextNode()) {
             if (treeWalker.currentNode.textContent.includes(text)) {
                 targetNode = treeWalker.currentNode.parentElement; 
                 break;
             }
         }

        if (!targetNode) {
            const allElements = modalBody.querySelectorAll('h3, h4, p, li, b, code, span, .note, .tip, .modal-disclaimer');
             targetNode = Array.from(allElements).find(el => el.textContent.trim().replace(/\s\s+/g, ' ') === text.trim());
        }

        if (targetNode) {
             targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetNode.classList.add('content-highlight');
            setTimeout(() => {
                 targetNode.classList.remove('content-highlight');
             }, 2500);
        } else {
            console.warn(`Highlight text "${text}" not found in modal.`);
        }
    };
    
    // Attach modal openers
    document.querySelectorAll('button.app-wrapper[data-modal]').forEach(wrapper => {
        wrapper.addEventListener('click', () => openModalAndHighlight(wrapper.dataset.modal));
    });

    // Setup modal close behavior
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        // Skip language modal, it's handled by common.js
        if (modal.id === 'language-selection-modal') return; 

        const closeModalBtn = modal.querySelector('.close-modal');

        const closeModal = () => {
            hideModal(modal); // USES GLOBAL
            
            if (modal.id === 'useful-information-modal') {
                const searchInput = document.getElementById('useful-info-search-input');
                if (searchInput) searchInput.value = '';
                const resultsContainer = document.getElementById('useful-info-results-container');
                if (resultsContainer) resultsContainer.classList.add('hidden');
                
                const navContainer = document.getElementById('useful-information-nav');
                if (navContainer) {
                    navContainer.querySelectorAll('.app-icon').forEach(article => {
                        article.style.display = 'flex';
                    });
                }
            }
             modal.querySelectorAll('.content-highlight').forEach(el => el.classList.remove('content-highlight'));
        };
        
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                 closeModal();
            }
        });
        
        if (closeModalBtn) {
             closeModalBtn.addEventListener('click', closeModal);
        }
    });

    // Initialize Gym Carousel if present
    const carousel = document.querySelector('.gym-carousel');
    if (carousel) {
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
    }
    
    // --- Web Search Suggestions ---
    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        if (!searchInput || !suggestionsContainer || !searchForm) return;

         const debounce = (func, delay) => {
             let timeoutId;
             return (...args) => {
                 clearTimeout(timeoutId);
                 timeoutId = setTimeout(() => {
                     func.apply(this, args);
                 }, delay);
             };
         };

        const fetchSuggestions = (query) => {
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) {
                oldScript.remove();
            }

            const script = document.createElement('script');
            script.id = 'jsonp-script';
            const currentLang = localStorage.getItem('language') || 'en';
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLang}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                console.error("Error loading Google suggestions. Network issue or ad-blocker likely.");
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

    // --- Initialize the page-specific features ---
    initializeCertificateFeature();
    initializeWebSearchSuggestions();
    
});