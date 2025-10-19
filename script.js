// =============================================================================
// DedSec Project Website Script
// =============================================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

// Main initialization function
function initializeApp() {
    console.log('Initializing DedSec Project Website...');
    
    // Initialize all components
    initializeScrollIndicator();
    initializeModals();
    initializeSearch();
    initializeThemeSwitcher();
    initializeLanguageSwitcher();
    initializeCarousels();
    initializeUsefulInformation();
    initializeCertificateSystem();
    
    // Show disclaimer modal on first visit
    checkDisclaimerStatus();
}

// =============================================================================
// SCROLL INDICATOR
// =============================================================================

function initializeScrollIndicator() {
    const scrollIndicator = document.getElementById('scroll-indicator-thumb');
    const homeScreen = document.querySelector('.home-screen');
    
    if (!scrollIndicator || !homeScreen) return;
    
    homeScreen.addEventListener('scroll', function() {
        const scrollTop = homeScreen.scrollTop;
        const scrollHeight = homeScreen.scrollHeight - homeScreen.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        
        if (scrollHeight > 0) {
            const thumbHeight = Math.max(40, (homeScreen.clientHeight / scrollHeight) * homeScreen.clientHeight);
            const thumbPosition = (scrollPercentage / 100) * (homeScreen.clientHeight - thumbHeight);
            
            scrollIndicator.style.height = `${thumbHeight}px`;
            scrollIndicator.style.top = `${thumbPosition}px`;
            scrollIndicator.style.opacity = '1';
        } else {
            scrollIndicator.style.opacity = '0';
        }
    });
}

// =============================================================================
// MODAL MANAGEMENT
// =============================================================================

function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Initialize all modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal') + '-modal';
            openModal(modalId);
        });
    });
    
    // Initialize close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeAllModals();
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        closeAllModals();
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.classList.remove('visible');
    });
    document.body.style.overflow = '';
}

// =============================================================================
// SEARCH FUNCTIONALITY
// =============================================================================

function initializeSearch() {
    const searchInput = document.getElementById('main-search-input');
    const searchForm = document.getElementById('main-search-form');
    const searchSuggestions = document.getElementById('search-suggestions-container');
    
    if (!searchInput || !searchForm) return;
    
    // Search suggestions
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length > 0) {
            showSearchSuggestions(query);
        } else {
            hideSearchSuggestions();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchSuggestions.contains(event.target) && event.target !== searchInput) {
            hideSearchSuggestions();
        }
    });
    
    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        const query = searchInput.value.trim();
        if (query.length === 0) {
            e.preventDefault();
        }
    });
}

function showSearchSuggestions(query) {
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    if (!suggestionsContainer) return;
    
    // Simple suggestion logic - can be expanded
    const suggestions = [
        { text: 'Installation Guide', url: 'https://www.google.com/search?q=DedSec+Project+installation' },
        { text: 'GitHub Repository', url: 'https://github.com/dedsec1121fk/DedSec' },
        { text: 'Contact Information', url: 'https://www.google.com/search?q=DedSec+Project+contact' },
        { text: 'Privacy Policy', url: 'https://www.google.com/search?q=DedSec+Project+privacy' }
    ].filter(item => 
        item.text.toLowerCase().includes(query.toLowerCase())
    );
    
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions.map(item => 
            `<div class="search-result-item" onclick="window.open('${item.url}', '_blank')">${item.text}</div>`
        ).join('');
        suggestionsContainer.classList.remove('hidden');
    } else {
        hideSearchSuggestions();
    }
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
    }
}

// =============================================================================
// THEME SWITCHER
// =============================================================================

function initializeThemeSwitcher() {
    const themeSwitcher = document.getElementById('theme-switcher-btn');
    if (!themeSwitcher) return;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('dedsec-theme') || 'dark';
    setTheme(savedTheme);
    
    themeSwitcher.addEventListener('click', function() {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('dedsec-theme', theme);
}

// =============================================================================
// LANGUAGE SWITCHER
// =============================================================================

function initializeLanguageSwitcher() {
    const langSwitcher = document.getElementById('lang-switcher-btn');
    const langModal = document.getElementById('language-selection-modal');
    const langButtons = document.querySelectorAll('.language-button');
    
    if (!langSwitcher) return;
    
    // Load saved language
    const savedLang = localStorage.getItem('dedsec-language') || 'en';
    setLanguage(savedLang);
    
    langSwitcher.addEventListener('click', function() {
        openModal('language-selection-modal');
    });
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            closeAllModals();
        });
    });
}

function setLanguage(lang) {
    // Update all elements with data attributes
    const elements = document.querySelectorAll('[data-en], [data-gr]');
    elements.forEach(element => {
        const enText = element.getAttribute('data-en');
        const grText = element.getAttribute('data-gr');
        
        if (lang === 'gr' && grText) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', grText);
            } else {
                element.textContent = grText;
            }
        } else if (enText) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', enText);
            } else {
                element.textContent = enText;
            }
        }
    });
    
    // Handle lang-section elements
    const langSections = document.querySelectorAll('[data-lang-section]');
    langSections.forEach(section => {
        if (section.getAttribute('data-lang-section') === lang) {
            section.classList.remove('hidden-by-default');
        } else {
            section.classList.add('hidden-by-default');
        }
    });
    
    localStorage.setItem('dedsec-language', lang);
}

// =============================================================================
// CAROUSELS
// =============================================================================

function initializeCarousels() {
    const carousels = document.querySelectorAll('.gym-carousel');
    
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.gym-clothing-images img');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        let currentIndex = 0;
        
        if (images.length === 0) return;
        
        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = images.length - 1;
                showImage(newIndex);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= images.length) newIndex = 0;
                showImage(newIndex);
            });
        }
        
        // Auto-advance carousel
        setInterval(() => {
            let newIndex = currentIndex + 1;
            if (newIndex >= images.length) newIndex = 0;
            showImage(newIndex);
        }, 5000);
        
        // Show first image initially
        showImage(0);
    });
}

// =============================================================================
// USEFUL INFORMATION
// =============================================================================

function initializeUsefulInformation() {
    const searchInput = document.getElementById('useful-info-search-input');
    const resultsContainer = document.getElementById('useful-info-results-container');
    const contentContainer = document.getElementById('useful-information-content');
    const navContainer = document.getElementById('useful-information-nav');
    
    if (!searchInput || !resultsContainer || !contentContainer || !navContainer) return;
    
    // Sample useful information data
    const usefulInfoData = [
        {
            id: 'getting-started',
            title: { en: 'Getting Started', gr: 'Ξεκινώντας' },
            content: { 
                en: '<h3>Welcome to DedSec Project</h3><p>This guide will help you get started with the DedSec Project toolkit.</p><ul><li>Install Termux from F-Droid</li><li>Update packages and install Git</li><li>Clone the repository</li><li>Run the setup script</li></ul>',
                gr: '<h3>Καλώς ήρθατε στο DedSec Project</h3><p>Αυτός ο οδηγός θα σας βοηθήσει να ξεκινήσετε με την εργαλειοθήκη DedSec Project.</p><ul><li>Εγκαταστήστε το Termux από το F-Droid</li><li>Ενημερώστε τα πακέτα και εγκαταστήστε το Git</li><li>Κλωνοποιήστε το αποθετήριο</li><li>Εκτελέστε το script εγκατάστασης</li></ul>'
            }
        },
        {
            id: 'troubleshooting',
            title: { en: 'Troubleshooting', gr: 'Αντιμετώπιση Προβλημάτων' },
            content: {
                en: '<h3>Common Issues and Solutions</h3><p>If you encounter issues during installation or use:</p><ul><li>Ensure you have sufficient storage (min 8GB)</li><li>Check your internet connection</li><li>Verify Termux permissions</li><li>Restart Termux if scripts fail</li></ul>',
                gr: '<h3>Συχνά Προβλήματα και Λύσεις</h3><p>Αν αντιμετωπίσετε προβλήματα κατά την εγκατάσταση ή τη χρήση:</p><ul><li>Βεβαιωθείτε ότι έχετε αρκετό χώρο αποθήκευσης (ελάχ. 8GB)</li><li>Ελέγξτε τη σύνδεσή σας στο διαδίκτυο</li><li>Επαληθεύστε τα δικαιώματα του Termux</li><li>Επανεκκινήστε το Termux αν τα σενάρια αποτύχουν</li></ul>'
            }
        }
    ];
    
    // Populate navigation
    usefulInfoData.forEach(item => {
        const button = document.createElement('button');
        button.className = 'app-wrapper';
        button.innerHTML = `
            <div class="app-icon"><i class="fas fa-info-circle"></i></div>
            <span class="app-label" data-en="${item.title.en}" data-gr="${item.title.gr}">${item.title.en}</span>
        `;
        button.addEventListener('click', () => {
            displayUsefulInfoContent(item);
        });
        navContainer.appendChild(button);
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length > 0) {
            const filteredItems = usefulInfoData.filter(item => 
                item.title.en.toLowerCase().includes(query) || 
                item.title.gr.toLowerCase().includes(query) ||
                item.content.en.toLowerCase().includes(query) ||
                item.content.gr.toLowerCase().includes(query)
            );
            
            if (filteredItems.length > 0) {
                resultsContainer.innerHTML = filteredItems.map(item => 
                    `<div class="search-result-item" onclick="displayUsefulInfoContent(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        ${item.title.en}
                        <small>${item.title.gr}</small>
                    </div>`
                ).join('');
                resultsContainer.classList.remove('hidden');
            } else {
                resultsContainer.classList.add('hidden');
            }
        } else {
            resultsContainer.classList.add('hidden');
        }
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(event) {
        if (!resultsContainer.contains(event.target) && event.target !== searchInput) {
            resultsContainer.classList.add('hidden');
        }
    });
}

function displayUsefulInfoContent(item) {
    const contentContainer = document.getElementById('useful-information-content');
    const prompt = document.getElementById('useful-info-prompt');
    const resultsContainer = document.getElementById('useful-info-results-container');
    
    if (!contentContainer || !prompt) return;
    
    const currentLang = localStorage.getItem('dedsec-language') || 'en';
    const content = item.content[currentLang] || item.content.en;
    
    contentContainer.innerHTML = content;
    prompt.style.display = 'none';
    contentContainer.style.display = 'block';
    resultsContainer.classList.add('hidden');
    
    // Update language for dynamic content
    setLanguage(currentLang);
}

// =============================================================================
// DISCLAIMER SYSTEM
// =============================================================================

function checkDisclaimerStatus() {
    const disclaimerAccepted = localStorage.getItem('dedsec-disclaimer-accepted');
    
    if (!disclaimerAccepted) {
        // Show disclaimer after a short delay
        setTimeout(() => {
            openModal('disclaimer-modal');
        }, 1000);
    }
}

function initializeDisclaimer() {
    const acceptBtn = document.getElementById('accept-disclaimer');
    const declineBtn = document.getElementById('decline-disclaimer');
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('dedsec-disclaimer-accepted', 'true');
            closeAllModals();
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            // Redirect to a safe page or show warning
            alert('You must accept the disclaimer to use this website.');
        });
    }
}

// =============================================================================
// CERTIFICATE SYSTEM
// =============================================================================

function initializeCertificateSystem() {
    const certificateBtn = document.getElementById('certificate-btn');
    const certificateModal = document.getElementById('certificate-modal');
    const certificateForm = document.getElementById('certificate-form');
    const cancelBtn = document.getElementById('cancel-certificate');
    
    if (!certificateBtn) return;
    
    certificateBtn.addEventListener('click', function() {
        openModal('certificate-modal');
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeAllModals();
        });
    }
    
    if (certificateForm) {
        certificateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateCertificate();
        });
    }
}

function generateCertificate() {
    const fullName = document.getElementById('full-name').value.trim();
    const age = document.getElementById('age').value.trim();
    const country = document.getElementById('country').value.trim();
    const city = document.getElementById('city').value.trim();
    
    if (!fullName || !age || !country || !city) {
        alert('Please fill in all fields to generate your certificate.');
        return;
    }
    
    // Create certificate content
    const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>DedSec Project Anniversary Certificate</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #8A2BE2, #4B0082, #FF1493, #00BFFF);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .certificate {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 600px;
                    border: 10px solid gold;
                }
                .header {
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #8A2BE2;
                    font-size: 2.5em;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                }
                .header h2 {
                    color: #4B0082;
                    font-size: 1.8em;
                    margin: 10px 0;
                }
                .content {
                    margin: 30px 0;
                }
                .content p {
                    font-size: 1.2em;
                    margin: 15px 0;
                    color: #333;
                }
                .recipient {
                    font-size: 1.8em !important;
                    font-weight: bold;
                    color: #8A2BE2 !important;
                    margin: 20px 0 !important;
                }
                .details {
                    background: #f8f8f8;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    color: #666;
                }
                .signature {
                    margin-top: 40px;
                    border-top: 2px solid #8A2BE2;
                    padding-top: 20px;
                    display: inline-block;
                }
                .date {
                    color: #8A2BE2;
                    font-weight: bold;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="header">
                    <h1>🎉 OFFICIAL CERTIFICATE 🎉</h1>
                    <h2>DedSec Project 1st Anniversary</h2>
                    <p>October 20 - October 31</p>
                </div>
                <div class="content">
                    <p>This certifies that</p>
                    <p class="recipient">${fullName}</p>
                    <p>has officially participated in the</p>
                    <p><strong>DedSec Project 1st Anniversary Celebration</strong></p>
                    <div class="details">
                        <p>Age: ${age} | Location: ${city}, ${country}</p>
                    </div>
                    <p>In recognition of their support and participation in our cybersecurity community</p>
                </div>
                <div class="footer">
                    <div class="signature">
                        <p><strong>dedsec1121fk</strong></p>
                        <p>Project Creator</p>
                    </div>
                    <p class="date">Awarded on: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Create a blob and download the certificate
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DedSec-Anniversary-Certificate-${fullName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close modal and reset form
    closeAllModals();
    document.getElementById('certificate-form').reset();
    
    // Show success message
    alert('Certificate downloaded successfully! Thank you for celebrating with us!');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function copyToClipboard(button, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const textToCopy = element.textContent || element.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(function() {
        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = '#00FF00';
        button.style.color = '#000000';
        
        setTimeout(function() {
            button.textContent = originalText;
            button.style.backgroundColor = '';
            button.style.color = '';
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard');
    });
}

// Initialize disclaimer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDisclaimer();
});

// Export functions for global access
window.copyToClipboard = copyToClipboard;
window.displayUsefulInfoContent = displayUsefulInfoContent;
window.openModal = openModal;
window.closeAllModals = closeAllModals;
