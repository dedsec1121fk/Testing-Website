// Main JavaScript for index.html
document.addEventListener('DOMContentLoaded', function() {
    // Initialize certificate functionality
    initializeCertificateFeature();
    
    // Initialize search
    initializeSearch();
    
    // Initialize modals
    initializeModals();
});

// Certificate functionality
function initializeCertificateFeature() {
    const certificateBtn = document.querySelector('.certificate-btn');
    const generateCertificateBtn = document.getElementById('generate-certificate');
    const certificateForm = document.getElementById('certificate-form');
    const certificateModal = document.getElementById('certificate-modal');
    
    if (certificateBtn) {
        certificateBtn.addEventListener('click', () => {
            openModal('certificate-modal');
        });
    }

    if (generateCertificateBtn && certificateForm) {
        // Set initial button color
        generateCertificateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
        generateCertificateBtn.style.borderColor = 'var(--nm-accent)';
        generateCertificateBtn.style.color = '#000000';

        // Add mouse listeners
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
}

function generateCertificate() {
    const form = document.getElementById('certificate-form');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Check libraries
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        console.error("CRITICAL: jsPDF library not found.");
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

    // Generate PDF
    generateCertificateWithCanvas(firstName, lastName, age, country, city);
}

function generateCertificateWithCanvas(firstName, lastName, age, country, city) {
    try {
        // Create temporary certificate element
        const tempCertificate = createCertificateHTML(firstName, lastName, age, country, city);
        document.body.appendChild(tempCertificate);

        // Use html2canvas to capture the certificate as an image
        html2canvas(tempCertificate, {
            scale: 2,
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
            
            // Add image to PDF
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
    
    generateBtn.innerHTML = `
        <i class="fas fa-check"></i>
        <span data-en="Certificate Downloaded!" data-gr="Το Πιστοποιητικό Λήφθηκε!">Certificate Downloaded!</span>
    `;
    
    generateBtn.style.background = '#FFFFFF';
    generateBtn.style.borderColor = 'var(--nm-accent)';
    generateBtn.style.color = 'var(--nm-accent)';
    
    // Update language for success message
    const currentLanguage = localStorage.getItem('language') || 'en';
    changeLanguage(currentLanguage);
    
    setTimeout(() => {
        generateBtn.innerHTML = originalHTML;
        generateBtn.style.background = 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-hover))';
        generateBtn.style.borderColor = 'var(--nm-accent)';
        generateBtn.style.color = '#000000';
        changeLanguage(currentLanguage);
    }, 3000);
}