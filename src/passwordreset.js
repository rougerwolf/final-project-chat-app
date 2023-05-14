// Initialize Firebase app
const firebaseConfig = {
    // your Firebase app configuration
    apiKey: "AIzaSyBOfrKJAtuEqlmvXeTzh1SOaR1mxuuHMjM",
    authDomain: "chat-app-project-21mci1095.firebaseapp.com",
    projectId: "chat-app-project-21mci1095",
    storageBucket: "chat-app-project-21mci1095.appspot.com",
    messagingSenderId: "486721100838",
    appId: "1:486721100838:web:84dac520cb82bdf14a9ae7"
};
firebase.initializeApp(firebaseConfig);

function forgotPassword(e) {
    e.preventDefault();
    var email = document.getElementById("email").value;
    firebase.auth().sendPasswordResetEmail(email)
        .then(function () {
            alert("Password reset Link is sent to your Email!");
        })
        .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/invalid-email') {
                alert("Please enter a valid email address.");
            } else if (errorCode === 'auth/user-not-found') {
                alert("User not found.");
            } else {
                alert(errorMessage);
            }
            console.log(error);
        });
}
