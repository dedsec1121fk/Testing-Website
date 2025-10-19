document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PORTFOLIO STATE ---
    let currentLanguage = 'en';
    let usefulInfoSearchIndex = []; // Dedicated index for the modal, BUILT ON DEMAND
    let usefulInfoFiles = []; // Stores the list of files to avoid re-fetching
    let isUsefulInfoIndexBuilt = false; // Flag to check if the full index is ready
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

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

        // Check if the jsPDF library is loaded before proceeding
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            // The library failed to load. This is a critical error.
            console.error("CRITICAL: jsPDF library (window.jspdf.jsPDF) not found. Cannot generate certificate.");
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

        // Generate PDF directly
        generateCertificatePDF(firstName, lastName, age, country, city);
    }

    // --- MODIFIED PDF GENERATION FUNCTION ---
    function generateCertificatePDF(firstName, lastName, age, country, city) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4'); // Horizontal A4

            // ---- Design Changes ----
            const purpleColor = '#9966FF'; // --nm-accent
            const blackColor = '#000000';
            const greyColor = '#555555';

            // 1. White Background
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 297, 210, 'F'); // A4 landscape dimensions

            // 2. Simple Purple Border (Optional, uncomment if desired)
            // doc.setDrawColor(153, 102, 255); // Purple
            // doc.setLineWidth(1);
            // doc.rect(10, 10, 277, 190); // Inner rectangle border

            // 3. Title (Purple Text)
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(purpleColor);
            doc.text('Certificate of Participation', 148.5, 40, { align: 'center' }); // Centered horizontally

            // 4. Subtitle (Purple Text)
            doc.setFontSize(18);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(purpleColor);
            doc.text('DedSec Project - 1 Year Anniversary', 148.5, 55, { align: 'center' });

            // 5. Main Body Text (Black Text)
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(blackColor);
            doc.text('This certifies that', 148.5, 80, { align: 'center' });

            // 6. Recipient Name (Purple Text, Bold)
            doc.setFontSize(30);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(purpleColor);
            const fullName = `${firstName} ${lastName}`;
            // Simple underline for name
            const nameWidth = doc.getTextWidth(fullName);
            const nameX = 148.5 - (nameWidth / 2);
            doc.text(fullName, 148.5, 100, { align: 'center' });
            doc.setDrawColor(153, 102, 255); // Purple line
            doc.setLineWidth(0.5);
            doc.line(nameX - 5, 105, nameX + nameWidth + 5, 105); // Line under name


            // 7. Participation Text (Black Text)
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(blackColor);
            doc.text('participated in the 1 Year Anniversary version of the DedSec Project website.', 148.5, 125, { align: 'center' });
            doc.text(`Event held October 20 - October 31, 2025.`, 148.5, 135, { align: 'center' });


            // 8. Details (Smaller Grey Text)
            doc.setFontSize(10);
            doc.setTextColor(greyColor);
            const detailY = 170;
            doc.text(`Issued To: ${fullName}`, 20, detailY);
            doc.text(`Age: ${age}`, 20, detailY + 7);
            doc.text(`Location: ${city}, ${country}`, 20, detailY + 14);

            // 9. Date (Smaller Grey Text - Right side)
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            doc.text(`Date Issued: ${today}`, 277, detailY, { align: 'right' });


            // 10. Signature Area (Grey Text/Purple Line - Right side)
            doc.setFontSize(10);
            doc.setTextColor(greyColor);
            doc.text('DedSec Project Team', 277, detailY + 14, { align: 'right'});
            doc.setDrawColor(153, 102, 255); // Purple line
            doc.setLineWidth(0.5);
            doc.line(220, detailY + 10, 277, detailY + 10); // Signature line


            // ---- End Design Changes ----

            // Save the PDF
            const fileName = `DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`;
            doc.save(fileName);

            // Show success message
            showCertificateSuccess(firstName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the certificate PDF. Please try again.");
        }
    }
    // --- END MODIFIED PDF FUNCTION ---


    function showCertificateSuccess(firstName) {
        const generateBtn = document.getElementById('generate-certificate');
        const originalHTML = generateBtn.innerHTML;
        
        generateBtn.innerHTML = `
            <i class="fas fa-check"></i>
            <span data-en="Certificate Downloaded!" data-gr="Το Πιστοποιητικό Λήφθηκε!">Certificate Downloaded!</span>
        `;
        generateBtn.style.background = 'linear-gradient(135deg, #00FF00, #00CC00)';
        generateBtn.style.borderColor = '#00FF00';
        
        // Update language for success message
        changeLanguage(currentLanguage);
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-success), #00CC00)';
            generateBtn.style.borderColor = 'var(--nm-success)';
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

                        // 1. Exact Title Match (High Score)
                        let exactTitleMatches = item.titleTokens.filter(t => t === qToken).length;
                        if (exactTitleMatches > 0) {
                            score += exactTitleMatches * 10 * idf;
                            tokenFound = true;
                        }

                        // 2. Exact Text Match (Medium Score)
                        let exactTextMatches = item.textTokens.filter(t => t === qToken).length;
                        if (exactTextMatches > 0) {
                            score += exactTextMatches * 2 * idf;
                            tokenFound = true;
                        }

                        if(tokenFound) foundTokens.add(qToken);

                        // 3. Fuzzy Match (Similarity Score)
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

                    // Boost for all query tokens found
                    if (foundTokens.size === queryTokens.length && queryTokens.length > 1) score *= 1.5;

                    // Boost for exact phrase match
                    if (item.text.toLowerCase().includes(query.toLowerCase().trim())) {
                        score *= 2;
                    }
                    
                    return { ...item, score };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score);

            return scoredResults;
        }
    };


    // --- GLOBAL UTILITIES ---

    // Function to set CSS variables for glowing/highlighting
    function setGlowHighlight(element, enabled, color = 'var(--glow-color)') {
        if (element) {
            element.style.boxShadow = enabled ? `0 0 15px 5px ${color}` : 'none';
        }
    }

    // Function to open the target modal and highlight its corresponding grid button
    function openModalAndHighlight(modalId, itemTitle = null) {
        // Close all modals first
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('visible');
        });

        // Remove highlight from all app wrappers
        document.querySelectorAll('.app-wrapper').forEach(wrapper => {
            wrapper.classList.remove('active');
            setGlowHighlight(wrapper, false);
        });

        // Show the target modal
        const targetModal = document.getElementById(modalId + '-modal');
        if (targetModal) {
            targetModal.classList.add('visible');
        }

        // Highlight the corresponding button
        const button = document.querySelector(`.app-wrapper[data-modal="${modalId}"]`);
        if (button) {
            button.classList.add('active');
            // Use different glow for special modals like 'privacy' (disclaimer)
            const glowColor = (modalId === 'privacy' || modalId === 'disclaimer') ? 'var(--glow-color-danger)' : 'var(--glow-color)';
            setGlowHighlight(button, true, glowColor);
        }
    }

    // Function to close a modal by its ID
    function closeModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('visible');
        }

        // Remove highlight from all app wrappers
        document.querySelectorAll('.app-wrapper').forEach(wrapper => {
            wrapper.classList.remove('active');
            setGlowHighlight(wrapper, false);
        });
    }

    // Attach click listeners to all buttons that use the data-modal attribute
    function initializeModals() {
        document.querySelectorAll('[data-modal]').forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal');

                // NEW LOGIC START: Intercept 'installation' click to check for disclaimer first.
                if (modalId === 'installation') {
                    if (!localStorage.getItem('disclaimerAccepted')) {
                        // Disclaimer NOT accepted, open the disclaimer modal instead
                        openModalAndHighlight('disclaimer');
                        return; // Stop execution here
                    }
                    // Disclaimer accepted, proceed to open the Installation modal and load its content
                    openModalAndHighlight(modalId);
                    loadInstallationContent();
                    return;
                }
                // NEW LOGIC END
                
                // For all other buttons, open the requested modal and handle its content if needed
                openModalHandler(modalId);
            });
        });

        // Attach close listeners to all close buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (e) => {
                const modalOverlay = e.target.closest('.modal-overlay');
                if (modalOverlay) {
                    closeModalById(modalOverlay.id);
                }
            });
        });

        // Attach close listeners to all modal overlays (click outside to close)
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModalById(overlay.id);
                }
            });
        });
    }


    // --- THEME SWITCHER FUNCTIONALITY ---
    function initializeThemeSwitcher() {
        const themeBtn = document.getElementById('theme-switcher-btn');
        const currentTheme = localStorage.getItem('theme') || 'dark-theme';
        
        // Apply stored theme on load
        document.body.className = currentTheme;
        
        if (themeBtn) {
            const icon = themeBtn.querySelector('.app-icon i');
            const label = themeBtn.querySelector('.app-label');

            const updateButton = (theme) => {
                if (theme === 'dark-theme') {
                    icon.className = 'fas fa-sun';
                    label.setAttribute('data-en', 'Light Theme');
                    label.setAttribute('data-gr', 'Φωτεινό Θέμα');
                    // Re-apply language after changing data- attributes
                    label.textContent = label.getAttribute(`data-${currentLanguage}`) || 'Light Theme';
                } else {
                    icon.className = 'fas fa-moon';
                    label.setAttribute('data-en', 'Dark Theme');
                    label.setAttribute('data-gr', 'Σκοτεινό Θέμα');
                    // Re-apply language after changing data- attributes
                    label.textContent = label.getAttribute(`data-${currentLanguage}`) || 'Dark Theme';
                }
            };

            // Initial button setup
            updateButton(currentTheme);

            themeBtn.addEventListener('click', () => {
                let newTheme = document.body.classList.contains('dark-theme') ? 'light-theme' : 'dark-theme';
                document.body.className = newTheme;
                localStorage.setItem('theme', newTheme);
                updateButton(newTheme);
            });
        }
    }


    // --- LANGUAGE SWITCHER FUNCTIONALITY ---
    function changeLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        // 1. Update all data-en/data-gr attributes
        document.querySelectorAll('[data-en], [data-gr]').forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text !== null) {
                element.textContent = text;
            }
        });
        
        // 2. Handle specific language sections (for long text blocks like footer/modals)
        document.querySelectorAll('[data-lang-section]').forEach(section => {
            if (section.getAttribute('data-lang-section') === lang) {
                section.classList.remove('hidden-by-default');
            } else {
                section.classList.add('hidden-by-default');
            }
        });

        // 3. Handle specific elements that need re-rendering
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            const placeholder = searchInput.getAttribute(`data-${lang}`);
            if (placeholder) {
                searchInput.placeholder = placeholder;
            }
        }

        const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
        if (usefulInfoSearchInput) {
             const placeholder = usefulInfoSearchInput.getAttribute(`data-${lang}`);
            if (placeholder) {
                usefulInfoSearchInput.placeholder = placeholder;
            }
        }
    }

    function initializeLanguageSwitcher() {
        // Set initial language from storage or default to 'en'
        const storedLanguage = localStorage.getItem('language') || 'en';
        changeLanguage(storedLanguage);
        
        const langSwitcherBtn = document.getElementById('lang-switcher-btn');
        const langModal = document.getElementById('language-selection-modal');

        if (langSwitcherBtn) {
            langSwitcherBtn.addEventListener('click', () => {
                openModalAndHighlight('language-selection');
            });
        }

        document.querySelectorAll('.language-button').forEach(button => {
            if (button.getAttribute('data-lang') === storedLanguage) {
                button.classList.add('selected');
            }

            button.addEventListener('click', (e) => {
                const newLang = e.target.getAttribute('data-lang');
                if (newLang) {
                    changeLanguage(newLang);
                    // Update selected visual state
                    document.querySelectorAll('.language-button').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    e.target.classList.add('selected');

                    // Close the modal after selection
                    // Adding a small delay for visual confirmation
                    setTimeout(() => closeModalById('language-selection-modal'), 300);
                }
            });
        });
    }

    // --- HERO TEXT TYPING EFFECT ---
    function initializeHeroText() {
        const heroTextElement = document.querySelector('.hero-text');
        if (!heroTextElement) return;

        const enText = 'We are the digital watchdogs, defending the perimeter. Our code is our weapon. Knowledge is our shield. Join the project. Fight the power.';
        const grText = 'Είμαστε οι ψηφιακοί φύλακες, υπερασπιζόμενοι την περίμετρο. Ο κώδικάς μας είναι το όπλο μας. Η γνώση είναι η ασπίδα μας. Συμμετέχετε στο έργο. Πολεμήστε την εξουσία.';
        const textMap = { 'en': enText, 'gr': grText };
        
        let i = 0;
        let isTyping = false;
        let isDeleting = false;
        let currentText = '';
        let currentLanguageText = textMap[currentLanguage];
        const typingSpeed = 50; // ms
        const deletionSpeed = 20; // ms
        const pauseTime = 1500; // ms

        // Function to update the text based on current language
        const updateTextForLanguage = (lang) => {
            const newText = textMap[lang];
            if (newText !== currentLanguageText) {
                currentLanguageText = newText;
                i = 0; // Restart typing effect
                currentText = '';
                heroTextElement.textContent = '';
                isTyping = false;
                isDeleting = false;
            }
        };

        // Custom observer to re-run the typing effect when language changes
        const langObserver = new MutationObserver((mutationsList) => {
            for(const mutation of mutationsList) {
                if (mutation.attributeName === `data-${currentLanguage}`) {
                    updateTextForLanguage(currentLanguage);
                    break;
                }
            }
        });
        // Start observing the hero-text element for data attribute changes
        langObserver.observe(heroTextElement, { attributes: true });


        function typeWriter() {
            const fullText = currentLanguageText;
            
            if (isTyping) {
                currentText = fullText.substring(0, currentText.length + 1);
                heroTextElement.textContent = currentText;
                
                if (currentText.length === fullText.length) {
                    isTyping = false;
                    setTimeout(() => { isDeleting = true; typeWriter(); }, pauseTime);
                } else {
                    setTimeout(typeWriter, typingSpeed);
                }
            } else if (isDeleting) {
                currentText = fullText.substring(0, currentText.length - 1);
                heroTextElement.textContent = currentText;
                
                if (currentText.length === 0) {
                    isDeleting = false;
                    isTyping = true;
                    // Switch language every time the text is fully deleted
                    currentLanguage = currentLanguage === 'en' ? 'gr' : 'en';
                    changeLanguage(currentLanguage); // This also updates currentLanguageText via the observer
                    
                    setTimeout(typeWriter, pauseTime);
                } else {
                    setTimeout(typeWriter, deletionSpeed);
                }
            } else {
                 // Initial state: Start typing
                 isTyping = true;
                 typeWriter();
            }
        }
        
        // Start the effect
        typeWriter();
    }


    // --- SEARCH BAR FUNCTIONALITY ---
    function initializeSearch() {
        const searchInput = document.getElementById('main-search-input');
        const searchForm = document.getElementById('main-search-form');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        
        if (!searchInput || !searchForm || !suggestionsContainer) return;

        // Simple check to ensure the search term is not empty
        searchForm.addEventListener('submit', (e) => {
            if (searchInput.value.trim() === '') {
                e.preventDefault();
            }
        });

        // Simple hardcoded suggestions for a better user experience
        const suggestions = [
            { en: "How to use the project?", gr: "Πώς χρησιμοποιείται το έργο;" },
            { en: "What does DedSec mean?", gr: "Τι σημαίνει DedSec;" },
            { en: "Who is dedsec1121fk?", gr: "Ποιος είναι ο dedsec1121fk;" },
            { en: "Learn about Ethical Hacking", gr: "Μάθετε για το Ηθικό Hacking" },
            { en: "Check out the GitHub repository", gr: "Δείτε το GitHub repository" }
        ];

        // Function to render suggestions
        const renderSuggestions = (query) => {
            suggestionsContainer.innerHTML = '';
            
            if (query.length < 2) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            const langSuggestions = suggestions.map(s => s[currentLanguage] || s.en);
            const filteredSuggestions = langSuggestions.filter(s => 
                s.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5); // Limit to 5 suggestions

            if (filteredSuggestions.length > 0) {
                filteredSuggestions.forEach(suggestion => {
                    const div = document.createElement('div');
                    div.classList.add('suggestion-item');
                    div.textContent = suggestion;
                    div.addEventListener('click', () => {
                        searchInput.value = suggestion;
                        searchForm.submit();
                        suggestionsContainer.classList.add('hidden');
                    });
                    suggestionsContainer.appendChild(div);
                });
                suggestionsContainer.classList.remove('hidden');
            } else {
                suggestionsContainer.classList.add('hidden');
            }
        };

        // Event listeners for search input
        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            const query = e.target.value.trim();
            debounceTimeout = setTimeout(() => renderSuggestions(query), 200);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target) && !suggestionsContainer.classList.contains('hidden')) {
                suggestionsContainer.classList.add('hidden');
            }
        });

        // Show suggestions on focus if there's already some input
        searchInput.addEventListener('focus', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                renderSuggestions(query);
            }
        });
    }

    // --- SCROLL INDICATOR ---
    function initializeScrollIndicator() {
        const screen = document.querySelector('.screen');
        const thumb = document.getElementById('scroll-indicator-thumb');
        
        if (!screen || !thumb) return;

        screen.addEventListener('scroll', () => {
            // Calculate scroll percentage
            const scrollPercent = (screen.scrollTop / (screen.scrollHeight - screen.clientHeight)) * 100;
            
            // Set the width of the thumb
            thumb.style.width = scrollPercent + '%';
        });
    }
    
    // --- USEFUL INFORMATION MODAL FUNCTIONALITY ---
    
    // Function to build the index once with fetched content (simulating file fetch)
    // NOTE: This is a placeholder for actual data fetching from files, which is not implemented here.
    async function fetchAndBuildUsefulInfoIndex() {
        if (isFetchingUsefulInfo) return;
        isFetchingUsefulInfo = true;

        try {
            // Simulate fetching the list of files (from a real server/API call)
            const fileListResponse = await fetch('data/useful_info_files.json');
            if (!fileListResponse.ok) throw new Error('Failed to fetch file list');
            const files = await fileListResponse.json();
            usefulInfoFiles = files; // Store the list of files

            // Build the initial navigation buttons
            const navContainer = document.getElementById('useful-information-nav');
            if (!navContainer) return;

            navContainer.innerHTML = '';
            files.forEach(file => {
                const button = document.createElement('button');
                button.classList.add('app-wrapper', 'search-result-item');
                // The data-modal is set to 'article' to use the generic article modal
                button.setAttribute('data-article-url', file.url);
                button.setAttribute('data-article-title-en', file.title.en);
                button.setAttribute('data-article-title-gr', file.title.gr);
                button.setAttribute('data-article-text-en', file.text.en);
                button.setAttribute('data-article-text-gr', file.text.gr);

                const iconDiv = document.createElement('div');
                iconDiv.classList.add('app-icon');
                iconDiv.innerHTML = `<i class="fas ${file.icon}"></i>`;
                
                const labelSpan = document.createElement('span');
                labelSpan.classList.add('app-label');
                labelSpan.setAttribute('data-en', file.title.en);
                labelSpan.setAttribute('data-gr', file.title.gr);
                labelSpan.textContent = file.title[currentLanguage] || file.title.en;
                
                button.appendChild(iconDiv);
                button.appendChild(labelSpan);
                navContainer.appendChild(button);

                // Add to search index
                usefulInfoSearchIndex.push({
                    id: file.id,
                    title: file.title.en,
                    text: file.text.en,
                    url: file.url,
                    icon: file.icon,
                    lang: 'en'
                });
                usefulInfoSearchIndex.push({
                    id: file.id,
                    title: file.title.gr,
                    text: file.text.gr,
                    url: file.url,
                    icon: file.icon,
                    lang: 'gr'
                });
            });

            // Pre-process and calculate IDF for the full index
            const enIndex = usefulInfoSearchIndex.filter(item => item.lang === 'en').map(SearchEngine.preprocessItem.bind(SearchEngine));
            const grIndex = usefulInfoSearchIndex.filter(item => item.lang === 'gr').map(SearchEngine.preprocessItem.bind(SearchEngine));
            usefulInfoSearchIndex = [...enIndex, ...grIndex];

            SearchEngine.calculateIdf('usefulInfo-en', enIndex);
            SearchEngine.calculateIdf('usefulInfo-gr', grIndex);

            isUsefulInfoIndexBuilt = true;
            usefulInformationLoaded = true;
            console.log('Useful Information Index built successfully.');

        } catch (error) {
            console.error('Error fetching/building Useful Information Index:', error);
            const navContainer = document.getElementById('useful-information-nav');
            if(navContainer) {
                navContainer.innerHTML = `<p style="color: var(--nm-danger);" data-en="Failed to load articles." data-gr="Αποτυχία φόρτωσης άρθρων.">Failed to load articles.</p>`;
            }
        } finally {
            isFetchingUsefulInfo = false;
        }
    }

    // Function to handle the actual search in the modal
    function handleUsefulInfoSearch(query) {
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        const prompt = document.getElementById('useful-info-prompt');
        
        if (!resultsContainer || !navContainer || !prompt) return;

        if (query.length < 2) {
            resultsContainer.classList.add('hidden');
            navContainer.classList.remove('hidden');
            prompt.classList.remove('hidden');
            return;
        }

        navContainer.classList.add('hidden');
        prompt.classList.add('hidden');
        
        // Filter the preprocessed index based on current language
        const langIndex = usefulInfoSearchIndex.filter(item => item.lang === currentLanguage);
        
        const results = SearchEngine.search(query, langIndex, currentLanguage, `usefulInfo-${currentLanguage}`);

        resultsContainer.innerHTML = '';

        if (results.length > 0) {
            results.slice(0, 10).forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.innerHTML = `
                    <div class="search-result-icon"><i class="fas ${item.icon}"></i></div>
                    <div class="search-result-text">
                        <strong>${item.title}</strong>
                        <small>${item.text.substring(0, 100)}...</small>
                    </div>
                `;
                resultItem.addEventListener('click', () => {
                    // Load the content of the article
                    loadInformationContent(item.url, item.title, query);
                });
                resultsContainer.appendChild(resultItem);
            });
            resultsContainer.classList.remove('hidden');
        } else {
            const noResults = document.createElement('div');
            noResults.classList.add('search-result-item');
            noResults.textContent = currentLanguage === 'en' ? 'No articles found.' : 'Δεν βρέθηκαν άρθρα.';
            resultsContainer.appendChild(noResults);
            resultsContainer.classList.remove('hidden');
        }
    }

    // Initialize search listener for the Useful Information modal
    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        if (!searchInput) return;

        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            const query = e.target.value.trim();
            debounceTimeout = setTimeout(() => handleUsefulInfoSearch(query), 200);
        });
        
        // Revert to nav view when search is cleared
        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim().length < 2) {
                document.getElementById('useful-info-results-container')?.classList.add('hidden');
                document.getElementById('useful-information-nav')?.classList.remove('hidden');
                document.getElementById('useful-info-prompt')?.classList.remove('hidden');
            }
        });
    }

    // Re-initializes the article click listeners for the navigation
    function initializeArticleClickListeners() {
        // Attach click listeners to all buttons that open an article
        document.querySelectorAll('[data-article-url]').forEach(button => {
            button.addEventListener('click', () => {
                const url = button.getAttribute('data-article-url');
                const titleKey = `data-article-title-${currentLanguage}`;
                const title = button.getAttribute(titleKey) || button.getAttribute('data-article-title-en');
                
                if (url && title) {
                    loadInformationContent(url, title);
                }
            });
        });
    }

    // Create a new modal for the article content
    function createAndShowArticleModal(title, htmlContent, textToHighlight = null) {
        let articleModal = document.getElementById('article-modal');
        if (!articleModal) {
            // Create the modal element if it doesn't exist
            articleModal = document.createElement('div');
            articleModal.id = 'article-modal';
            articleModal.classList.add('modal-overlay');
            articleModal.innerHTML = `
                <div class="modal-content modal-content-article">
                    <div class="modal-header">
                        <h2 id="article-modal-title"></h2>
                        <button class="close-modal" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body article-modal-body">
                        <div id="article-modal-content-wrapper"></div>
                        <div class="modal-footer">
                            <button id="article-copy-button" class="copy-btn">
                                <i class="fas fa-copy"></i>
                                <span data-en="Copy Content" data-gr="Αντιγραφή Περιεχομένου">Copy Content</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(articleModal);
            
            // Re-initialize modal close listeners for the new modal
            articleModal.addEventListener('click', e => {
                if (e.target === articleModal) closeModalById('article-modal');
            });
            articleModal.querySelector('.close-modal')?.addEventListener('click', () => closeModalById('article-modal'));
        }

        // Populate the modal content
        document.getElementById('article-modal-title').textContent = title;
        const contentWrapper = document.getElementById('article-modal-content-wrapper');
        contentWrapper.innerHTML = htmlContent;

        // Apply highlighting if a search query was provided
        if (textToHighlight) {
            const regex = new RegExp(`(${textToHighlight})`, 'gi');
            contentWrapper.innerHTML = contentWrapper.innerHTML.replace(regex, '<mark>$1</mark>');
        }
        
        // Handle copy button
        const copyButton = document.getElementById('article-copy-button');
        const copySpan = copyButton.querySelector('span');
        const originalText = {
            en: copySpan.getAttribute('data-en'),
            gr: copySpan.getAttribute('data-gr')
        };

        const copyContent = () => {
            // Get all text content, stripping HTML tags
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const plainText = tempDiv.textContent || tempDiv.innerText || "";
            
            navigator.clipboard.writeText(plainText).then(() => {
                // Success message
                copySpan.setAttribute('data-en', 'Copied!');
                copySpan.setAttribute('data-gr', 'Αντιγράφηκε!');
                copySpan.textContent = copySpan.getAttribute(`data-${currentLanguage}`);
                
                setTimeout(() => {
                    // Revert to original text
                    copySpan.setAttribute('data-en', originalText.en);
                    copySpan.setAttribute('data-gr', originalText.gr);
                    copySpan.textContent = copySpan.getAttribute(`data-${currentLanguage}`);
                }, 1500);
            }).catch(err => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy content.');
            });
        };

        // Remove old listener if it exists and attach new one
        const newCopyButton = copyButton.cloneNode(true);
        copyButton.parentNode.replaceChild(newCopyButton, copyButton);
        newCopyButton.addEventListener('click', copyContent);


        // Show the article modal
        articleModal.classList.add('visible');
    }

    // Function to handle opening the Useful Information Modal
    function openUsefulInformationModal() {
        if (!usefulInformationLoaded) {
            fetchAndBuildUsefulInfoIndex().then(() => {
                // If fetching was successful, re-initialize the article listeners
                // and open the modal, which the calling function will handle
                initializeArticleClickListeners();
            });
        }
        // Even if loading, we open the modal now to show the loading state
        openModalAndHighlight('useful-information');
        // Initialize or re-initialize article click listeners for the static content
        initializeArticleClickListeners();
    }


    // Handle the generic modal content update for installation modal
    function loadInstallationContent() {
        const modal = document.getElementById('installation-modal');
        const contentContainer = modal?.querySelector('.modal-body');
        if (!contentContainer) return;

        // The installation content is often a simple block of commands or text
        // For this example, we'll fetch a pre-defined content file, similar to useful info
        
        // Placeholder implementation (should fetch from a dedicated file/API)
        const enContent = `
            <h3>Installation Steps (Linux/macOS)</h3>
            <ol>
                <li><strong>Clone the Repository:</strong><br>
                    <code>git clone https://github.com/dedsec1121fk/dedsec-project.git</code>
                </li>
                <li><strong>Navigate to the Directory:</strong><br>
                    <code>cd dedsec-project</code>
                </li>
                <li><strong>Install Dependencies (Optional, for Python-based tools):</strong><br>
                    <code>pip install -r requirements.txt</code>
                </li>
                <li><strong>Run the Setup Script:</strong><br>
                    <code>./setup.sh</code>
                </li>
                <li><strong>Execute the Main Tool:</strong><br>
                    <code>python3 main.py</code>
                </li>
            </ol>
            <div class="note note-warning" data-lang-section="en">
                <p><strong>Warning:</strong> The DedSec Project is for educational and ethical hacking purposes only. Do not use this tool on systems you do not own or have explicit written permission to test.</p>
            </div>
        `;
        const grContent = `
            <h3>Βήματα Εγκατάστασης (Linux/macOS)</h3>
            <ol>
                <li><strong>Κλωνοποίηση του Αποθετηρίου (Repository):</strong><br>
                    <code>git clone https://github.com/dedsec1121fk/dedsec-project.git</code>
                </li>
                <li><strong>Μετάβαση στον Κατάλογο:</strong><br>
                    <code>cd dedsec-project</code>
                </li>
                <li><strong>Εγκατάσταση Εξαρτήσεων (Προαιρετικά, για εργαλεία Python):</strong><br>
                    <code>pip install -r requirements.txt</code>
                </li>
                <li><strong>Εκτέλεση του Setup Script:</strong><br>
                    <code>./setup.sh</code>
                </li>
                <li><strong>Εκτέλεση του Κύριου Εργαλείου:</strong><br>
                    <code>python3 main.py</code>
                </li>
            </ol>
            <div class="note note-warning" data-lang-section="gr">
                <p><strong>Προειδοποίηση:</strong> Το DedSec Project προορίζεται μόνο για εκπαιδευτικούς σκοπούς και ηθικό hacking. Μην χρησιμοποιείτε αυτό το εργαλείο σε συστήματα που δεν σας ανήκουν ή για τα οποία δεν έχετε ρητή γραπτή άδεια δοκιμής.</p>
            </div>
        `;

        contentContainer.innerHTML = currentLanguage === 'en' ? enContent : grContent;
        changeLanguage(currentLanguage); // Ensure any nested multi-language content is updated
    }


    // Loads content from a URL and displays it in the article modal
    async function loadInformationContent(url, title, textToHighlight = null) {
         // Add a loading indicator?
         console.log(`Loading content for: ${title} from ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
            const htmlContent = await response.text();
            
            // Create the modal with the fetched content
            createAndShowArticleModal(title, htmlContent, textToHighlight);

        } catch (error) {
            console.error('Failed to load article content:', error);
             // Show an error message to the user in the modal area or as an alert
             createAndShowArticleModal(title, `<p style="color: var(--nm-danger);">Failed to load content. Please check the console for details.</p>`);
        } finally {
            // Remove loading indicator if added
        }
    }
    
    // --- GENERIC MODAL HANDLING & INITIALIZATION ---

    // The function that handles accepting the disclaimer.
    document.getElementById('accept-disclaimer')?.addEventListener('click', () => {
        localStorage.setItem('disclaimerAccepted', 'true');
        closeModalById('disclaimer-modal');
        // IMPORTANT: After accepting, immediately open the installation modal
        openModalAndHighlight('installation');
        loadInstallationContent();
    });
    
    // The function that handles declining the disclaimer.
    document.getElementById('decline-disclaimer')?.addEventListener('click', () => {
        // Implement a function to show a message and prevent page use (e.g., redirect or lock all buttons)
        showDeclineMessage(); 
    });

    // Simple function to display an error or warning when declining
    function showDeclineMessage() {
        const modal = document.getElementById('disclaimer-modal');
        if (!modal) return;

        const body = modal.querySelector('.modal-body');
        if (!body) return;

        // Clear existing content and display a prominent message
        body.innerHTML = `
            <div class="note note-danger" style="text-align: center; padding: 20px;">
                <p data-en="<strong>Access Denied.</strong> You must accept the Disclaimer and Terms of Use to proceed with the DedSec Project installation and use its tools."
                   data-gr="<strong>Άρνηση Πρόσβασης.</strong> Πρέπει να αποδεχτείτε την Αποποίηση Ευθύνης και τους Όρους Χρήσης για να προχωρήσετε στην εγκατάσταση του DedSec Project και τη χρήση των εργαλείων του.">
                   <strong>Access Denied.</strong> You must accept the Disclaimer and Terms of Use to proceed with the DedSec Project installation and use its tools.
                </p>
                <p data-en="Please reload the page to reconsider." data-gr="Παρακαλώ φορτώστε ξανά τη σελίδα για να επανεξετάσετε την απόφασή σας.">
                    Please reload the page to reconsider.
                </p>
            </div>
        `;
        changeLanguage(currentLanguage); // Apply correct language text
        
        // Optionally, disable further closing except by reloading/full-screen exit
        modal.querySelector('.close-modal').style.display = 'none';
        modal.style.pointerEvents = 'auto'; // Ensure the overlay still captures clicks
    }


    // This function is for opening a modal that needs specific content loaded.
    function openModalHandler(modalId) {
         if (modalId === 'useful-information') {
            openUsefulInformationModal();
        } else if (modalId === 'installation') {
            // This path should ideally not be hit directly anymore due to the check in initializeModals
            openModalAndHighlight(modalId);
            loadInstallationContent(); // Load the specific installation text
        } else {
             openModalAndHighlight(modalId);
        }
    }

    // --- INITIALIZE ALL FEATURES ---
    function initializePortfolio() {
        // Must be called first to attach listeners
        initializeModals(); 
        
        // Specific feature initializations
        initializeCertificateFeature();
        initializeThemeSwitcher();
        initializeLanguageSwitcher(); // <-- CORRECTED: This was missing in the previous version
        initializeHeroText();
        initializeSearch();
        initializeScrollIndicator();
        initializeUsefulInfoSearch();
    }

    initializePortfolio();

}); // End DOMContentLoaded