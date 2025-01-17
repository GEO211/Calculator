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

document.getElementById('signInForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        // Successful login - redirect or handle as needed
        window.location.href = 'index.html';
    } catch (error) {
        // Show error message
        errorMessage.style.display = 'block';
        console.error('Error:', error);
    }
});

// Add this custom confirm dialog function
function customConfirm(message, type = 'success') {
    const confirmBox = document.createElement('div');
    confirmBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: center;
        min-width: 300px;
    `;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        margin-bottom: 20px;
        color: ${type === 'success' ? '#10B981' : '#EF4444'};
        font-size: 16px;
    `;
    messageDiv.textContent = message;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 10px;
    `;

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        padding: 8px 20px;
        background: #10B981;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
    `;
    okButton.onmouseover = () => okButton.style.background = '#059669';
    okButton.onmouseout = () => okButton.style.background = '#10B981';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 8px 20px;
        background: #EF4444;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
    `;
    cancelButton.onmouseover = () => cancelButton.style.background = '#DC2626';
    cancelButton.onmouseout = () => cancelButton.style.background = '#EF4444';

    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);
    confirmBox.appendChild(messageDiv);
    confirmBox.appendChild(buttonContainer);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(confirmBox);

    return new Promise((resolve) => {
        okButton.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(confirmBox);
            resolve(true);
        };
        cancelButton.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(confirmBox);
            resolve(false);
        };
    });
}

// Update the showAlert function
async function showAlert(message, type = 'success') {
    const result = await customConfirm(message, type);
    if (result && type === 'success' && message.includes('successful')) {
        window.location.href = 'index.html';
    }
}

// Add these keyframe animations to your existing CSS
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

document.getElementById('googleSignIn').addEventListener('click', function(e) {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            alert("Google sign in successful!");
            window.location.href = 'index.html';
        }).catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

document.getElementById('facebookSignIn').addEventListener('click', function(e) {
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            alert("Facebook sign in successful!");
            window.location.href = 'index.html';
        }).catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

document.getElementById('githubSignIn').addEventListener('click', function(e) {
    e.preventDefault();
    const provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            alert("GitHub sign in successful!");
            window.location.href = 'index.html';
        }).catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
        firebase.auth().settings.appVerificationDisabledForTesting = true;
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

firebase.auth().getRedirectResult().then(() => {
}).catch((error) => {
    console.error("Error after redirect:", error);
});

// Add this function for notifications
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

    // Handle navigation after success
    if (type === 'success' && message.includes('successful')) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}