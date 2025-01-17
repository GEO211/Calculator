// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_8VBLWE1W-xZ90SYIrL_a7u03Cy7Z_0g",
    authDomain: "final-term-calculator.firebaseapp.com",
    projectId: "final-term-calculator",
    storageBucket: "final-term-calculator.firebasestorage.app",
    messagingSenderId: "482921437569",
    appId: "1:482921437569:web:2597a79c3968cb8a1ff080",
    measurementId: "G-TR77FH1K9R"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

// Load user settings
async function loadUserSettings() {
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            const userData = doc.data();
            
            // Set form values
            document.getElementById('username').value = userData.username || '';
            document.getElementById('email').value = currentUser.email || '';
            
        } else {
            // Handle new users
            document.getElementById('email').value = currentUser.email || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showAlert('Error loading settings: ' + error.message, 'error');
    }
}

// Tab switching functionality
document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
        // First fade out current section
        const currentSection = document.querySelector('.section-content.active');
        if (currentSection) {
            currentSection.style.opacity = '0';
            currentSection.style.transform = 'translateY(10px)';
        }

        // Remove active classes
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked card
        card.classList.add('active');

        // After a small delay, show the selected section
        setTimeout(() => {
            const sectionId = card.dataset.section + 'Section';
            const targetSection = document.getElementById(sectionId);
            targetSection.classList.add('active');
            
            // Use requestAnimationFrame for smooth animation
            requestAnimationFrame(() => {
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            });
        }, 300);
    });
});

// Form submissions
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const username = document.getElementById('username').value;
        
        await db.collection('users').doc(currentUser.uid).update({
            username: username,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitButton.disabled = false;
    }
});

document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        await currentUser.reauthenticateWithCredential(credential);
        await currentUser.updatePassword(newPassword);

        showAlert('Password updated successfully!', 'success');
        e.target.reset();
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        submitButton.disabled = false;
    }
});

// Alert Function
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        z-index: 1001;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Back button functionality
document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        loadUserSettings();
    } else {
        window.location.href = 'signin.html';
    }
});

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add animation class to container after a small delay
    setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
    }, 100);

    // Add smooth transitions for section changes
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            // First fade out all sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(10px)';
            });

            // Remove active classes
            document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked card
            card.classList.add('active');

            // After a small delay, show the selected section
            setTimeout(() => {
                const sectionId = card.dataset.section + 'Section';
                const targetSection = document.getElementById(sectionId);
                targetSection.classList.add('active');
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 300);
        });
    });
}); 