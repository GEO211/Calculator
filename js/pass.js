const firebaseConfig = {
    apiKey: "AIzaSyD_8VBLWE1W-xZ90SYIrL_a7u03Cy7Z_0g",
    authDomain: "final-term-calculator.firebaseapp.com",
    projectId: "final-term-calculator",
    storageBucket: "final-term-calculator.firebasestorage.app",
    messagingSenderId: "482921437569",
    appId: "1:482921437569:web:2597a79c3968cb8a1ff080",
    measurementId: "G-TR77FH1K9R"
  };
  
firebase.initializeApp(firebaseConfig);

// Add notification function
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out forwards;
        font-weight: 500;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => alert.remove(), 300);
    }, 2700);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Update the password reset handler
document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            showAlert('Password reset email sent! Check your inbox.', 'success');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 3000);
        })
        .catch((error) => {
            showAlert(error.message, 'error');
        });
});

// Update back button handler
document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'signin.html';
});
