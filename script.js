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
            images.forEach(img => img.classList.remove('active'));
            images[index].classList.add('active');
            currentIndex = index;
        }
        
        function nextImage() {
            let nextIndex = (currentIndex + 1) % images.length;
            showImage(nextIndex);
        }
        
        function prevImage() {
            let prevIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(prevIndex);
        }
        
        // Auto-advance every 5 seconds
        let autoAdvance = setInterval(nextImage, 5000);
        
        // Pause auto-advance on hover
        carousel.addEventListener('mouseenter', () => clearInterval(autoAdvance));
        carousel.addEventListener('mouseleave', () => {
            autoAdvance = setInterval(nextImage, 5000);
        });
        
        // Button controls
        if (prevBtn) prevBtn.addEventListener('click', prevImage);
        if (nextBtn) nextBtn.addEventListener('click', nextImage);
        
        // Show first image
        showImage(0);
    });
}

// =============================================================================
// USEFUL INFORMATION
// =============================================================================

function initializeUsefulInformation() {
    const searchInput = document.getElementById('useful-info-search-input');
    const resultsContainer = document.getElementById('useful-info-results-container');
    const navContainer = document.getElementById('useful-information-nav');
    const contentContainer = document.getElementById('useful-information-content');
    
    if (!navContainer) return;
    
    // Useful information data structure
    const usefulInfoData = {
        "installation": {
            title: { en: "Installation Guide", gr: "Οδηγός Εγκατάστασης" },
            icon: "fas fa-download",
            content: {
                en: `<h3>Complete Installation Guide</h3>
                <p>Follow these steps to install the DedSec Project on your Android device:</p>
                <ol>
                    <li>Install Termux from F-Droid</li>
                    <li>Update packages: <code>pkg update -y && pkg upgrade -y</code></li>
                    <li>Install Git: <code>pkg install git -y</code></li>
                    <li>Clone repository: <code>git clone https://github.com/dedsec1121fk/DedSec</code></li>
                    <li>Run setup: <code>cd DedSec && bash Setup.sh</code></li>
                </ol>`,
                gr: `<h3>Πλήρης Οδηγός Εγκατάστασης</h3>
                <p>Ακολουθήστε αυτά τα βήματα για να εγκαταστήσετε το DedSec Project στη συσκευή σας Android:</p>
                <ol>
                    <li>Εγκαταστήστε το Termux από το F-Droid</li>
                    <li>Ενημερώστε τα πακέτα: <code>pkg update -y && pkg upgrade -y</code></li>
                    <li>Εγκαταστήστε το Git: <code>pkg install git -y</code></li>
                    <li>Κλωνοποιήστε το αποθετήριο: <code>git clone https://github.com/dedsec1121fk/DedSec</code></li>
                    <li>Εκτελέστε τη ρύθμιση: <code>cd DedSec && bash Setup.sh</code></li>
                </ol>`
            }
        },
        "troubleshooting": {
            title: { en: "Troubleshooting", gr: "Αντιμετώπιση Προβλημάτων" },
            icon: "fas fa-tools",
            content: {
                en: `<h3>Common Issues and Solutions</h3>
                <ul>
                    <li><strong>Termux won't start:</strong> Reinstall from F-Droid</li>
                    <li><strong>Git clone fails:</strong> Check internet connection</li>
                    <li><strong>Permission denied:</strong> Run termux-setup-storage</li>
                    <li><strong>Script not found:</strong> Ensure you're in the DedSec directory</li>
                </ul>`,
                gr: `<h3>Συχνά Προβλήματα και Λύσεις</h3>
                <ul>
                    <li><strong>Το Termux δεν ξεκινά:</strong> Επανεγκαταστήστε από το F-Droid</li>
                    <li><strong>Αποτυχία Git clone:</strong> Ελέγξτε τη σύνδεση στο διαδίκτυο</li>
                    <li><strong>Απορρίφθηκε η άδεια:</strong> Εκτελέστε termux-setup-storage</li>
                    <li><strong>Δεν βρέθηκε το σενάριο:</strong> Βεβαιωθείτε ότι βρίσκεστε στον κατάλογο DedSec</li>
                </ul>`
            }
        },
        "legal": {
            title: { en: "Legal Information", gr: "Νομικές Πληροφορίες" },
            icon: "fas fa-gavel",
            content: {
                en: `<h3>Legal Disclaimer</h3>
                <p>This project is for educational and ethical testing purposes only. You must only use these tools on systems you own or have explicit permission to test.</p>
                <p>Unauthorized access to computer systems is illegal. The developers are not responsible for any misuse of this software.</p>`,
                gr: `<h3>Νομική Αποποίηση Ευθύνης</h3>
                <p>Αυτό το έργο προορίζεται μόνο για εκπαιδευτικούς και ηθικούς σκοπούς δοκιμών. Πρέπει να χρησιμοποιείτε αυτά τα εργαλεία μόνο σε συστήματα που σας ανήκουν ή έχετε ρητή άδεια να δοκιμάσετε.</p>
                <p>Η μη εξουσιοδοτημένη πρόσβαση σε συστήματα υπολογιστών είναι παράνομη. Οι προγραμματιστές δεν φέρουν ευθύνη για οποιαδήποτε κατάχρηση αυτού του λογισμικού.</p>`
            }
        }
    };
    
    // Populate navigation
    const currentLang = localStorage.getItem('dedsec-language') || 'en';
    navContainer.innerHTML = '';
    
    Object.entries(usefulInfoData).forEach(([key, data]) => {
        const button = document.createElement('button');
        button.className = 'app-wrapper';
        button.innerHTML = `
            <div class="app-icon"><i class="${data.icon}"></i></div>
            <span class="app-label">${data.title[currentLang]}</span>
        `;
        button.addEventListener('click', () => {
            displayUsefulInfoContent(key, data);
        });
        navContainer.appendChild(button);
    });
    
    // Initialize search functionality
    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            
            if (query.length > 0) {
                const results = Object.entries(usefulInfoData)
                    .filter(([key, data]) => 
                        data.title.en.toLowerCase().includes(query) || 
                        data.title.gr.toLowerCase().includes(query) ||
                        data.content.en.toLowerCase().includes(query) ||
                        data.content.gr.toLowerCase().includes(query)
                    )
                    .map(([key, data]) => ({
                        key,
                        title: data.title[currentLang],
                        content: data.content[currentLang].replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                    }));
                
                if (results.length > 0) {
                    resultsContainer.innerHTML = results.map(result => 
                        `<div class="search-result-item" onclick="displayUsefulInfoContent('${result.key}', usefulInfoData['${result.key}'])">
                            <strong>${result.title}</strong><br>
                            <small>${result.content}</small>
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
}

function displayUsefulInfoContent(key, data) {
    const contentContainer = document.getElementById('useful-information-content');
    const prompt = document.getElementById('useful-info-prompt');
    const currentLang = localStorage.getItem('dedsec-language') || 'en';
    
    if (contentContainer && prompt) {
        contentContainer.innerHTML = data.content[currentLang];
        prompt.style.display = 'none';
        contentContainer.style.display = 'block';
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
    const fullName = document.getElementById('full-name').value;
    const age = document.getElementById('age').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    
    if (!fullName || !age || !country || !city) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create certificate content
    const certificateContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    text-align: center;
                    padding: 40px;
                    background: linear-gradient(135deg, #8A2BE2, #4B0082, #FF1493, #00BFFF);
                    color: white;
                }
                .certificate {
                    background: rgba(255, 255, 255, 0.95);
                    color: #333;
                    padding: 50px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1 {
                    color: #8A2BE2;
                    font-size: 2.5em;
                    margin-bottom: 20px;
                }
                h2 {
                    color: #4B0082;
                    font-size: 1.8em;
                    margin-bottom: 30px;
                }
                .details {
                    font-size: 1.2em;
                    margin: 20px 0;
                    text-align: left;
                    display: inline-block;
                }
                .signature {
                    margin-top: 50px;
                    border-top: 2px solid #8A2BE2;
                    padding-top: 20px;
                    display: inline-block;
                }
                .logo {
                    font-size: 3em;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="logo">🎉</div>
                <h1>Certificate of Participation</h1>
                <h2>DedSec Project 1st Anniversary</h2>
                <p>This certifies that</p>
                <h2 style="color: #8A2BE2;">${fullName}</h2>
                <p>has participated in the DedSec Project 1st Anniversary Celebration</p>
                <div class="details">
                    <p><strong>Age:</strong> ${age}</p>
                    <p><strong>Location:</strong> ${city}, ${country}</p>
                    <p><strong>Date:</strong> October 20-31, 2024</p>
                </div>
                <div class="signature">
                    <p><strong>DedSec Project Team</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Generate PDF
    generatePDF(certificateContent, `${fullName}_DedSec_Certificate.pdf`);
}

function generatePDF(htmlContent, filename) {
    // Check if jsPDF is available
    if (typeof jsPDF !== 'undefined') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add HTML content to PDF
        doc.html(htmlContent, {
            callback: function(doc) {
                doc.save(filename);
                closeAllModals();
                
                // Reset form
                document.getElementById('certificate-form').reset();
            },
            x: 10,
            y: 10,
            width: 190,
            windowWidth: 800
        });
    } else {
        // Fallback: Create a downloadable HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('.pdf', '.html');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        closeAllModals();
        document.getElementById('certificate-form').reset();
        
        alert('Certificate downloaded as HTML file (PDF generation requires internet connection)');
    }
}

// =============================================================================
// DISCLAIMER MANAGEMENT
// =============================================================================

function checkDisclaimerStatus() {
    const disclaimerAccepted = localStorage.getItem('dedsec-disclaimer-accepted');
    
    if (!disclaimerAccepted) {
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

// Initialize disclaimer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDisclaimer();
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Copy to clipboard function
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

// Image viewer functionality
function viewImage(imgElement) {
    const expandedImg = document.getElementById('expanded-img');
    const imageViewer = document.getElementById('image-viewer-modal');
    
    if (expandedImg && imageViewer) {
        expandedImg.src = imgElement.src;
        openModal('image-viewer-modal');
    }
}

// Close image viewer when clicking the image
document.addEventListener('DOMContentLoaded', function() {
    const expandedImg = document.getElementById('expanded-img');
    if (expandedImg) {
        expandedImg.addEventListener('click', function() {
            closeAllModals();
        });
    }
});

// Make functions globally available for HTML onclick attributes
window.copyToClipboard = copyToClipboard;
window.viewImage = viewImage;
window.openModal = openModal;
window.closeAllModals = closeAllModals;
window.displayUsefulInfoContent = displayUsefulInfoContent;

// Global usefulInfoData for search functionality
window.usefulInfoData = {
    "installation": {
        title: { en: "Installation Guide", gr: "Οδηγός Εγκατάστασης" },
        icon: "fas fa-download",
        content: {
            en: `<h3>Complete Installation Guide</h3>
            <p>Follow these steps to install the DedSec Project on your Android device:</p>
            <ol>
                <li>Install Termux from F-Droid</li>
                <li>Update packages: <code>pkg update -y && pkg upgrade -y</code></li>
                <li>Install Git: <code>pkg install git -y</code></li>
                <li>Clone repository: <code>git clone https://github.com/dedsec1121fk/DedSec</code></li>
                <li>Run setup: <code>cd DedSec && bash Setup.sh</code></li>
            </ol>`,
            gr: `<h3>Πλήρης Οδηγός Εγκατάστασης</h3>
            <p>Ακολουθήστε αυτά τα βήματα για να εγκαταστήσετε το DedSec Project στη συσκευή σας Android:</p>
            <ol>
                <li>Εγκαταστήστε το Termux από το F-Droid</li>
                <li>Ενημερώστε τα πακέτα: <code>pkg update -y && pkg upgrade -y</code></li>
                <li>Εγκαταστήστε το Git: <code>pkg install git -y</code></li>
                <li>Κλωνοποιήστε το αποθετήριο: <code>git clone https://github.com/dedsec1121fk/DedSec</code></li>
                <li>Εκτελέστε τη ρύθμιση: <code>cd DedSec && bash Setup.sh</code></li>
            </ol>`
        }
    },
    "troubleshooting": {
        title: { en: "Troubleshooting", gr: "Αντιμετώπιση Προβλημάτων" },
        icon: "fas fa-tools",
        content: {
            en: `<h3>Common Issues and Solutions</h3>
            <ul>
                <li><strong>Termux won't start:</strong> Reinstall from F-Droid</li>
                <li><strong>Git clone fails:</strong> Check internet connection</li>
                <li><strong>Permission denied:</strong> Run termux-setup-storage</li>
                <li><strong>Script not found:</strong> Ensure you're in the DedSec directory</li>
            </ul>`,
            gr: `<h3>Συχνά Προβλήματα και Λύσεις</h3>
            <ul>
                <li><strong>Το Termux δεν ξεκινά:</strong> Επανεγκαταστήστε από το F-Droid</li>
                <li><strong>Αποτυχία Git clone:</strong> Ελέγξτε τη σύνδεση στο διαδίκτυο</li>
                <li><strong>Απορρίφθηκε η άδεια:</strong> Εκτελέστε termux-setup-storage</li>
                <li><strong>Δεν βρέθηκε το σενάριο:</strong> Βεβαιωθείτε ότι βρίσκεστε στον κατάλογο DedSec</li>
            </ul>`
        }
    },
    "legal": {
        title: { en: "Legal Information", gr: "Νομικές Πληροφορίες" },
        icon: "fas fa-gavel",
        content: {
            en: `<h3>Legal Disclaimer</h3>
            <p>This project is for educational and ethical testing purposes only. You must only use these tools on systems you own or have explicit permission to test.</p>
            <p>Unauthorized access to computer systems is illegal. The developers are not responsible for any misuse of this software.</p>`,
            gr: `<h3>Νομική Αποποίηση Ευθύνης</h3>
            <p>Αυτό το έργο προορίζεται μόνο για εκπαιδευτικούς και ηθικούς σκοπούς δοκιμών. Πρέπει να χρησιμοποιείτε αυτά τα εργαλεία μόνο σε συστήματα που σας ανήκουν ή έχετε ρητή άδεια να δοκιμάσετε.</p>
            <p>Η μη εξουσιοδοτημένη πρόσβαση σε συστήματα υπολογιστών είναι παράνομη. Οι προγραμματιστές δεν φέρουν ευθύνη για οποιαδήποτε κατάχρηση αυτού του λογισμικού.</p>`
        }
    }
};
