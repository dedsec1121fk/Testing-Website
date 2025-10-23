// useful-info.js - Useful Information page functionality
document.addEventListener('DOMContentLoaded', () => {
    let usefulInfoSearchIndex = [];
    let usefulInfoFiles = [];
    let isUsefulInfoIndexBuilt = false;
    let usefulInformationLoaded = false;
    let isFetchingUsefulInfo = false;

    // Initialize the search functionality
    initializeUsefulInfoSearch();

    async function fetchUsefulInformation() {
        if (usefulInformationLoaded || isFetchingUsefulInfo) return;
        isFetchingUsefulInfo = true;
        
        const navContainer = document.getElementById('useful-information-nav');
        const GITHUB_API_URL = 'https://api.github.com/repos/dedsec1121fk/dedsec1121fk.github.io/contents/Useful_Information';
        
        navContainer.innerHTML = `<div class="loading-message">${getCurrentLanguage() === 'gr' ? 'Φόρτωση...' : 'Loading...'}</div>`;
        
        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const files = await response.json();
            usefulInfoFiles = files.filter(file => file.type === 'file' && file.name.endsWith('.html'));
            
            navContainer.innerHTML = '';
            
            if (usefulInfoFiles.length === 0) {
                navContainer.innerHTML = `<p>${getCurrentLanguage() === 'gr' ? 'Δεν βρέθηκαν άρθρα.' : 'No articles found.'}</p>`;
                return;
            }
            
            // Create article cards
            usefulInfoFiles.forEach(file => {
                let titleEN = file.name.replace(/\.html$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');
                let titleGR = titleEN;

                const titleRegex = /(.+?)_\((.+?)\)/;
                const match = file.name.match(titleRegex);

                if (match && match[1] && match[2]) {
                    titleEN = match[1].replace(/_/g, ' ').trim();
                    titleGR = match[2].replace(/_/g, ' ').trim();
                }

                const articleCard = document.createElement('div');
                articleCard.className = 'article-card';
                articleCard.dataset.url = file.download_url;
                
                const currentLang = getCurrentLanguage();
                const displayTitle = currentLang === 'gr' ? titleGR : titleEN;
                
                articleCard.innerHTML = `
                    <i class="fas fa-file-alt"></i>
                    <h3>${displayTitle}</h3>
                    <p>${getCurrentLanguage() === 'gr' ? 'Κάντε κλικ για να διαβάσετε το άρθρο' : 'Click to read the article'}</p>
                `;
                
                articleCard.addEventListener('click', () => {
                    loadInformationContent(file.download_url, displayTitle);
                });
                
                navContainer.appendChild(articleCard);
            });
            
            usefulInformationLoaded = true;
        } catch (error) {
            console.error('Failed to fetch useful information:', error);
            navContainer.innerHTML = `<p style="color: var(--nm-danger);">${getCurrentLanguage() === 'gr' ? 'Αποτυχία φόρτωσης άρθρων.' : 'Failed to load articles.'}</p>`;
        } finally {
            isFetchingUsefulInfo = false;
        }
    }

    function initializeUsefulInfoSearch() {
        const searchInput = document.getElementById('useful-info-search-input');
        const resultsContainer = document.getElementById('useful-info-results-container');
        const navContainer = document.getElementById('useful-information-nav');
        
        if (!searchInput || !resultsContainer || !navContainer) return;

        // Fetch articles on page load
        fetchUsefulInformation();

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            resultsContainer.innerHTML = '';

            if (query.length < 2) {
                resultsContainer.classList.add('hidden');
                // Show all articles
                navContainer.querySelectorAll('.article-card').forEach(card => {
                    card.style.display = 'block';
                });
                return;
            }

            // Simple client-side search (for demo purposes)
            // In a real implementation, you would use the search index
            const searchTerm = query.toLowerCase();
            let hasResults = false;

            navContainer.querySelectorAll('.article-card').forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    card.style.display = 'block';
                    hasResults = true;
                } else {
                    card.style.display = 'none';
                }
            });

            if (!hasResults) {
                resultsContainer.innerHTML = `<div class="no-results">${getCurrentLanguage() === 'gr' ? 'Δεν βρέθηκαν αποτελέσματα' : 'No results found'}</div>`;
                resultsContainer.classList.remove('hidden');
            } else {
                resultsContainer.classList.add('hidden');
            }
        });

        // Clear search when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.classList.add('hidden');
            }
        });
    }

    async function loadInformationContent(url, title) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            const htmlContent = await response.text();
            
            // Extract the main content from the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            
            const articleContent = tempDiv.querySelector('.modal-body') || tempDiv;
            
            createAndShowArticleModal(title, articleContent.innerHTML);
        } catch (error) {
            console.error('Failed to load content:', error);
            alert(getCurrentLanguage() === 'gr' ? 'Αποτυχία φόρτωσης περιεχομένου' : 'Failed to load content');
        }
    }

    function createAndShowArticleModal(title, htmlContent) {
        const modalOverlay = document.getElementById('article-modal');
        const modalTitle = document.getElementById('article-modal-title');
        const modalContent = document.getElementById('article-modal-content');
        
        if (!modalOverlay || !modalTitle || !modalContent) return;

        modalTitle.textContent = title;
        modalContent.innerHTML = htmlContent;

        // Update language for the modal content
        changeLanguage(getCurrentLanguage());

        // Show the modal
        showModal(modalOverlay);

        // Close modal functionality
        const closeModal = () => {
            hideModal(modalOverlay);
        };

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        modalOverlay.querySelector('.close-modal').addEventListener('click', closeModal);

        // Add copy functionality to code blocks in the modal
        setTimeout(() => {
            const codeContainers = modalContent.querySelectorAll('.code-container');
            codeContainers.forEach(container => {
                const copyBtn = container.querySelector('.copy-btn');
                const codeEl = container.querySelector('code');
                
                if (copyBtn && codeEl) {
                    if (!codeEl.id) {
                        codeEl.id = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    }
                    
                    copyBtn.addEventListener('click', () => {
                        copyToClipboard(copyBtn, codeEl.id);
                    });
                }
            });
        }, 100);
    }

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    // Add some sample articles if no GitHub content is available
    function createSampleArticles() {
        const navContainer = document.getElementById('useful-information-nav');
        
        const sampleArticles = [
            {
                icon: 'fa-shield-alt',
                titleEN: 'Introduction to Cybersecurity',
                titleGR: 'Εισαγωγή στην Κυβερνοασφάλεια',
                descriptionEN: 'Learn the basics of cybersecurity and why it matters',
                descriptionGR: 'Μάθετε τα βασικά της κυβερνοασφάλειας και γιατί είναι σημαντική'
            },
            {
                icon: 'fa-lock',
                titleEN: 'Password Security Best Practices',
                titleGR: 'Καλές Πρακτικές Ασφαλείας Κωδικών',
                descriptionEN: 'How to create and manage secure passwords',
                descriptionGR: 'Πώς να δημιουργήσετε και να διαχειριστείτε ασφαλείς κωδικούς'
            },
            {
                icon: 'fa-network-wired',
                titleEN: 'Network Security Fundamentals',
                titleGR: 'Βασικές Αρχές Ασφαλείας Δικτύου',
                descriptionEN: 'Understanding network vulnerabilities and protection',
                descriptionGR: 'Κατανόηση των ευπαθειών δικτύου και της προστασίας'
            }
        ];

        sampleArticles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            
            const currentLang = getCurrentLanguage();
            const displayTitle = currentLang === 'gr' ? article.titleGR : article.titleEN;
            const displayDesc = currentLang === 'gr' ? article.descriptionGR : article.descriptionEN;
            
            articleCard.innerHTML = `
                <i class="fas ${article.icon}"></i>
                <h3>${displayTitle}</h3>
                <p>${displayDesc}</p>
            `;
            
            articleCard.addEventListener('click', () => {
                // For sample articles, show a placeholder message
                const sampleContent = `
                    <div class="note">
                        <p>${currentLang === 'gr' ? 'Αυτό είναι ένα δείγμα άρθρου. Στην πραγματική εφαρμογή, εδώ θα εμφανίζεται το πραγματικό περιεχόμενο του άρθρου.' : 'This is a sample article. In the real application, actual article content would appear here.'}</p>
                    </div>
                    <h3>${displayTitle}</h3>
                    <p>${displayDesc}</p>
                    <p>${currentLang === 'gr' ? 'Το πλήρες περιεχόμενο θα φορτώνεται από το GitHub repository όταν είναι διαθέσιμο.' : 'Full content would load from GitHub repository when available.'}</p>
                `;
                createAndShowArticleModal(displayTitle, sampleContent);
            });
            
            navContainer.appendChild(articleCard);
        });
    }

    // If no articles are loaded after a timeout, show sample articles
    setTimeout(() => {
        const navContainer = document.getElementById('useful-information-nav');
        if (navContainer.children.length === 0 || (navContainer.children.length === 1 && navContainer.querySelector('.loading-message'))) {
            createSampleArticles();
        }
    }, 3000);
});