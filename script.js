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
        border: 20px solid #8A2BE2;
        color: #ffffff;
        font-family: 'Orbitron', 'Arial', sans-serif;
        padding: 60px;
        text-align: center;
        box-sizing: border-box;
        z-index: 10000;
    `;

    certificateDiv.innerHTML = `
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <!-- Decorative elements -->
            <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 3px solid #8A2BE2; pointer-events: none;"></div>
            <div style="position: absolute; top: 80px; left: 80px; right: 80px; bottom: 80px; border: 2px solid #9966FF; pointer-events: none;"></div>
            
            <!-- Header -->
            <h1 style="font-size: 48px; color: #8A2BE2; margin-bottom: 20px; text-shadow: 0 0 10px rgba(138, 43, 226, 0.5);">${translations.title}</h1>
            <h2 style="font-size: 24px; color: #9966FF; margin-bottom: 60px; font-weight: 500;">${translations.subtitle}</h2>
            
            <!-- Main content -->
            <p style="font-size: 24px; margin-bottom: 40px; line-height: 1.6;">
                ${translations.certifies}<br>
                <strong style="color: #8A2BE2; font-size: 32px; display: block; margin: 20px 0;">${fullName}</strong>
                ${translations.participated}<br>
                <em style="color: #cccccc; font-size: 18px; display: block; margin-top: 20px;">${translations.event}</em>
            </p>
            
            <!-- User details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 40px 0; width: 80%;">
                <div style="text-align: left;">
                    <p><strong>${translations.issuedTo}:</strong><br>${fullName}</p>
                    <p><strong>${translations.age}:</strong><br>${age}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>${translations.location}:</strong><br>${city}, ${country}</p>
                    <p><strong>${translations.dateIssued}:</strong><br>${today}</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 60px; border-top: 2px solid #8A2BE2; padding-top: 20px; width: 80%;">
                <p style="font-size: 18px; color: #9966FF;">${translations.team}</p>
            </div>
        </div>
    `;

    return certificateDiv;
}

function showCertificateSuccess(firstName) {
    const generateCertificateBtn = document.getElementById('generate-certificate');
    const currentLanguage = localStorage.getItem('language') || 'en';
    
    if (generateCertificateBtn) {
        // Store original content
        const originalHTML = generateCertificateBtn.innerHTML;
        const originalBackground = generateCertificateBtn.style.background;
        const originalBorder = generateCertificateBtn.style.borderColor;
        const originalColor = generateCertificateBtn.style.color;
        
        // Update button to show success
        generateCertificateBtn.innerHTML = `<i class="fas fa-check"></i><span>${currentLanguage === 'gr' ? 'Λήφθηκε!' : 'Downloaded!'}</span>`;
        generateCertificateBtn.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
        generateCertificateBtn.style.borderColor = '#00ff00';
        generateCertificateBtn.style.color = '#000000';
        generateCertificateBtn.disabled = true;
        
        // Show success message
        setTimeout(() => {
            const successMessage = currentLanguage === 'gr' 
                ? `Το πιστοποιητικό για τον/την ${firstName} λήφθηκε με επιτυχία!`
                : `Certificate for ${firstName} downloaded successfully!`;
            
            alert(successMessage);
            
            // Reset button after delay
            setTimeout(() => {
                generateCertificateBtn.innerHTML = originalHTML;
                generateCertificateBtn.style.background = originalBackground;
                generateCertificateBtn.style.borderColor = originalBorder;
                generateCertificateBtn.style.color = originalColor;
                generateCertificateBtn.disabled = false;
                
                // Close modal
                closeModal('certificate-modal');
                
                // Reset form
                const certificateForm = document.getElementById('certificate-form');
                if (certificateForm) {
                    certificateForm.reset();
                }
            }, 2000);
        }, 1000);
    }
}