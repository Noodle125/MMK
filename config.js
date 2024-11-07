// Firebase configuration script is moved to a separate file (firebase-config.js)

// Google Sign-In and Chat functionality
document.addEventListener('DOMContentLoaded', function() {
    // Adding event listener for the login button to initiate Google Sign-In
    document.getElementById('login-btn').addEventListener('click', signInWithGoogle);
    
    // Check if user is already signed in
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            loadChatHistory(); // Load chat history after user logs in
        }
    });
});

function signInWithGoogle() {
    // Create a Google Auth provider
    const provider = new firebase.auth.GoogleAuthProvider();
    // Sign in with a pop-up window using the Google provider
    firebase.auth().signInWithPopup(provider).then(result => {
        // Hide the login section and show the main content once authenticated
        document.getElementById('login').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        loadChatHistory(); // Load chat history after user logs in
    }).catch(error => {
        console.error('Error during sign-in:', error); // Log any errors that occur during sign-in
    });
}

function loadChatHistory() {
    const db = firebase.database();
    // Listen for changes in the 'public-chat' node in the database
    db.ref('public-chat/').on('value', snapshot => {
        const chatHistory = snapshot.val();
        let chatDisplay = '';
        // Iterate through each message in chat history and create HTML for display
        for (let key in chatHistory) {
            const { username, message, profilePic, fileUrl } = chatHistory[key];
            chatDisplay += `<div class="chat-message">
                               <img src="${profilePic}" alt="${username}">
                               <span><strong>${username}:</strong> ${message}</span>
                               ${fileUrl ? `<a href="${fileUrl}" target="_blank">📎 File</a>` : ''}
                           </div>`;
        }
        // Update chat history container with the latest messages
        document.getElementById('chat-history').innerHTML = chatDisplay;
    });
}

// Adding event listeners for sending messages and uploading files
// Send message button click event
document.getElementById('send-btn').addEventListener('click', sendMessage);
// Upload button click event triggers file input
document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
// File input change event for uploading files
document.getElementById('file-input').addEventListener('change', uploadFile);

function sendMessage() {
    const message = document.getElementById('chat-input').value;
    if (message) {
        const user = firebase.auth().currentUser;
        // Push message to the 'public-chat' node in the database
        firebase.database().ref('public-chat/').push({
            username: user.displayName, // Get username from Google user info
            profilePic: user.photoURL,  // Get profile picture from Google user info
            message: message // Message text
        });
        document.getElementById('chat-input').value = ''; // Clear the input field after sending
    }
}

function uploadFile(event) {
    const file = event.target.files[0];
    if (file) {
        const user = firebase.auth().currentUser;
        // Reference to the storage location in Firebase
        const storageRef = firebase.storage().ref(`chat-files/${file.name}`);
        // Upload file to Firebase Storage
        storageRef.put(file).then(snapshot => {
            // Get the download URL for the uploaded file
            snapshot.ref.getDownloadURL().then(url => {
                // Push file link to the 'public-chat' node in the database
                firebase.database().ref('public-chat/').push({
                    username: user.displayName, // Get username from Google user info
                    profilePic: user.photoURL,  // Get profile picture from Google user info
                    message: '[File]', // Placeholder message for the file
                    fileUrl: url // URL of the uploaded file
                });
            });
        });
    }
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-Mp9Jdwq_efLZcNncujjzU0Sp7LwAv_0",
  authDomain: "project3-d0533.firebaseapp.com",
  projectId: "project3-d0533",
  storageBucket: "project3-d0533.appspot.com",
  messagingSenderId: "815891832591",
  appId: "1:815891832591:web:1e16f544af6e974bff287a",
  measurementId: "G-EZ1B35LGLK"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
