// get the chat header element
const chatHeader = document.querySelector("#chat-header h2");

const allUsersDiv = document.getElementById("all-users");

db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        const userElement = document.createElement("div");
        userElement.classList.add("user");
        // create the avatar image element and set its attributes
        const avatarImg = document.createElement("img");
        avatarImg.src = user.avatarUrl;
        avatarImg.alt = user.name + " avatar";
        avatarImg.classList.add("avatar");
        userElement.appendChild(avatarImg);

    
        // create the user name element and set its text content
        const userName = document.createElement("p");
        userName.textContent = user.name;
        userName.classList.add("user-name");

        // add the avatar and user name elements to the user div
        userElement.appendChild(userName);
        
        // add the user div to the all users div
        allUsersDiv.appendChild(userElement);
        // create the online status element and set its text content
        const onlineStatus = document.createElement("span");
        onlineStatus.classList.add("online-status","offline");

        // add the online status element to the user div
        userElement.appendChild(onlineStatus);
        
        var logoutBtn = document.getElementById("logout-btn");
        // Add an event listener to the logout button
        logoutBtn.addEventListener("click", function () {
            onlineUsersRef.delete();
            // Sign out the user from Firebase Authentication
            auth.signOut()
                .then(function () {
                    // Get the current user's email
                    const userEmail = firebase.auth().currentUser.email;
                    // Delete the current user's email from the onlineUsers collection in Firestore
                    const db = firebase.firestore();
                    const onlineUsersRef = db.collection('onlineUsers').doc(userEmail);
                    onlineUsersRef.doc.delete().then(function () {
                        alert("User email deleted from onlineUsers collection");
                    }).catch(function (error) {
                        alert("Error deleting user email from onlineUsers collection: ", error);
                    });
                    if (user) {
                        db.collection("users").doc(user.uid).update({
                            active: false
                        });
                    }
                    // Redirect the user to the index page
                    window.location.href = "index.html";
                })
                .catch(function (error) {
                    // Handle any errors that occurred during sign-out
                    console.error("Error signing out user: ", error);
                });
        });

        userElement.setAttribute("data-user-email", user.email);

        const userEmail = firebase.auth().currentUser.email;
        const onlineUsersRef = db.collection('onlineUsers').doc(userEmail);
        // Listen for changes to the onlineUsers collection
        db.collection('onlineUsers').onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const onlineStatusEl = userElement.querySelector('.online-status');
                if (change.doc.id === user.email && change.type === "removed") {
                    // User was removed from the onlineUsers collection, update their online status to "offline"
                    if (onlineStatusEl) {
                        onlineStatusEl.remove();
                    }
                    const onlineStatus = document.createElement("span");
                    onlineStatus.classList.add("online-status","offline");
                    userElement.appendChild(onlineStatus);
                } else if (change.doc.id === user.email && change.type === "added") {
                    // User was added to the onlineUsers collection, update their online status to "online"
                    if (onlineStatusEl) {
                        onlineStatusEl.remove();
                    }
                    const onlineStatus = document.createElement("span");
                    onlineStatus.classList.add("online-status","online");
                    userElement.appendChild(onlineStatus);
                }
            });
        });
        onlineUsersRef.set({ online: true });
       

        userElement.addEventListener("click", () => {
            const messagesList = document.getElementById("messages-list");
            messagesList.innerHTML = "";
            // set the chat header text to the user's name
            chatHeader.textContent = userElement.querySelector(".user-name").textContent;
            // TODO: load messages for the selected user       
           
            // remove the submit event listener from the message form
            const messageForm = document.getElementById("message-form");
            messageForm.removeEventListener("submit", sendMessage);
            
            const currentUser = firebase.auth().currentUser; // get the current user
            const currentUserEmail = currentUser.email; // assuming the user email is stored in the 'email' field
            // get the selected user email
            selectedUserEmail = userElement.getAttribute("data-user-email");
            
            // define the sendMessage function
            function sendMessage(event) {
                event.preventDefault();

                // Get the message input element and its value
                const messageInput = document.getElementById("message-input");
                const messageText = messageInput.value;

                if (messageText.trim() === "") {
                    return;
                }

                // Get a reference to the messages collection
                const messagesRef = db.collection("messages");
                // Create a new message document in the messages collection
                messagesRef.add({
                    senderId: currentUserEmail,
                    receiverId: selectedUserEmail,
                    message: messageText,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                });
                // Create a new message element and add it to the messages list
                const messageElement = document.createElement("div");
                messageElement.classList.add("message");
               

                // Add the message element to the messages list
                const messagesList = document.getElementById("messages-list");
                messagesList.appendChild(messageElement);
                
                // Scroll to the last message element
                messageElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
 
                // Clear the message input
                messageInput.value = "";
                
            }
            // add submit event listener to the message form
            messageForm.addEventListener("submit", sendMessage);


            // Set up a listener to listen for changes to the messages collection
            // Set up a listener to listen for changes to the messages collection
            const messagesRef = db.collection("messages");
            messagesRef
                .where("senderId", "==", currentUserEmail)
                .where("receiverId", "==", selectedUserEmail)
                .orderBy("timestamp", "asc")
                .onSnapshot((snapshot) => {
                    // Clear the messages list
                    const messagesList = document.getElementById("messages-list");
                   
                    // Loop through each message document in the collection
                    snapshot.forEach((doc) => {
                        // Get the data for the message
                        const message = doc.data();
                        // Check if the message was already added to the messages list
                        const existingMessageElement = document.getElementById(doc.id);
                        if (existingMessageElement) {
                            return;
                        }

                        // Create a new message element and add it to the messages list
                        const messageElement = document.createElement("div");
                        messageElement.classList.add("message");
                        messageElement.classList.add("sent-message");
                        messageElement.setAttribute("id", doc.id);
                        messageElement.innerHTML = `
                                <span>${message.message}</span>
                                <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
                            `;

                        messagesList.appendChild(messageElement);
                        // Create a 3-dot menu button element
                        const menuButtonElement = document.createElement("button");
                        menuButtonElement.classList.add("menu-button");
                        menuButtonElement.innerHTML = "&#8942;";
                        messageElement.appendChild(menuButtonElement);

                        // Create a dropdown menu element
                        const dropdownMenuElement = document.createElement("div");
                        dropdownMenuElement.classList.add("dropdown-menu");

                        // Create a delete button element and add a click event listener to delete the message
                        const deleteButtonElement = document.createElement("button");
                        deleteButtonElement.classList.add("delete-button");
                        deleteButtonElement.textContent = "Delete";

                        let hoverTimeout;

                        // Add a mouseenter event listener to the 3 dot menu button
                        menuButtonElement.addEventListener("mouseenter", () => {
                            // Show the delete button
                            deleteButtonElement.style.display = "inline-block";
                            // Clear the previous timeout, if any
                            clearTimeout(hoverTimeout);
                        });

                        // Add a mouseleave event listener to the 3 dot menu button
                        menuButtonElement.addEventListener("mouseout", () => {
                            // Hide the delete button after 2 seconds
                            setTimeout(() => {
                                deleteButtonElement.style.display = "none";
                            }, 2000);
                        });

                        // Add a click event listener to the delete button
                        deleteButtonElement.addEventListener("click", () => {
                            // Delete the message from the messages collection
                            messagesRef.doc(doc.id).delete();
                            // Remove the message element from the messages list
                            messagesList.removeChild(messageElement);
                        });

                        dropdownMenuElement.appendChild(deleteButtonElement);
                        messageElement.appendChild(dropdownMenuElement);


                        // Scroll to the last message element
                        messageElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

                    });
                });

            messagesRef
                .where("senderId", "==", selectedUserEmail)
                .where("receiverId", "==", currentUserEmail)
                .orderBy("timestamp", "asc")
                .onSnapshot((snapshot) => {
                    // Clear the messages list
                    const messagesList = document.getElementById("messages-list");
                    //messagesList.innerHTML = "";

                    // Loop through each message document in the collection
                    snapshot.forEach((doc) => {
                        // Get the data for the message
                        const message = doc.data();
                        // Check if the message was already added to the messages list
                        const existingMessageElement = document.getElementById(doc.id);
                        if (existingMessageElement) {
                            return;
                        }

                        // Create a new message element and add it to the messages list
                        const messageElement = document.createElement("div");
                        messageElement.classList.add("message");
                        messageElement.classList.add("received-message");
                        messageElement.setAttribute("id", doc.id);
                        messageElement.innerHTML = `
                                <span>${message.message}</span>
                                <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
                            `;
                        // Add the message element to the messages list
                        const messagesList = document.getElementById("messages-list");
                        
                        messagesList.appendChild(messageElement);
                        // Create a 3-dot menu button element
                        const menuButtonElement = document.createElement("button");
                        menuButtonElement.classList.add("menu-button");
                        menuButtonElement.innerHTML = "&#8942;";
                        messageElement.appendChild(menuButtonElement);

                        // Create a dropdown menu element
                        const dropdownMenuElement = document.createElement("div");
                        dropdownMenuElement.classList.add("dropdown-menu");

                        // Create a delete button element and add a click event listener to delete the message
                        const deleteButtonElement = document.createElement("button");
                        deleteButtonElement.classList.add("delete-button");
                        deleteButtonElement.textContent = "Delete";

                        let hoverTimeout;

                        // Add a mouseenter event listener to the 3 dot menu button
                        menuButtonElement.addEventListener("mouseenter", () => {
                            // Show the delete button
                            deleteButtonElement.style.display = "inline-block";
                            // Clear the previous timeout, if any
                            clearTimeout(hoverTimeout);
                        });

                        // Add a mouseleave event listener to the 3 dot menu button
                        menuButtonElement.addEventListener("mouseout", () => {
                            // Hide the delete button after 2 seconds
                            setTimeout(() => {
                                deleteButtonElement.style.display = "none";
                            }, 2000);
                        });

                        // Add a click event listener to the delete button
                        deleteButtonElement.addEventListener("click", () => {
                            // Delete the message from the messages collection
                            messagesRef.doc(doc.id).delete();
                            // Remove the message element from the messages list
                            messagesList.removeChild(messageElement);
                        });

                        dropdownMenuElement.appendChild(deleteButtonElement);
                        messageElement.appendChild(dropdownMenuElement);

                        // Scroll to the last message element
                        messageElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

                    });
                });

            function formatTimestamp(timestamp) {
                // Format the timestamp using the Date object
                const date = new Date();
                const formattedTime = date.toString();
                return formattedTime.substring(0, 24);
            }

            auth.onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in, retrieve their data from the "users" collection
                    var userDocRef = db.collection("users").doc(user.uid);
                    userDocRef.get().then(function (doc) {
                        if (doc.exists) {
                            // User data found, update the UI accordingly
                            var userData = doc.data();
                            document.getElementById("user-name").textContent = userData.name;
                            document.getElementById("user-avatar").src = userData.avatarUrl;
                        } else {
                            console.log("No such document!");
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                } else {
                    // User is signed out, redirect to the login page
                    window.location = "index.html";
                }
            });

        });

    });
});


