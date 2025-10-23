// script.js - Index page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Certificate functionality for index page
    initializeCertificateFeature();

    // Web search suggestions for index page
    initializeWebSearchSuggestions();

    function initializeCertificateFeature() {
        const certificateBtn = document.querySelector('.certificate-btn');
        const generateCertificateBtn = document.getElementById('generate-certificate');
        const certificateForm = document.getElementById('certificate-form');
        const certificateModal = document.getElementById('certificate-modal');
        
        if (certificateBtn) {
            certificateBtn.addEventListener('click', () => {
                showModal(certificateModal);
            });
        }

        if (generateCertificateBtn && certificateForm) {
            generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateCertificateBtn.style.borderColor = 'var(--nm-accent)';
            generateCertificateBtn.style.color = '#000000';

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

        // Close certificate modal
        if (certificateModal) {
            const closeModal = () => {
                hideModal(certificateModal);
                certificateForm.reset();
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
            alert('Error: Certificate generator failed to load. Please check your internet connection and try again.');
            return;
        }

        if (typeof html2canvas === 'undefined') {
            alert('Error: Certificate generator failed to load. Please check your internet connection and try again.');
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
                
                const currentLanguage = localStorage.getItem('language') || 'en';
                const fileName = currentLanguage === 'gr' 
                    ? `Πιστοποιητικό_Επετείου_DedSec_${firstName}_${lastName}.pdf`
                    : `DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`;
                
                doc.save(fileName);
                showCertificateSuccess(firstName);
            }).catch(error => {
                console.error("Error generating certificate:", error);
                document.body.removeChild(tempCertificate);
                alert("An error occurred while generating the certificate. Please try again.");
            });

        } catch (error) {
            console.error("Error in certificate generation:", error);
            alert("An error occurred while generating the certificate. Please try again.");
        }
    }

    function createCertificateHTML(firstName, lastName, age, country, city) {
        const currentLanguage = localStorage.getItem('language') || 'en';
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
        const currentLanguage = localStorage.getItem('language') || 'en';
        
        generateBtn.innerHTML = `
            <i class="fas fa-check"></i>
            <span data-en="Certificate Downloaded!" data-gr="Το Πιστοποιητικό Λήφθηκε!">Certificate Downloaded!</span>
        `;
        
        generateBtn.style.background = '#FFFFFF';
        generateBtn.style.borderColor = 'var(--nm-accent)';
        generateBtn.style.color = 'var(--nm-accent)';
        
        // Update language for success message
        const successSpan = generateBtn.querySelector('span');
        if (successSpan) {
            successSpan.textContent = currentLanguage === 'gr' ? 'Το Πιστοποιητικό Λήφθηκε!' : 'Certificate Downloaded!';
        }
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateBtn.style.borderColor = 'var(--nm-accent)';
            generateBtn.style.color = '#000000';
            
            // Restore original text in current language
            const originalSpan = generateBtn.querySelector('span');
            if (originalSpan) {
                const text = currentLanguage === 'gr' ? 'Λήψη Πιστοποιητικού' : 'Download Certificate';
                originalSpan.textContent = text;
            }
        }, 3000);
    }

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

            const currentLanguage = localStorage.getItem('language') || 'en';
            const script = document.createElement('script');
            script.id = 'jsonp-script';
            script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&hl=${currentLanguage}&callback=handleGoogleSuggestions`;
            
            script.onerror = () => {
                console.error("Error loading Google suggestions.");
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
});