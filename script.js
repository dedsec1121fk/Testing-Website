// Main JavaScript for DedSec Project

// Global variables
let currentLanguage = 'en';
let currentTheme = 'dark';

// Language translations
const translations = {
    en: {
        // Navigation
        'nav-home': 'Home',
        'nav-useful-info': 'Useful Information',
        'nav-collaboration': 'Collaboration',
        'nav-contact': 'Contact',
        'nav-credits': 'Credits',
        'theme-toggle': 'Toggle Theme',
        'lang-switch': 'Switch Language',
        
        // Home page
        'title': 'DedSec',
        'search-placeholder': 'Search...',
        'anniversary-title': '🎉 1 Year Anniversary!',
        'anniversary-text': 'Celebrating one year of innovation and collaboration. Thank you for being part of our journey!',
        'certificate-button': '🎓 Get Your Certificate',
        'hero-text': 'Welcome to the ultimate hub for cybersecurity enthusiasts, developers, and innovators. Explore tools, resources, and collaborative opportunities.',
        'footer-text': '© 2024 DedSec Project. All rights reserved.',
        
        // Certificate modal
        'certificate-title': '🎓 Anniversary Certificate',
        'certificate-name-label': 'Your Name',
        'certificate-name-placeholder': 'Enter your full name',
        'certificate-date-label': 'Achievement Date',
        'certificate-generate': 'Generate Certificate',
        'certificate-disclaimer': 'This is a commemorative certificate for our 1-year anniversary celebration.',
        
        // Useful Information page
        'useful-info-title': 'Useful Information',
        'useful-info-search-placeholder': 'Search information...',
        'useful-info-nav-articles': '📚 Articles & Guides',
        'useful-info-nav-tools': '🛠️ Tools & Resources',
        'useful-info-nav-tips': '💡 Tips & Tricks',
        
        // Collaboration page
        'collaboration-title': 'Collaboration',
        'collaboration-subtitle': 'Join our mission to innovate and secure the digital world',
        'collaboration-features': 'Why Collaborate With Us?',
        'feature-community': 'Global Community',
        'feature-community-desc': 'Connect with cybersecurity enthusiasts worldwide',
        'feature-projects': 'Innovative Projects',
        'feature-projects-desc': 'Work on cutting-edge security tools and solutions',
        'feature-learning': 'Continuous Learning',
        'feature-learning-desc': 'Grow your skills through hands-on collaboration',
        'feature-impact': 'Real Impact',
        'feature-impact-desc': 'Your contributions make a difference in digital security',
        
        // Contact page
        'contact-title': 'Contact',
        'contact-subtitle': 'Get in touch with us through various platforms',
        'contact-telegram': 'Telegram',
        'contact-email': 'Email',
        'contact-github': 'GitHub',
        'contact-discord': 'Discord',
        
        // Credits page
        'credits-title': 'Credits & Acknowledgments',
        'credits-subtitle': 'Special thanks to all who contributed to this project',
        'credit-development': 'Project Development',
        'credit-design': 'UI/UX Design',
        'credit-content': 'Content Creation',
        'credit-support': 'Community Support'
    },
    gr: {
        // Navigation
        'nav-home': 'Αρχική',
        'nav-useful-info': 'Χρήσιμες Πληροφορίες',
        'nav-collaboration': 'Συνεργασία',
        'nav-contact': 'Επικοινωνία',
        'nav-credits': 'Εύσημα',
        'theme-toggle': 'Αλλαγή Θέματος',
        'lang-switch': 'Αλλαγή Γλώσσας',
        
        // Home page
        'title': 'DedSec',
        'search-placeholder': 'Αναζήτηση...',
        'anniversary-title': '🎉 1 Χρόνο Επέτειος!',
        'anniversary-text': 'Γιορτάζουμε ένα χρόνο καινοτομίας και συνεργασίας. Ευχαριστούμε που είστε μέρος του ταξιδιού μας!',
        'certificate-button': '🎓 Λάβετε το Πιστοποιητικό Σας',
        'hero-text': 'Καλώς ήλθατε στο απόλυτο κέντρο για λάτρεις της κυβερνασφάλειας, προγραμματιστές και καινοτόμους. Εξερευνήστε εργαλεία, πόρους και ευκαιρίες συνεργασίας.',
        'footer-text': '© 2024 DedSec Project. Με επιφύλαξη παντός δικαιώματος.',
        
        // Certificate modal
        'certificate-title': '🎓 Πιστοποιητικό Επετείου',
        'certificate-name-label': 'Το Όνομα σας',
        'certificate-name-placeholder': 'Εισάγετε το πλήρες όνομά σας',
        'certificate-date-label': 'Ημερομηνία Επιτεύγματος',
        'certificate-generate': 'Δημιουργία Πιστοποιητικού',
        'certificate-disclaimer': 'Αυτό είναι ένα αναμνηστικό πιστοποιητικό για την επέτειο του 1 έτους μας.',
        
        // Useful Information page
        'useful-info-title': 'Χρήσιμες Πληροφορίες',
        'useful-info-search-placeholder': 'Αναζήτηση πληροφοριών...',
        'useful-info-nav-articles': '📚 Άρθρα & Οδηγοί',
        'useful-info-nav-tools': '🛠️ Εργαλεία & Πόροι',
        'useful-info-nav-tips': '💡 Συμβουλές & Τρικ',
        
        // Collaboration page
        'collaboration-title': 'Συνεργασία',
        'collaboration-subtitle': 'Συμμετέχετε στην αποστολή μας να καινοτομήσουμε και να ασφαλίσουμε τον ψηφιακό κόσμο',
        'collaboration-features': 'Γιατί να Συνεργαστείτε Μαζί Μας;',
        'feature-community': 'Παγκόσμια Κοινότητα',
        'feature-community-desc': 'Συνδεθείτε με λάτρεις της κυβερνασφάλειας παγκοσμίως',
        'feature-projects': 'Καινοτόμα Projects',
        'feature-projects-desc': 'Δουλέψτε σε προηγμένα εργαλεία και λύσεις ασφαλείας',
        'feature-learning': 'Συνεχής Μάθηση',
        'feature-learning-desc': 'Αναπτύξτε τις δεξιότητές σας μέσω πρακτικής συνεργασίας',
        'feature-impact': 'Πραγματική Επίδραση',
        'feature-impact-desc': 'Οι συνεισφορές σας κάνουν τη διαφορά στην ψηφιακή ασφάλεια',
        
        // Contact page
        'contact-title': 'Επικοινωνία',
        'contact-subtitle': 'Επικοινωνήστε μαζί μας μέσω διαφόρων πλατφορμών',
        'contact-telegram': 'Telegram',
        'contact-email': 'Email',
        'contact-github': 'GitHub',
        'contact-discord': 'Discord',
        
        // Credits page
        'credits-title': 'Εύσημα & Αναγνωρίσεις',
        'credits-subtitle': 'Ιδιαίτερες ευχαριστίες σε όλους όσους συνέβαλαν σε αυτό το project',
        'credit-development': 'Ανάπτυξη Project',
        'credit-design': 'Σχεδιασμός UI/UX',
        'credit-content': 'Δημιουργία Περιεχομένου',
        'credit-support': 'Υποστήριξη Κοινότητας'
    }
};

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.classList.toggle('light-theme', savedTheme === 'light');
    }
    updateThemeToggleText();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', currentTheme === 'light');
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleText();
}

function updateThemeToggleText() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        const themeText = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        themeToggleBtn.innerHTML = `<i class="fas ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i> ${themeText}`;
    }
}

// Language management
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    }
    updateLanguageToggleText();
    applyTranslations();
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'gr' : 'en';
    localStorage.setItem('language', currentLanguage);
    updateLanguageToggleText();
    applyTranslations();
}

function updateLanguageToggleText() {
    const langToggleBtn = document.getElementById('lang-switcher-btn');
    if (langToggleBtn) {
        const langText = currentLanguage === 'en' ? '🇬🇷 Ελληνικά' : '🇺🇸 English';
        langToggleBtn.innerHTML = `<i class="fas fa-globe"></i> ${langText}`;
    }
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
}

// Navigation and burger menu
function initializeBurgerMenu() {
    const burgerIcon = document.querySelector('.burger-icon');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');

    if (burgerIcon && navMenu) {
        burgerIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            if (navOverlay) {
                navOverlay.classList.toggle('active');
            }
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', function() {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
                this.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close menu when clicking on a nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !burgerIcon.contains(e.target)) {
                burgerIcon.classList.remove('active');
                navMenu.classList.remove('active');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    }
}

// Modal management
function initializeModals() {
    // Certificate modal
    const certificateBtn = document.getElementById('certificate-btn');
    const certificateModal = document.getElementById('certificate-modal');
    const closeCertificateModal = certificateModal?.querySelector('.close-modal');

    if (certificateBtn && certificateModal) {
        certificateBtn.addEventListener('click', () => {
            certificateModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });

        closeCertificateModal?.addEventListener('click', () => {
            certificateModal.classList.remove('visible');
            document.body.style.overflow = '';
        });

        certificateModal.addEventListener('click', (e) => {
            if (e.target === certificateModal) {
                certificateModal.classList.remove('visible');
                document.body.style.overflow = '';
            }
        });
    }

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const visibleModal = document.querySelector('.modal-overlay.visible');
            if (visibleModal) {
                visibleModal.classList.remove('visible');
                document.body.style.overflow = '';
            }
        }
    });
}

// Search functionality
function initializeSearch() {
    const mainSearchInput = document.getElementById('main-search-input');
    const mainSearchResults = document.getElementById('search-suggestions-container');
    
    const usefulInfoSearchInput = document.getElementById('useful-info-search-input');
    const usefulInfoSearchResults = document.getElementById('useful-info-results-container');

    // Sample search data - you can expand this
    const searchData = [
        { title: 'Cybersecurity Basics', category: 'Articles', page: 'useful-info.html' },
        { title: 'Network Security', category: 'Articles', page: 'useful-info.html' },
        { title: 'Encryption Tools', category: 'Tools', page: 'useful-info.html' },
        { title: 'VPN Setup Guide', category: 'Guides', page: 'useful-info.html' },
        { title: 'Collaboration Projects', category: 'Collaboration', page: 'collaboration.html' },
        { title: 'Contact Information', category: 'Contact', page: 'contact.html' },
        { title: 'Project Credits', category: 'Credits', page: 'credits.html' }
    ];

    function performSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        const filteredResults = searchData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

        displayResults(filteredResults, resultsContainer, query);
    }

    function displayResults(results, container, query) {
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.style.display = 'none';
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                ${result.title}
                <small>${result.category}</small>
            `;
            resultItem.addEventListener('click', () => {
                window.location.href = result.page;
            });
            container.appendChild(resultItem);
        });

        container.style.display = 'block';
    }

    // Main search functionality
    if (mainSearchInput && mainSearchResults) {
        mainSearchInput.addEventListener('input', (e) => {
            performSearch(e.target.value, mainSearchResults);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainSearchInput.contains(e.target) && !mainSearchResults.contains(e.target)) {
                mainSearchResults.style.display = 'none';
            }
        });
    }

    // Useful information search functionality
    if (usefulInfoSearchInput && usefulInfoSearchResults) {
        usefulInfoSearchInput.addEventListener('input', (e) => {
            performSearch(e.target.value, usefulInfoSearchResults);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!usefulInfoSearchInput.contains(e.target) && !usefulInfoSearchResults.contains(e.target)) {
                usefulInfoSearchResults.style.display = 'none';
            }
        });
    }
}

// Certificate generation
function initializeCertificateGenerator() {
    const generateBtn = document.getElementById('generate-certificate');
    const nameInput = document.getElementById('certificate-name');
    const dateInput = document.getElementById('certificate-date');

    if (generateBtn) {
        // Set default date to today
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }

        generateBtn.addEventListener('click', () => {
            const name = nameInput?.value.trim();
            const date = dateInput?.value;

            if (!name) {
                alert('Please enter your name');
                return;
            }

            generateCertificate(name, date);
        });
    }
}

function generateCertificate(name, date) {
    // Create certificate image (simplified version)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Draw certificate background
    ctx.fillStyle = '#0B121C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#9966FF';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Add title
    ctx.fillStyle = '#9966FF';
    ctx.font = 'bold 40px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', canvas.width / 2, 100);
    
    // Add name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px Roboto Mono';
    ctx.fillText(`This certificate is proudly presented to`, canvas.width / 2, 200);
    ctx.fillStyle = '#9966FF';
    ctx.font = 'bold 36px Orbitron';
    ctx.fillText(name, canvas.width / 2, 250);
    
    // Add date
    ctx.fillStyle = '#7A8899';
    ctx.font = '20px Roboto Mono';
    ctx.fillText(`Date: ${date}`, canvas.width / 2, 350);
    
    // Add footer
    ctx.fillStyle = '#9966FF';
    ctx.font = 'italic 18px Roboto Mono';
    ctx.fillText('In recognition of your dedication and contribution', canvas.width / 2, 450);
    ctx.fillText('to the DedSec Project - 1 Year Anniversary', canvas.width / 2, 480);
    
    // Convert to image and download
    const link = document.createElement('a');
    link.download = `DedSec-Certificate-${name}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Progress bar functionality
function initializeProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-bar-text');
    const progressContainer = document.querySelector('.progress-bar-container');

    if (progressBar && progressText) {
        // Simulate progress (you can replace this with actual progress tracking)
        let progress = 0;
        progressContainer.style.display = 'block';

        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% Complete`;
        }, 200);
    }
}

// Copy to clipboard functionality
function initializeCopyButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
            const codeContainer = e.target.closest('.code-container');
            const code = codeContainer?.querySelector('code');
            
            if (code) {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    const originalText = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    e.target.style.background = '#00FF00';
                    e.target.style.color = '#000000';
                    
                    setTimeout(() => {
                        e.target.textContent = originalText;
                        e.target.style.background = '';
                        e.target.style.color = '';
                    }, 2000);
                });
            }
        }
    });
}

// Page-specific initializations
function initializePageSpecificFeatures() {
    const currentPage = document.body.getAttribute('data-page');
    
    switch(currentPage) {
        case 'useful-info':
            initializeProgressBar();
            break;
        case 'collaboration':
            // Collaboration page specific initializations
            break;
        case 'contact':
            // Contact page specific initializations
            break;
        case 'credits':
            // Credits page specific initializations
            break;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeLanguage();
    initializeBurgerMenu();
    initializeModals();
    initializeSearch();
    initializeCertificateGenerator();
    initializeCopyButtons();
    initializePageSpecificFeatures();

    // Add event listeners for theme and language toggles
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const langToggleBtn = document.getElementById('lang-switcher-btn');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', toggleLanguage);
    }

    console.log('DedSec Project initialized successfully!');
});

// Utility function for smooth scrolling
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}