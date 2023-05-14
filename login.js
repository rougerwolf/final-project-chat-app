
// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBOfrKJAtuEqlmvXeTzh1SOaR1mxuuHMjM",
  authDomain: "chat-app-project-21mci1095.firebaseapp.com",
  projectId: "chat-app-project-21mci1095",
  storageBucket: "chat-app-project-21mci1095.appspot.com",
  messagingSenderId: "486721100838",
  appId: "1:486721100838:web:84dac520cb82bdf14a9ae7"
});

// Get a reference to the Firebase Authentication service
var auth = firebase.auth();
var db = firebase.firestore();


// Handle form submission
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // prevent default form submission behavior
  // Get references to the email and password input fields
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");

  var email = emailInput.value;
  var password = passwordInput.value;

  // Attempt to log in the user with their email and password
  auth.signInWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      console.log("User logged in successfully");

      // Redirect the user to the main page
      window.location.href = "main.html";
    })
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      if (errorCode === "auth/invalid-email") {
        alert("Invalid email address");
      } else if (errorCode === "auth/user-disabled") {
        alert("Your account has been disabled");
      } else if (errorCode === "auth/user-not-found") {
        alert("No user found with that email address");
      } else if (errorCode === "auth/wrong-password") {
        alert("Incorrect password");
      } else {
        alert("Error: " + errorMessage);
      }
    });
});

// Get a reference to the logout button
var logoutBtn = document.getElementById("logout-btn");


