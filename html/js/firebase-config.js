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

let currentUser = null;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.getElementById('welcomeMessage').textContent = `Welcome, ${userData.username}`;
                } else {
                    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.email}`;
                }
                loadHistory();
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                document.getElementById('welcomeMessage').textContent = `Welcome, ${user.email}`;
                loadHistory();
            });
    } else {
        window.location.href = 'landingpage.html';
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
        display.value += button.textContent;
    });
});

clearBtn.addEventListener('click', () => {
    display.value = '';
});

backspaceBtn.addEventListener('click', () => {
    display.value = display.value.slice(0, -1);
});

calculateBtn.addEventListener('click', () => {
    try {
        const sanitizedInput = display.value.replace(/[^0-9+\-*/().]/g, '');
        const calculatedResult = eval(sanitizedInput);
        
        if (!isNaN(calculatedResult)) {
            const formattedResult = calculatedResult.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            display.value = formattedResult;
            saveCalculation(sanitizedInput, formattedResult);
        } else {
            display.value = 'Error';
        }
    } catch (error) {
        display.value = 'Error';
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

    if (/[0-9]/.test(key) || ['+', '-', '*', '/'].includes(key)) {
        display.value += key;
    } else if (key === 'Enter' || key === '=') {
        calculateBtn.click(); 
    } else if (key === 'Backspace') {
        backspaceBtn.click(); 
    } else if (key === 'Escape') {
        clearBtn.click(); 
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

function loadHistory() {
    if (currentUser) {
        db.collection('calculations')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get()
            .then((querySnapshot) => {
                const historyTableBody = document.getElementById('historyTableBody');
                historyTableBody.innerHTML = '';

                if (querySnapshot.empty) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td class="py-2 px-4 border-b" colspan="4">No history available.</td>`;
                    historyTableBody.appendChild(row);
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const formattedTime = data.timestamp.toDate().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="py-6 px-6 border-b" style="font-size: 12px;">${formattedTime}</td>
                        <td class="py-2 px-6 border-b">${data.input}</td>
                        <td class="py-2 px-6 border-b">${data.output}</td>
                        <td class="py-2 px-6 border-b">
                            <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded" onclick="deleteCalculation('${doc.id}')">Delete</button>
                        </td>
                    `;
                    historyTableBody.appendChild(row);
                });
            })
            .catch((error) => {
                console.error('Error loading history: ', error);
            });
    }
}

function deleteCalculation(calculationId) {
    if (currentUser) {
        db.collection('calculations').doc(calculationId).delete()
            .then(() => {
                loadHistory();
            })
            .catch((error) => {
                console.error('Error deleting calculation: ', error);
            });
    }
}
