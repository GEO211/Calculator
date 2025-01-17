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

console.log('Calculator.js loaded');

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.getElementById('welcomeMessage').textContent = `Welcome, ${userData.username}`;
                    setTheme(userData.theme || 'light');
                } else {
                    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.email}`;
                    setTheme('light');
                }
                loadHistory();
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                document.getElementById('welcomeMessage').textContent = `Welcome, ${user.email}`;
                setTheme('light');
                loadHistory();
            });
    } else {
        window.location.href = 'signin.html';
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'signin.html';
    }).catch((error) => {
        console.error('Error signing out: ', error);
    });
});

const display = document.getElementById('display');
const buttons = document.querySelectorAll('.calc-btn');
const clearBtn = document.getElementById('clearBtn');
const backspaceBtn = document.getElementById('backspaceBtn');
const calculateBtn = document.getElementById('calculateBtn');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent;
        
        // Handle special functions
        switch(buttonText) {
            case '√x':
                display.value += '√(';
                break;
            case 'x²':
                display.value += '^2';
                break;
            case 'sin':
                display.value += 'sin(';
                break;
            case 'cos':
                display.value += 'cos(';
                break;
            case 'tan':
                display.value += 'tan(';
                break;
            default:
                display.value += buttonText;
        }
    });
});

clearBtn.addEventListener('click', () => {
    display.value = '';
});

backspaceBtn.addEventListener('click', () => {
    display.value = display.value.slice(0, -1);
});

calculateBtn.addEventListener('click', () => {
    const input = display.value.trim();
    if (!input) {
        showAlert('Please enter a calculation', 'error');
        return;
    }

    const result = evaluateExpression(input);
    if (result !== 'Error') {
        display.value = result;
        saveCalculation(input, result);
    }
});


document.getElementById('squareBtn').addEventListener('click', () => {
    const value = parseFloat(display.value.replace(/,/g, ''));
    if (!isNaN(value)) {
        const calculatedResult = value ** 2;
        const formattedResult = calculatedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        display.value = formattedResult;
        saveCalculation(`(${value})²`, formattedResult);
    }
});


document.getElementById('sqrtBtn').addEventListener('click', () => {
    const value = parseFloat(display.value.replace(/,/g, ''));
    if (!isNaN(value)) {
        const calculatedResult = Math.sqrt(value);
        const formattedResult = calculatedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        display.value = formattedResult;
        saveCalculation(`√(${value})`, formattedResult);
    }
});


['sin', 'cos', 'tan'].forEach(func => {
    document.getElementById(`${func}Btn`).addEventListener('click', () => {
        const value = parseFloat(display.value.replace(/,/g, ''));
        if (!isNaN(value)) {
            const calculatedResult = Math[func](value * (Math.PI / 180));
            const formattedResult = calculatedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            display.value = formattedResult;
            saveCalculation(`${func}(${value})`, formattedResult);
        }
    });
});

function handleKeyboardInput(event) {
    const key = event.key;
    const validKeys = /^[0-9+\-*/().π\s]$/;

    if (validKeys.test(key)) {
        event.preventDefault();
        display.value += key;
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateBtn.click();
    } else if (key === 'Backspace') {
        event.preventDefault();
        backspaceBtn.click();
    } else if (key === 'Escape') {
        event.preventDefault();
        clearBtn.click();
    } else if (key === '^') {
        event.preventDefault();
        display.value += '^';
    }
}

document.addEventListener('keydown', handleKeyboardInput);

function saveCalculation(inputValue, output) {
    if (currentUser) {
        db.collection('calculations').add({
            userId: currentUser.uid,
            input: inputValue,
            output: output,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            loadHistory();
        }).catch((error) => {
            console.error('Error saving calculation: ', error);
        });
    }
}

async function loadHistory() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('calculations')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const historyTableBody = document.getElementById('historyTableBody');
        historyTableBody.innerHTML = '';

        snapshot.forEach((doc, index) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', doc.id);
            tr.style.opacity = '0';
            tr.style.animation = `slideInDown 0.3s ease-out ${index * 0.1}s forwards`;
            
            const date = data.timestamp ? data.timestamp.toDate() : new Date();
            const formattedDate = date.toLocaleString();

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${data.input}</td>
                <td>${data.output}</td>
                <td>
                    <button onclick="deleteCalculation('${doc.id}')" 
                            class="delete-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading history:', error);
        showAlert('Error loading history', 'error');
    }
}

function deleteCalculation(calculationId) {
    if (currentUser) {
        // Show confirmation dialog with custom styling
        const confirmDelete = confirm('Are you sure you want to delete this calculation?');
        
        if (confirmDelete) {
            const row = document.querySelector(`tr[data-id="${calculationId}"]`);
            if (row) {
                // Add fade out animation
                row.style.animation = 'fadeOut 0.3s ease-out forwards';
                
                // Wait for animation to complete before removing
                setTimeout(() => {
                    db.collection('calculations').doc(calculationId).delete()
                        .then(() => {
                            showAlert('Calculation deleted successfully!', 'success');
                            loadHistory();
                        })
                        .catch((error) => {
                            console.error('Error deleting calculation:', error);
                            showAlert('Error deleting calculation', 'error');
                        });
                }, 300);
            }
        }
    }
}

function addCalculation(input, output) {
    if (!currentUser) return;

    db.collection('calculations').add({
        userId: currentUser.uid,
        input: input,
        output: output,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Reload history with animation
        loadHistory();
    })
    .catch(error => {
        console.error('Error adding calculation:', error);
        showAlert('Error saving calculation', 'error');
    });
}

function setTheme(theme) {
    // Set theme at document level
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('html').setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Apply theme classes to body and container
    const body = document.body;
    const container = document.querySelector('.container');
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
        container.classList.add('dark-theme');
        container.classList.remove('light-theme');
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        container.classList.add('light-theme');
        container.classList.remove('dark-theme');
    }

    // Add transitions
    const elements = document.querySelectorAll('.container, .calculator, .history, .calc-btn, #display');
    elements.forEach(element => {
        element.style.transition = 'all 0.3s ease';
    });
}

// Make sure theme is applied on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Check user preferences from database
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        if (userData.theme) {
                            setTheme(userData.theme);
                        }
                    }
                })
                .catch(error => console.error('Error loading theme:', error));
        }
    });
});

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
        min-width: 200px;
        text-align: center;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => alert.remove(), 300);
    }, 2700);
}

function evaluateExpression(expression) {
    try {
        // Clean and prepare the expression
        let cleanExpression = expression.trim();

        // Handle implicit multiplication
        cleanExpression = cleanExpression
            .replace(/(\d+|\))\(/g, '$1*(')           // 5(2) → 5*(2)
            .replace(/\)(\d+)/g, ')*$1')              // )2 → )*2
            .replace(/(\d+|\))([a-zπ])/gi, '$1*$2')   // 2sin → 2*sin, 2π → 2*π
            .replace(/π/g, 'Math.PI')                 // Replace π with Math.PI
            .replace(/(\d+)\s*\(/g, '$1*(');          // Handle spaces: 5 (2) → 5*(2)

        // Replace trig functions (must be done after implicit multiplication)
        cleanExpression = cleanExpression
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**');

        // Basic validation
        if (!isValidExpression(cleanExpression)) {
            throw new Error('Invalid expression');
        }

        // Evaluate
        const result = Function('"use strict";return (' + cleanExpression + ')')();

        // Check result validity
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid result');
        }

        // Format result
        return Number(result.toFixed(8)).toString();
    } catch (error) {
        console.error('Calculation error:', error, 'Expression:', expression);
        showAlert('Invalid input', 'error');
        return 'Error';
    }
}

function isValidExpression(expression) {
    // Basic validation
    if (!expression || typeof expression !== 'string') {
        return false;
    }

    // Check for balanced parentheses
    let parentheses = 0;
    for (let char of expression) {
        if (char === '(') parentheses++;
        if (char === ')') parentheses--;
        if (parentheses < 0) return false;
    }
    if (parentheses !== 0) return false;

    // Check for invalid sequences
    if (/[+\-*/]{2,}/.test(expression)) return false;

    // Check for valid mathematical expression
    try {
        Function('"use strict";return (' + expression + ')');
        return true;
    } catch {
        return false;
    }
}

// Add these helper functions for scientific calculations
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}
