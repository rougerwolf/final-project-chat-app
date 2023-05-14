(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBOfrKJAtuEqlmvXeTzh1SOaR1mxuuHMjM",
        authDomain: "chat-app-project-21mci1095.firebaseapp.com",
        projectId: "chat-app-project-21mci1095",
        storageBucket: "chat-app-project-21mci1095.appspot.com",
        messagingSenderId: "486721100838",
        appId: "1:486721100838:web:84dac520cb82bdf14a9ae7"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const firestore = firebase.firestore();

    const contactForm = document.querySelector('#contact-form');

    console.log(contactForm);

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = contactForm.querySelector('#email').value;

        const message = contactForm.querySelector('#message').value;

        const name = contactForm.querySelector('#name').value;

        addContactFormToFirestore(email, message, name).then((result) => {
            if (result) {
                alert('Form submitted successfully!');
            } else {
                alert('Error submitting form!');
            }
        });
        
    });

    function addContactFormToFirestore(email, message, name) {
        return firestore.collection("contactus").add({
            email: email,
            message: message,
            name: name
        })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                return true;
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                return false;
            });
    }
})()