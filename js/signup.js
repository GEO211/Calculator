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

const auth = firebase.auth();
const db = firebase.firestore();

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

    // Handle navigation after success
    if (type === 'success' && message.includes('successful')) {
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showAlert("Passwords do not match!", "error");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                username: username,
                email: email
            });
        })
        .then(() => {
            showAlert('Account created successfully!', 'success');
        })
        .catch((error) => {
            showAlert(error.message, 'error');
        });
});

var modal = document.getElementById("termsModal");
var btn = document.getElementById("openModal");
var span = document.getElementById("closeModal");

btn.onclick = function(event) {
    event.preventDefault();
    modal.classList.add("show");
    modal.style.display = "block"; 
    setTimeout(() => {
        modal.style.opacity = 1; 
    }, 10);
}

span.onclick = function() {
    modal.style.opacity = 0; 
    setTimeout(() => {
        modal.classList.remove("show");
        modal.style.display = "none"; 
    }, 400); 
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.opacity = 0;
        setTimeout(() => {
            modal.classList.remove("show");
            modal.style.display = "none"; 
        }, 400);
    }
}

document.getElementById('googleSignUp').addEventListener('click', function(e) {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            showAlert('Google sign up successful!', 'success');
        }).catch((error) => {
            showAlert(error.message, 'error');
        });
});

document.getElementById('facebookSignUp').addEventListener('click', function(e) {
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            showAlert('Facebook sign up successful!', 'success');
        }).catch((error) => {
            showAlert(error.message, 'error');
        });
});

document.getElementById('githubSignUp').addEventListener('click', function(e) {
    e.preventDefault();
    const provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            showAlert('GitHub sign up successful!', 'success');
        }).catch((error) => {
            showAlert(error.message, 'error');
        });
});
