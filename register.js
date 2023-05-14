// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBOfrKJAtuEqlmvXeTzh1SOaR1mxuuHMjM",
  authDomain: "chat-app-project-21mci1095.firebaseapp.com",
  projectId: "chat-app-project-21mci1095",
  storageBucket: "chat-app-project-21mci1095.appspot.com",
  messagingSenderId: "486721100838",
  appId: "1:486721100838:web:84dac520cb82bdf14a9ae7"
});

// Get a reference to the Firestore database
var db = firebase.firestore();

// Get a reference to the Firebase Authentication service
var auth = firebase.auth();

// Get a reference to the file input field
var avatarInput = document.getElementById("avatar");

// Save user details to Firestore
function saveUserToFirestore(name, email, avatarUrl) {
  // Add a new document to the "users" collection with the user's details
  db.collection("users").doc(auth.currentUser.uid).set({
    name: name,
    email: email,
    avatarUrl: avatarUrl
  })
    .then(function () {
      console.log("User details saved to Firestore");
    })
    .catch(function (error) {
      console.error("Error saving user details to Firestore: ", error);
    });
}

// Register a new user when the form is submitted
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the user's name, email, and password from the form
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  // Create a new user account in Firebase Authentication
  auth.createUserWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      // Get the user ID from the user credential
      var uid = userCredential.user.uid;

      // Upload the user's avatar image to Firebase Storage (if one was selected)
      if (avatarInput.files.length > 0) {
        var file = avatarInput.files[0];
        var storageRef = firebase.storage().ref().child("avatars/" + uid);
        var uploadTask = storageRef.put(file);
        uploadTask.on("state_changed", null, null, function () {
          // Get the download URL for the uploaded image and save it to Firestore
          storageRef.getDownloadURL().then(function (url) {
            saveUserToFirestore(name, email, url);
          });
        });
      } else {
        // If no avatar image was selected, save the user's details to Firestore without an avatar URL
        saveUserToFirestore(name, email, null);
      }

      // Show a success message to the user
      var successMessage = document.createElement("div");
      successMessage.innerText = "User registration successful. Please log in.";
      successMessage.style.color = "green";
      document.querySelector("form").appendChild(successMessage);

    })
    .catch(function (error) {
      // Handle errors here (e.g. show a message to the user)
      var errorMessage = document.createElement("div");
      errorMessage.innerText = "Error: " + error.message;
      errorMessage.style.color = "red";
      document.querySelector("form").appendChild(errorMessage);
    });
});
