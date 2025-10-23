// script.js - Index page specific functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeCertificateFeature();
    initializeWebSearchSuggestions();

    function initializeCertificateFeature() {
        const certificateBtn = document.querySelector('.certificate-btn');
        const generateCertificateBtn = document.getElementById('generate-certificate');
        const certificateForm = document.getElementById('certificate-form');
        const certificateModal = document.getElementById('certificate-modal');
        
        if (certificateBtn && certificateModal) {
            certificateBtn.addEventListener('click', () => {
                showModal(certificateModal);
            });
        }

        if (generateCertificateBtn && certificateForm) {
            generateCertificateBtn.addEventListener('click', generateCertificate);
        }

        // Close certificate modal
        if (certificateModal) {
            const closeModal = () => {
                hideModal(certificateModal);
                if (certificateForm) certificateForm.reset();
                
                // Reset generate button
                const generateBtn = document.getElementById('generate-certificate');
                if (generateBtn) {
                    generateBtn.innerHTML = `
                        <i class="fas fa-download"></i>
                        <span data-en="Download Certificate" data-gr="Λήψη Πιστοποιητικού">Download Certificate</span>
                    `;
                    generateBtn.style.background = 'linear-gradient(135deg, var(--nm-success), #00CC00)';
                    generateBtn.style.color = '#000000';
                    generateBtn.disabled = false;
                }
            };
            
            certificateModal.addEventListener('click', e => {
                if (e.target === certificateModal) closeModal();
            });
            
            const closeBtn = certificateModal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }
        }
    }

    function generateCertificate() {
        const form = document.getElementById('certificate-form');
        const generateBtn = document.getElementById('generate-certificate');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Show loading state
        generateBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span data-en="Generating..." data-gr="Δημιουργία...">Generating...</span>
        `;
        generateBtn.disabled = true;

        // Simulate certificate generation (replace with actual PDF generation)
        setTimeout(() => {
            const formData = new FormData(form);
            const firstName = formData.get('firstName');
            
            // Show success state
            generateBtn.innerHTML = `
                <i class="fas fa-check"></i>
                <span data-en="Certificate Downloaded!" data-gr="Το Πιστοποιητικό Λήφθηκε!">Certificate Downloaded!</span>
            `;
            generateBtn.style.background = '#FFFFFF';
            generateBtn.style.color = 'var(--nm-accent)';
            
            // Update language for success message
            const currentLang = localStorage.getItem('language') || 'en';
            const successSpan = generateBtn.querySelector('span');
            if (successSpan) {
                successSpan.textContent = currentLang === 'gr' ? 'Το Πιστοποιητικό Λήφθηκε!' : 'Certificate Downloaded!';
            }
            
            // Reset after 3 seconds
            setTimeout(() => {
                generateBtn.innerHTML = `
                    <i class="fas fa-download"></i>
                    <span data-en="Download Certificate" data-gr="Λήψη Πιστοποιητικού">Download Certificate</span>
                `;
                generateBtn.style.background = 'linear-gradient(135deg, var(--nm-success), #00CC00)';
                generateBtn.style.color = '#000000';
                generateBtn.disabled = false;
                
                // Update language for reset button
                const resetSpan = generateBtn.querySelector('span');
                if (resetSpan) {
                    resetSpan.textContent = currentLang === 'gr' ? 'Λήψη Πιστοποιητικού' : 'Download Certificate';
                }
                
                // Close modal after successful "download"
                setTimeout(() => {
                    const certificateModal = document.getElementById('certificate-modal');
                    if (certificateModal) hideModal(certificateModal);
                    if (form) form.reset();
                }, 1000);
            }, 3000);
        }, 2000);
    }

    function initializeWebSearchSuggestions() {
        const searchInput = document.getElementById('main-search-input');
        const suggestionsContainer = document.getElementById('search-suggestions-container');
        const searchForm = document.getElementById('main-search-form');
        
        if (!searchInput || !suggestionsContainer || !searchForm) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                suggestionsContainer.classList.add('hidden');
                suggestionsContainer.innerHTML = '';
                return;
            }
            
            // Simple demo suggestions - replace with actual API call
            const currentLang = localStorage.getItem('language') || 'en';
            const demoSuggestions = currentLang === 'gr' ? [
                `${query} κυβερνοασφάλεια`,
                `${query} ηθικό hacking`,
                `${query} termux tutorial`,
                `${query} δοκιμές διείσδυσης`,
                `${query} linux εντολές`
            ] : [
                `${query} cybersecurity`,
                `${query} ethical hacking`,
                `${query} termux tutorial`,
                `${query} penetration testing`,
                `${query} linux commands`
            ];
            
            suggestionsContainer.innerHTML = '';
            demoSuggestions.forEach(suggestion => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('search-result-item');
                itemEl.textContent = suggestion;
                
                itemEl.addEventListener('click', () => {
                    searchInput.value = suggestion;
                    suggestionsContainer.classList.add('hidden');
                    searchForm.submit();
                });
                suggestionsContainer.appendChild(itemEl);
            });
            
            suggestionsContainer.classList.remove('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
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