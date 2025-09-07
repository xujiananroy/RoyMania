// --------------------
//        SETUP
// --------------------
function showDiv(id) {
    document.getElementById(id).style.display = "block";
}

function hideDiv(id) {
    document.getElementById(id).style.display = "none";
}

const firebaseConfig = {
    apiKey: "AIzaSyC9FLT7xOPRXR6ms2AXlXeKfLCURAOK2tQ",
    authDomain: "roymania-3452d.firebaseapp.com",
    databaseURL: "https://roymania-3452d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "roymania-3452d",
    storageBucket: "roymania-3452d.firebasestorage.app",
    messagingSenderId: "73902442076",
    appId: "1:73902442076:web:c468042492e2c9e5ad4899"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// Check login state on load
window.onload = () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            showApp(user);
        } else {
            setupDivs();
        }
    });
};

//----- CHANGE THIS ON RELEASE -----
function setupDivs() {
    hideDiv("app");
    showDiv("development");
    /*
    hideDiv("development");
    showDiv("app");
    hideDiv("appScreen");
    showDiv("loginRegister");
    hideDiv("registerScreen");
    showDiv("loginScreen");
    */
}

// --------------------
//         APP
// --------------------
function gotoRegister() {
    document.getElementById("registerScreen").style.display = "block";
    document.getElementById("loginScreen").style.display = "none";
}

function gotoLogin() {
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("registerScreen").style.display = "none";
}

async function register() {
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    if (!email || !password || !username) {
        alert("Please enter username, email and password");
        return;
    }
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // ✅ SET DISPLAY NAME
        await user.updateProfile({
            displayName: username
        });

        // ✅ SAVE USER PROFILE TO FIRESTORE
        const userDocRef = db.collection("users").doc(user.uid);
        await userDocRef.set({
            username: username,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            Roydollar: 100.00,
            inventory: []
            });

        alert("Account created! Welcome to RoyMania!");
    } catch (error) {
        alert("Error: " + error.message);
    }
}

async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // ✅ UPDATE LAST LOGIN TIMESTAMP
        const userDocRef = db.collection("users").doc(user.uid);
        await userDocRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}

async function showApp(user) {
    // ✅ First, try to load from Firestore
    const userDocRef = db.collection("users").doc(user.uid);
    const doc = await userDocRef.get();

    let username = "Adventurer";
    let Roydollar = 0;

    if (doc.exists) {
        const data = doc.data();
        username = data.username || user.displayName;
        Roydollar = data.Roydollar;
    }

    // ✅ UPDATE UI
    document.getElementById("userName").textContent = username;
    document.getElementById("userRoydollar").textContent = Roydollar;
    
    document.getElementById("loginRegister").style.display = "none";
    document.getElementById("appScreen").style.display = "block";
}

async function logout() {
    await auth.signOut();
    showLogin();
}