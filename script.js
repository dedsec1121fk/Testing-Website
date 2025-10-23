// script.js - Index page specific functionality
// CONTENT REPLACED WITH LOGIC FROM old script.js
document.addEventListener('DOMContentLoaded', () => {

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

    // --- ANNIVERSARY CERTIFICATE FUNCTIONALITY (FROM OLD SCRIPT) ---
    function initializeCertificateFeature() {
        const certificateBtn = document.querySelector('.certificate-btn');
        const generateCertificateBtn = document.getElementById('generate-certificate');
        const certificateForm = document.getElementById('certificate-form');
        const certificateModal = document.getElementById('certificate-modal');
        
        if (certificateBtn) {
            // MODIFIED: Use global showModal
            certificateBtn.addEventListener('click', () => {
                if (certificateModal) showModal(certificateModal);
            });
        }

        if (generateCertificateBtn && certificateForm) {
            // --- FIX: Set initial button color to purple to override CSS ---
            generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateCertificateBtn.style.borderColor = 'var(--nm-accent)';
            generateCertificateBtn.style.color = '#000000'; // Ensure text color is black like the green button

            // --- FIX: Add mouse listeners to control purple hover state ---
            generateCertificateBtn.addEventListener('mouseenter', () => {
                // Only apply hover if not in success state (which is handled by showCertificateSuccess)
                if (!generateCertificateBtn.querySelector('.fa-check')) {
                    generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent-hover), var(--nm-accent))';
                }
            });
            generateCertificateBtn.addEventListener('mouseleave', () => {
                // Only apply non-hover if not in success state
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
                // Reset form
                if(certificateForm) certificateForm.reset();
                // Hide preview element if it exists
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
                const currentLanguage = localStorage.getItem('language') || 'en';
                const fileName = currentLanguage === 'gr' 
                    ? `Πιστοποιητικό_Επετείου_DedSec_${firstName}_${lastName}.pdf`
                    : `DedSec_Anniversary_Certificate_${firstName}_${lastName}.pdf`;
                
                doc.save(fileName);

                // Show success message
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

    // --- NEW FUNCTION: Create certificate HTML for canvas capture ---
    function createCertificateHTML(firstName, lastName, age, country, city) {
        const currentLanguage = localStorage.getItem('language') || 'en';
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
        // --- MODIFIED: Changed success state colors as requested ---
        generateBtn.style.background = '#FFFFFF'; // White background
        generateBtn.style.borderColor = 'var(--nm-accent)'; // Purple border
        generateBtn.style.color = 'var(--nm-accent)'; // Purple text/icon
        
        // Update language for success message
        if (window.changeLanguage) {
            window.changeLanguage(localStorage.getItem('language') || 'en');
        }
        
        setTimeout(() => {
            generateBtn.innerHTML = originalHTML;
            // Restore original purple button state
            generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
            generateBtn.style.borderColor = 'var(--nm-accent)';
            generateBtn.style.color = '#000000'; // Restore original text color
            if (window.changeLanguage) {
                window.changeLanguage(localStorage.getItem('language') || 'en'); // Re-apply language to original text
            }
        }, 3000);
    }
    
    // Debounce function (helper for search)
    const debounce = (func, delay) => {
         let timeoutId;
         return (...args) => {
             clearTimeout(timeoutId);
             timeoutId = setTimeout(() => {
                 func.apply(this, args);
             }, delay);
         };
    };

    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        if (!searchInput || !suggestionsContainer || !searchForm) return;

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
            const currentLanguage = localStorage.getItem('language') || 'en';
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

    // --- Initialize the page-specific features ---
    initializeCertificateFeature();
    initializeWebSearchSuggestions();
});