document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PORTFOLIO STATE ---
    let currentLanguage = 'en';
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
                openModalAndHighlight('certificate');
            });
        }

        if (generateCertificateBtn && certificateForm) {
            generateCertificateBtn.addEventListener('click', generateCertificate);
        }

        // Add close functionality to certificate modal
        if (certificateModal) {
            const closeModal = () => {
                certificateModal.classList.remove('visible');
                // Reset form
                certificateForm.reset();
                // Hide preview element if it exists (though we removed its display)
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
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Check if the jsPDF and html2canvas libraries are loaded before proceeding
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

        // Get form data
        const formData = new FormData(form);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const age = formData.get('age');
        const country = formData.get('country');
        const city = formData.get('city');

        // Generate PDF using html2canvas approach
        generateCertificateWithCanvas(firstName, lastName, age, country, city);
    }

    // --- NEW FUNCTION: Generate certificate using html2canvas for Greek support ---
    function generateCertificateWithCanvas(firstName, lastName, age, country, city) {
        try {
            // Create a temporary certificate element
            const tempCertificate = createCertificateHTML(firstName, lastName, age, country, city);
            document.body.appendChild(tempCertificate);

            // Use html2canvas to capture the certificate as an image
            html2canvas(tempCertificate, {
                scale: 2, // Higher quality
                useCORS: true,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                // Remove temporary element
                document.body.removeChild(tempCertificate);

                // Convert canvas to image data
                const imgData = canvas.toDataURL('image/png');
                
                // Create PDF
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('landscape', 'mm', 'a4');
                
                // Calculate dimensions to fit the image in A4 landscape
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Add image to PDF (fit to page)
                doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                
                // Save the PDF
                const fileName = currentLanguage === 'gr' 
                    ? `Πιστοποιητικό_Επετείου_DedSec_${firstName}_${lastName}.pdf`
                    : `DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`;
                
                doc.save(fileName);

                // Show success message
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

    // --- NEW FUNCTION: Create certificate HTML for canvas capture ---
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
            font-family: 'Noto Serif', serif; /* CHANGED: Use Noto Serif for Greek support */
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
        generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
        generateBtn.style.borderColor = 'var(--nm-accent)';
        
        changeLanguage(currentLanguage);
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateBtn.style.borderColor = 'var(--nm-accent)';
            changeLanguage(currentLanguage); // Re-apply language to original text
        }, 3000);
    }

    // --- EVEN MORE ADVANCED SEARCH UTILITY (Used for 'Useful Information' modal) ---
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

            const idfMap = new Map();
            for (const [token, freq] of docFreq.entries()) {
                idfMap.set(token, Math.log(totalDocs / (1 + freq)));
            }
            this.idfMaps[indexName] = idfMap;
        },

        _getNgrams(word, n = 2) {
            const ngrams = new Set();
            if (!word || word.length < n) return ngrams;
            for (let i = 0; i <= word.length - n; i++) {
                ngrams.add(word.substring(i, i + n));
            }
            return ngrams;
        },

        _calculateSimilarity(word1, word2) {
            if (!word1 || !word2) return 0;
            const ngrams1 = this._getNgrams(word1);
            const ngrams2 = this._getNgrams(word2);
            const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
            const union = ngrams1.size + ngrams2.size - intersection.size;
            return union === 0 ? 0 : intersection.size / union;
        },

        search(query, index, lang, indexName) {
            const queryTokens = this.tokenize(query, lang);
            if (queryTokens.length === 0) return [];
            const idfMap = this.idfMaps[indexName] || new Map();

            const scoredResults = index
                .filter(item => item.lang === lang)
                .map(item => {
                    let score = 0;
                    const foundTokens = new Set();

                    queryTokens.forEach(qToken => {
                        const idf = idfMap.get(qToken) || 0.5;
                        let tokenFound = false;

                        let exactTitleMatches = item.titleTokens.filter(t => t === qToken).length;
                        if (exactTitleMatches > 0) {
                            score += exactTitleMatches * 10 * idf;
                            tokenFound = true;
                        }
                        let exactTextMatches = item.textTokens.filter(t => t === qToken).length;
                        if (exactTextMatches > 0) {
                            score += exactTextMatches * 2 * idf;
                            tokenFound = true;
                        }
                        if(tokenFound) foundTokens.add(qToken);

                        if (!tokenFound) {
                            let bestSimilarity = 0;
                            const allItemTokens = [...item.titleTokens, ...item.textTokens];
                            allItemTokens.forEach(tToken => {
                                const similarity = this._calculateSimilarity(qToken, tToken);
                                if (similarity > bestSimilarity) bestSimilarity = similarity;
                            });
                            
                            if (bestSimilarity > 0.7) {
                               score += bestSimilarity * 5 * idf;
                               foundTokens.add(qToken);
                            }
                        }
                    });

                    if (foundTokens.size === queryTokens.length && queryTokens.length > 1) score *= 1.5;
                    if (item.text.toLowerCase().includes(query.toLowerCase().trim())) score *= 1.2;
                    score *= item.weight || 1;

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

    // --- PORTFOLIO INITIALIZATION ---
    function initializePortfolio() {
        function showModal(modal) {
            if (!modal) return;
            modal.classList.add('visible');
        }

        function hideModal(modal) {
            if (!modal) return;
            modal.classList.remove('visible');
        }

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
                // Check if the element itself has text content directly
                const hasDirectText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
                
                if (hasDirectText) {
                    const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                    // Find only the direct text nodes and update them
                    Array.from(el.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                            node.textContent = text;
                        }
                    });
                } else if (el.children.length === 0) { 
                    // Fallback for elements with no children but maybe text set via JS later
                     const text = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
                     el.textContent = text;
                }
                // If it has children with text, assume those children have their own data attributes
            });


            document.querySelectorAll('[data-lang-section]').forEach(el => {
                el.style.display = el.dataset.langSection === lang ? 'block' : 'none';
                // Use `hidden` class for better accessibility and consistency
                el.classList.toggle('hidden', el.dataset.langSection !== lang);
                 // Remove hidden-by-default after initial language set if it matches
                if (el.dataset.langSection === lang) {
                   el.classList.remove('hidden-by-default');
                }
            });
            
            document.querySelectorAll('.language-button').forEach(button => {
                button.classList.toggle('selected', button.dataset.lang === lang);
            });

            document.title = "DedSec Project - 1 Year Anniversary"; // Consider localizing title?

            const searchInput = document.getElementById('main-search-input');
            if (searchInput) {
                searchInput.placeholder = lang === 'gr' ? 'Αναζήτηση στο διαδίκτυο...' : 'Search the Web...';
            }
            
            const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
            if (usefulInfoSearchInput && !isUsefulInfoIndexBuilt) {
                 usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Πατήστε για φόρτωση αναζήτησης...' : 'Click to load search...';
            } else if (usefulInfoSearchInput) {
                usefulInfoSearchInput.placeholder = lang === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            }

            // Re-translate button texts that might have been changed by success messages
             const generateCertBtn = document.getElementById('generate-certificate');
             const certBtnSpan = generateCertBtn?.querySelector('span');
             if (certBtnSpan && !certBtnSpan.textContent.includes('Downloaded')) { // Avoid re-translating success msg
                 certBtnSpan.textContent = certBtnSpan.getAttribute(`data-${lang}`) || certBtnSpan.getAttribute('data-en');
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
                // Update text immediately based on current language
                 themeSpan.textContent = themeSpan.getAttribute(`data-${currentLanguage}`) || themeSpan.getAttribute('data-en');
            };

            themeSwitcherBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                updateThemeButton(isLight);
            });
            
            // Set initial theme based on localStorage
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                 document.body.classList.remove('light-theme'); // Ensure dark if not light
            }
            updateThemeButton(document.body.classList.contains('light-theme')); // Update button on load
        }

        document.getElementById('accept-disclaimer')?.addEventListener('click', () => {
            localStorage.setItem('disclaimerAccepted', 'true');
            hideModal(disclaimerModal);
            if (installationModal) {
                showModal(installationModal);
            }
        });
        document.getElementById('decline-disclaimer')?.addEventListener('click', () => {
             window.location.href = 'https://www.google.com';
        });
        
        window.openModalAndHighlight = (modalId, highlightText = null) => {
            // Check disclaimer FIRST if trying to access installation modal
             if (modalId === 'installation' && !localStorage.getItem('disclaimerAccepted') && disclaimerModal) {
                 showModal(disclaimerModal);
                 // Add an alert or visual cue that disclaimer must be accepted
                 // Optionally, store the intended modal to open after acceptance
                 return; 
             }

            const modal = document.getElementById(`${modalId}-modal`);
            if (modal) {
                 // Ensure language modal close button is visible if opened via switcher
                if (modalId === 'language-selection' && languageModalCloseBtn) {
                     languageModalCloseBtn.style.display = '';
                }
                showModal(modal);
                
                // Fetch useful info only when that modal is opened
                if (modalId === 'useful-information' && !usefulInformationLoaded) {
                    fetchUsefulInformation();
                }
                
                // Highlight content after modal is visible
                if (highlightText) {
                    setTimeout(() => highlightModalContent(modal, highlightText), 100); // Small delay for transition
                }
            } else {
                console.warn(`Modal with ID "${modalId}-modal" not found.`);
            }
        };


        const highlightModalContent = (modal, text) => {
            const modalBody = modal.querySelector('.modal-body');
            if (!modalBody) return;
            
            // More robust selector to find text potentially split across nodes
             const treeWalker = document.createTreeWalker(modalBody, NodeFilter.SHOW_TEXT);
             let targetNode = null;
             while (treeWalker.nextNode()) {
                 if (treeWalker.currentNode.textContent.includes(text)) {
                     targetNode = treeWalker.currentNode.parentElement; // Get parent element for scrolling/highlighting
                     break;
                 }
             }

            // Fallback to previous method if walker fails
            if (!targetNode) {
                const allElements = modalBody.querySelectorAll('h3, h4, p, li, b, code, span, .note, .tip, .modal-disclaimer');
                 targetNode = Array.from(allElements).find(el => el.textContent.trim().replace(/\s\s+/g, ' ') === text.trim());
            }


            if (targetNode) {
                 // Scroll element into view smoothly
                 targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Apply highlight class and remove after timeout
                targetNode.classList.add('content-highlight');
                setTimeout(() => {
                     targetNode.classList.remove('content-highlight');
                 }, 2500); // Duration of highlight
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
            const closeModalBtn = modal.querySelector('.close-modal');

            const closeModal = () => {
                hideModal(modal);
                
                // Reset search in useful info modal when closed
                if (modal.id === 'useful-information-modal') {
                    const searchInput = document.getElementById('useful-info-search-input');
                    const resultsContainer = document.getElementById('useful-info-results-container');
                    const navContainer = document.getElementById('useful-information-nav');
                    if (searchInput) searchInput.value = '';
                    if (resultsContainer) resultsContainer.classList.add('hidden');
                     if (navContainer) { // Show nav again
                        navContainer.querySelectorAll('.app-icon').forEach(article => {
                           article.style.display = 'flex';
                       });
                     }
                }
                 // Remove any lingering highlights
                modal.querySelectorAll('.content-highlight').forEach(el => el.classList.remove('content-highlight'));
            };
            
            // Close on overlay click (except for language modal)
            modal.addEventListener('click', e => {
                if (e.target === modal && modal.id !== 'language-selection-modal') {
                     closeModal();
                }
            });
            
            // Close on button click
            if (closeModalBtn) {
                 closeModalBtn.addEventListener('click', closeModal);
            }
        });
        

        // Make copy function globally accessible IF NEEDED, but better to attach listeners dynamically
         window.copyToClipboard = (button, targetId) => {
             const codeElement = document.getElementById(targetId);
             if (!codeElement || !navigator.clipboard) {
                 console.warn('Clipboard API not available or element not found.');
                 button.textContent = 'Error'; // Give feedback
                 setTimeout(() => { button.textContent = (currentLanguage === 'gr') ? 'Αντιγραφή' : 'Copy'; }, 1500); // Restore original text based on lang
                 return;
             }
             
             const originalText = button.textContent; // Store text before changing
             navigator.clipboard.writeText(codeElement.innerText).then(() => {
                 button.textContent = (currentLanguage === 'gr') ? 'Αντιγράφηκε!' : 'Copied!';
                 setTimeout(() => { button.textContent = originalText; }, 1500); // Restore original
             }).catch(err => {
                 console.error('Failed to copy text: ', err);
                 button.textContent = 'Failed!';
                  setTimeout(() => { button.textContent = originalText; }, 1500); // Restore original
             });
         };
        

        // Initialize Gym Carousel if present
        const carousel = document.querySelector('.gym-carousel');
        if (carousel) {
            const images = carousel.querySelectorAll('.gym-clothing-images img');
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            if (images.length > 0 && prevBtn && nextBtn) { // Check buttons exist too
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
                showImage(0); // Show first image initially
            }
        }
        

        // --- Initialize Core Features ---
        initializeWebSearchSuggestions(); 
        initializeUsefulInfoSearch();
        initializeCertificateFeature(); 
        
        // --- Initial Setup ---
        // Hide language modal close button initially
        if (languageModalCloseBtn) languageModalCloseBtn.style.display = 'none';
        
        // Show language modal on site visit (like old behavior)
        showModal(languageModal);
        changeLanguage('en'); 

    } // --- End of initializePortfolio ---


    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        if (!searchInput || !suggestionsContainer || !searchForm) return;

        // Debounce function to limit API calls
         const debounce = (func, delay) => {
             let timeoutId;
             return (...args) => {
                 clearTimeout(timeoutId);
                 timeoutId = setTimeout(() => {
                     func.apply(this, args);
                 }, delay);
             };
         };

        // Function to fetch and display suggestions
        const fetchSuggestions = (query) => {
            // Remove any existing script tag to prevent multiple callbacks
            const oldScript = document.getElementById('jsonp-script');
            if (oldScript) {
                oldScript.remove();
            }

            // Create new script tag for JSONP request
            const script = document.createElement('script');
            script.id = 'jsonp-script';
             // Include language parameter if Google supports it (hl=...)
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                console.error("Error loading Google suggestions. Network issue or ad-blocker likely.");
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = ''; // Clear stale suggestions on error
            };
            
            document.head.appendChild(script);
        };

        // Debounced version of the fetch function
         const debouncedFetchSuggestions = debounce(fetchSuggestions, 250); // 250ms delay


        // Global callback function for JSONP
        window.handleGoogleSuggestions = (data) => {
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions
            const suggestions = data[1]; // Suggestions are usually in the second element

            if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
                suggestions.slice(0, 5).forEach(suggestion => { // Limit to 5 suggestions
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    itemEl.textContent = suggestion;
                    
                    // Event listener for clicking a suggestion
                    itemEl.addEventListener('click', () => {
                        searchInput.value = suggestion; // Fill input with suggestion
                        suggestionsContainer.classList.add('hidden'); // Hide container
                        searchForm.submit(); // Submit the form
                        
                        // Clear input slightly after submission allows form data to be sent
                        setTimeout(() => { searchInput.value = ''; }, 100); 
                    });
                    suggestionsContainer.appendChild(itemEl);
                });
                suggestionsContainer.classList.remove('hidden'); // Show container
            } else {
                suggestionsContainer.classList.add('hidden'); // Hide if no suggestions
            }
        };


        // Input event listener
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();

            if (query.length < 1) { // Hide suggestions if input is empty
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = ''; // Clear content
                return;
            }
            
            debouncedFetchSuggestions(query); // Call the debounced fetch function
        });

        // Click outside listener to hide suggestions
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) { // If click is outside the search form
                suggestionsContainer.classList.add('hidden');
            }
        });

         // Optional: Hide on Escape key press
         searchInput.addEventListener('keydown', (e) => {
             if (e.key === 'Escape') {
                 suggestionsContainer.classList.add('hidden');
             }
         });
    }


    async function buildUsefulInfoSearchIndex(progressBar, progressText) {
        if (isUsefulInfoIndexBuilt || usefulInfoFiles.length === 0) return;

        let filesLoaded = 0;
        const totalFiles = usefulInfoFiles.length;
        usefulInfoSearchIndex = []; // Clear previous index if rebuilding

        const indexPromises = usefulInfoFiles.map(async (file) => {
            try {
                const response = await fetch(file.download_url);
                if (!response.ok) {
                    console.error(`Failed to fetch ${file.name}: ${response.status}`);
                    return; // Skip this file
                }
                const htmlContent = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;

                // Extract titles (more robustly)
                 let fallbackTitleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/,'').replace(/_/g, ' ');
                 let fallbackTitleGR = fallbackTitleEN; // Default GR to EN

                 // Try extracting titles from specific elements if they exist
                 const titleElementEN = tempDiv.querySelector('#article-titles [data-lang="en"]');
                 const titleElementGR = tempDiv.querySelector('#article-titles [data-lang="gr"]');
                 
                 const titleEN = titleElementEN ? titleElementEN.textContent.trim() : fallbackTitleEN;
                 const titleGR = titleElementGR ? titleElementGR.textContent.trim() : fallbackTitleGR; // Use EN fallback if GR element missing


                // Index content sections
                tempDiv.querySelectorAll('[data-lang-section]').forEach(section => {
                    const lang = section.dataset.langSection;
                    const articleTitle = lang === 'gr' ? titleGR : titleEN; // Use correct title for language

                    // Select relevant content elements
                    section.querySelectorAll('h3, h4, p, li, b, code, .tip, .note').forEach(el => {
                         // Basic cleaning: remove extra whitespace
                        const text = el.textContent.trim().replace(/\s+/g, ' '); 
                        
                        if (text.length > 5) { // Only index meaningful text snippets
                            const item = {
                                lang,
                                title: articleTitle,
                                text,
                                url: file.download_url, // Store URL to load content later
                                weight: (el.tagName === 'H3' ? 5 : (el.tagName === 'H4' ? 3 : 1)) // Weight headings higher
                            };
                            usefulInfoSearchIndex.push(SearchEngine.preprocessItem(item));
                        }
                    });
                });
            } catch (e) {
                console.error(`Failed to index file: ${file.name}`, e);
            } finally {
                filesLoaded++;
                const progress = Math.min(100, (filesLoaded / totalFiles) * 100); // Ensure progress doesn't exceed 100
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${Math.round(progress)}%`;
            }
        });

        await Promise.all(indexPromises);
        SearchEngine.calculateIdf('usefulInfo', usefulInfoSearchIndex); // Calculate IDF after all docs processed
        isUsefulInfoIndexBuilt = true;
        console.log(`Useful Info Index built with ${usefulInfoSearchIndex.length} items.`);
    }

    // Function to update button titles AFTER index is built
    function updateUsefulInfoButtonTitles() {
         if (!isUsefulInfoIndexBuilt) return; // Only run if index is ready

         // Create a map of URL -> {en: title, gr: title} from the index
         const titleMap = new Map();
         usefulInfoSearchIndex.forEach(item => {
             if (!titleMap.has(item.url)) {
                 titleMap.set(item.url, {});
             }
             const langTitles = titleMap.get(item.url);
             // Only set the title if it's not already set for that language (first occurrence wins)
             if (!langTitles[item.lang]) { 
                 langTitles[item.lang] = item.title;
             }
         });

         // Update the buttons in the DOM
         document.querySelectorAll('#useful-information-nav .app-icon[data-url]').forEach(button => {
             const url = button.dataset.url;
             const titles = titleMap.get(url);
             if (titles) {
                 const buttonSpan = button.querySelector('span');
                 if (buttonSpan) {
                     const titleEN = titles.en || buttonSpan.getAttribute('data-en') || 'Untitled'; // Fallbacks
                     const titleGR = titles.gr || titleEN; // Fallback GR to EN if missing

                     buttonSpan.setAttribute('data-en', titleEN);
                     buttonSpan.setAttribute('data-gr', titleGR);
                     // Update current text based on selected language
                     buttonSpan.textContent = (currentLanguage === 'gr' ? titleGR : titleEN);
                 }
             }
         });
          // Re-apply current language to ensure all static text is correct too
          changeLanguage(currentLanguage);
    }


    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        const promptText = document.getElementById('useful-info-prompt');

        if (!searchInput || !resultsContainer || !navContainer || !promptText) {
             console.error("Useful Info Search elements not found.");
             return; // Stop initialization if elements are missing
        }

        // Create Progress Bar elements dynamically
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress-bar-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const progressText = document.createElement('span');
        progressText.className = 'progress-bar-text';
        progressText.textContent = '0%';

        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressText);
        // Insert progress bar before the navigation container
        navContainer.parentNode.insertBefore(progressBarContainer, navContainer);

        // Helper to show/hide the main navigation list
        const showNav = (shouldShow) => {
            navContainer.style.display = shouldShow ? 'grid' : 'none'; // Use grid display
            promptText.style.display = shouldShow ? 'block' : 'none'; // Toggle prompt text
        };

        // FIXED: Add event delegation for search results
        resultsContainer.addEventListener('click', (e) => {
            const searchResultItem = e.target.closest('.search-result-item');
            if (searchResultItem) {
                const query = searchInput.value.trim();
                searchInput.value = '';
                resultsContainer.classList.add('hidden');
                showNav(true);
                
                // Extract title and text from the result item
                const title = searchResultItem.querySelector('small').textContent;
                const text = searchResultItem.textContent.replace(title, '').trim();
                
                // Find the corresponding result in the index to get the URL
                const results = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage, 'usefulInfo');
                const matchedResult = results.find(result => 
                    result.title === title && result.text.includes(text.substring(0, 50))
                );
                
                if (matchedResult) {
                    loadInformationContent(matchedResult.url, matchedResult.title, query);
                }
            }
        });

        // Trigger index building on first focus
        searchInput.addEventListener('focus', async () => {
            if (isUsefulInfoIndexBuilt || isFetchingUsefulInfo) return; // Don't rebuild if already done or in progress

            isFetchingUsefulInfo = true; // Prevent multiple fetches if focus happens quickly
            searchInput.placeholder = currentLanguage === 'gr' ? 'Ευρετηρίαση άρθρων...' : 'Indexing articles...';
            searchInput.disabled = true;
            progressBarContainer.style.display = 'block'; // Show progress bar
            progressBar.style.width = '0%';
            progressText.textContent = '0%';

            // Assuming fetchUsefulInformation populates usefulInfoFiles first
             if (!usefulInformationLoaded) {
                 await fetchUsefulInformation(); // Ensure file list is loaded
             }

             if (usefulInfoFiles.length > 0) {
                 await buildUsefulInfoSearchIndex(progressBar, progressText);
                 updateUsefulInfoButtonTitles(); // Update titles after indexing
             } else {
                  console.warn("No useful info files found to index.");
             }

            // Hide progress bar after a short delay
            setTimeout(() => {
                progressBarContainer.style.display = 'none';
            }, 500);

            searchInput.disabled = false;
            searchInput.placeholder = currentLanguage === 'gr' ? 'Αναζήτηση άρθρων...' : 'Search articles...';
            searchInput.focus(); // Re-focus after enabling
            isFetchingUsefulInfo = false;

        }, { once: true }); // Only run this focus listener once


        // Handle search input changes
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = ''; // Clear previous results

            if (!isUsefulInfoIndexBuilt) {
                 resultsContainer.classList.add('hidden');
                 showNav(true); // Show nav if index isn't ready
                 return;
            }

            if (query.length < 2) { // Minimum query length
                resultsContainer.classList.add('hidden');
                showNav(true); // Show nav if query is too short
                return;
            }
            
            showNav(false); // Hide nav when showing results

            // Perform search using the engine
            const results = SearchEngine.search(query, usefulInfoSearchIndex, currentLanguage, 'usefulInfo');

            if (results.length > 0) {
                results.slice(0, 7).forEach(result => { // Limit results displayed
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('search-result-item');
                    
                    // Generate and highlight snippet
                    const snippet = SearchEngine.generateSnippet(result.text, query, currentLanguage);
                    const highlightedSnippet = SearchEngine.highlight(snippet, query, currentLanguage);

                    // Display snippet and title
                    itemEl.innerHTML = `${highlightedSnippet} <small>${result.title}</small>`;
                    
                    resultsContainer.appendChild(itemEl);
                });
                resultsContainer.classList.remove('hidden'); // Show results container
            } else {
                 // No results found - show message instead of nav? Or show nav? Show nav is simpler.
                 resultsContainer.classList.add('hidden'); 
                 resultsContainer.innerHTML = `<div class="search-result-item" style="text-align: center; color: var(--nm-text-muted);">${currentLanguage === 'gr' ? 'Δεν βρέθηκαν αποτελέσματα' : 'No results found'}</div>`; // Show no results message
                 resultsContainer.classList.remove('hidden');
                // showNav(true); // Option: show nav again if no results
            }
        });
         // Clear results when input is cleared
         searchInput.addEventListener('keyup', (e) => {
             if (searchInput.value.trim().length === 0) {
                 resultsContainer.innerHTML = '';
                 resultsContainer.classList.add('hidden');
                 showNav(true);
             }
         });
    }

    // Fetches the list of HTML files from GitHub
    async function fetchUsefulInformation() {
        if (usefulInformationLoaded || isFetchingUsefulInfo) return; // Prevent multiple fetches
        isFetchingUsefulInfo = true; // Set flag

        const navContainer = document.getElementById('useful-information-nav');
        const GITHUB_API_URL = 'https://api.github.com/repos/dedsec1121fk/dedsec1121fk.github.io/contents/Useful_Information';
        
        if (!navContainer) {
            console.error("Useful Information nav container not found.");
             isFetchingUsefulInfo = false;
             return;
        }

        navContainer.innerHTML = `<p style="text-align: center; color: var(--nm-text-muted);">${currentLanguage === 'gr' ? 'Φόρτωση λίστας άρθρων...' : 'Loading article list...'}</p>`; // Loading message
        
        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            const files = await response.json();

            // Filter for HTML files only
            usefulInfoFiles = files.filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            navContainer.innerHTML = ''; // Clear loading message

            if (usefulInfoFiles.length === 0) {
                 navContainer.innerHTML = `<p style="text-align: center; color: var(--nm-text-muted);">${currentLanguage === 'gr' ? 'Δεν βρέθηκαν άρθρα.' : 'No articles found.'}</p>`;
                 usefulInformationLoaded = true; // Mark as loaded even if empty
                 isFetchingUsefulInfo = false;
                 return;
            }
            
            // Sort files, perhaps alphabetically or by a number prefix?
            usefulInfoFiles.sort((a, b) => a.name.localeCompare(b.name)); // Simple alpha sort

            // Create buttons for each file
            usefulInfoFiles.forEach(file => {
                 // Extract initial titles from filename (will be updated after indexing)
                 let titleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/,'').replace(/_/g, ' ');
                 let titleGR = titleEN; 
                 const titleRegex = /(.+?)_\((.+?)\)/; // Check for pattern like "English_(Greek)"
                 const match = file.name.match(titleRegex);
                 if (match && match[1] && match[2]) {
                     titleEN = match[1].replace(/_/g, ' ').trim();
                     titleGR = match[2].replace(/_/g, ' ').trim();
                 }
    
                const button = document.createElement('button');
                button.className = 'app-icon'; // Use app-icon style for consistency
                button.dataset.url = file.download_url; // Store download URL
                
                const initialTitle = currentLanguage === 'gr' ? titleGR : titleEN;
                 // Set data attributes for later update and initial display
                button.innerHTML = `<i class="fas fa-book-open"></i><span data-en="${titleEN}" data-gr="${titleGR}">${initialTitle}</span>`;
                
                button.addEventListener('click', () => {
                    const span = button.querySelector('span');
                    // Get the correct title based on current language for the modal header
                    const modalTitle = span.getAttribute(`data-${currentLanguage}`) || span.getAttribute('data-en') || 'Article';
                    loadInformationContent(file.download_url, modalTitle);
                });
                navContainer.appendChild(button);
            });

            usefulInformationLoaded = true; // Mark list as loaded

        } catch (error) {
            console.error('Failed to fetch useful information list:', error);
            navContainer.innerHTML = `<p style="text-align: center; color: var(--nm-danger);">${currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης λίστας άρθρων.' : 'Failed to load article list.'}</p>`;
        } finally {
            isFetchingUsefulInfo = false; // Reset flag
        }
    }


    // Creates and displays a modal specifically for article content
    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        // Remove any existing article modals first
        document.querySelectorAll('.article-modal-overlay').forEach(modal => modal.remove());

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay article-modal-overlay'; // Unique class
        modalOverlay.style.opacity = '0'; // Start hidden for transition
        
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                     <div id="article-content-wrapper"> ${htmlContent}
                     </div>
                 </div>
            </div>`;
        document.body.appendChild(modalOverlay);

        const modalContent = modalOverlay.querySelector('.modal-content');
        const modalBody = modalOverlay.querySelector('.modal-body');
        const closeModalBtn = modalOverlay.querySelector('.close-modal');

        // Dynamically attach copy button listeners within the new modal
        const codeContainers = modalOverlay.querySelectorAll('.code-container');
        let dynamicCodeIdCounter = 0; // Ensure unique IDs if needed
        codeContainers.forEach(container => {
            const copyBtn = container.querySelector('.copy-btn');
            const codeEl = container.querySelector('code');

            if (copyBtn && codeEl) {
                // Ensure code element has an ID
                if (!codeEl.id) {
                    codeEl.id = `dynamic-code-${Date.now()}-${dynamicCodeIdCounter++}`;
                }
                
                // Add listener to *this specific* button
                copyBtn.addEventListener('click', (e) => {
                     e.stopPropagation(); // Prevent modal close if clicking button
                    window.copyToClipboard(copyBtn, codeEl.id);
                });

                 // Update button text language
                 const copyText = (currentLanguage === 'gr') ? 'Αντιγραφή' : 'Copy';
                 copyBtn.textContent = copyText; // Set initial text
            }
        });
        
        // Apply current language translations to the dynamically loaded content
         // This assumes the loaded HTML also uses data-en/data-gr attributes
         const contentWrapper = modalOverlay.querySelector('#article-content-wrapper');
         if (contentWrapper) {
             contentWrapper.querySelectorAll('[data-en]').forEach(el => {
                 const text = el.getAttribute(`data-${currentLanguage}`) || el.getAttribute('data-en');
                  // Similar logic as changeLanguage, handle direct text vs children
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
             
             contentWrapper.querySelectorAll('[data-lang-section]').forEach(el => {
                 el.style.display = el.dataset.langSection === currentLanguage ? 'block' : 'none';
                 el.classList.toggle('hidden', el.dataset.langSection !== currentLanguage);
             });
         }

        // Highlight specific text if provided (after content is in DOM)
        if (textToHighlight) {
            setTimeout(() => {
                 const treeWalker = document.createTreeWalker(modalBody, NodeFilter.SHOW_TEXT);
                 let targetNode = null;
                 while (treeWalker.nextNode()) {
                     if (treeWalker.currentNode.textContent.includes(textToHighlight)) {
                         targetNode = treeWalker.currentNode.parentElement;
                         break;
                     }
                 }
                 if (targetNode) {
                     targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     targetNode.classList.add('content-highlight');
                     setTimeout(() => { targetNode.classList.remove('content-highlight'); }, 2500);
                 }
            }, 100);
        }

        // Modal close logic
        const closeModal = () => {
            modalOverlay.style.opacity = '0';
            setTimeout(() => {
                if (modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay);
                }
            }, 300); // Match CSS transition duration
        };

        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) closeModal();
        });
        closeModalBtn.addEventListener('click', closeModal);

        // Show modal with transition
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
        }, 10);
    }

    // Fetches and loads the content of a specific article file
    async function loadInformationContent(fileUrl, title, textToHighlight = null) {
        const contentContainer = document.getElementById('useful-information-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `<p style="text-align: center; color: var(--nm-text-muted);">${currentLanguage === 'gr' ? 'Φόρτωση περιεχομένου...' : 'Loading content...'}</p>`;
        
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const htmlContent = await response.text();
            
            // Use DOMParser to extract the main content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Find the main content container (adjust selector as needed)
            const mainContent = doc.querySelector('#article-content'); 
            if (mainContent) {
                createAndShowArticleModal(title, mainContent.innerHTML, textToHighlight);
            } else {
                 // Fallback: use body content
                 const bodyContent = doc.body.innerHTML;
                 createAndShowArticleModal(title, bodyContent, textToHighlight);
            }
            
        } catch (error) {
            console.error('Failed to load article content:', error);
            contentContainer.innerHTML = `<p style="text-align: center; color: var(--nm-danger);">${currentLanguage === 'gr' ? 'Αποτυχία φόρτωσης περιεχομένου.' : 'Failed to load content.'}</p>`;
        }
    }

    // --- Initialize the entire portfolio ---
    initializePortfolio();
});