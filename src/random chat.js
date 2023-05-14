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

        userElement.setAttribute("data-user-email", user.email);

        userElement.addEventListener("click", () => {
            // set the chat header text to the user's name
            chatHeader.textContent = userElement.querySelector(".user-name").textContent;
            // TODO: load messages for the selected user       
            // Get a reference to the messages collection
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
                messageElement.classList.add("sent-message");
                messageElement.innerHTML = `
                    <span>${messageText}</span>
                    <span class="timestamp">${formatTimestamp(new Date())}</span>
                `;

                // Add the message element to the messages list
                const messagesList = document.getElementById("messages-list");
                messagesList.appendChild(messageElement);

                // Scroll to the bottom of the messages list
                messagesList.scrollTop = messagesList.scrollHeight;

                // Clear the message input
                messageInput.value = "";
            }

            // add submit event listener to the message form
            messageForm.addEventListener("submit", sendMessage);


            // Set up a listener to listen for changes to the messages collection
            // Set up a listener to listen for changes to the messages collection
            const messagesRef = db.collection("messages");


            messagesRef
                .where("senderId", "==", selectedUserEmail)
                .where("receiverId", "in", [currentUserEmail, selectedUserEmail])
                .orderBy("timestamp", "asc")
                .onSnapshot((snapshot) => {
                    // Clear the messages list
                    const messagesList = document.getElementById("messages-list");
                    messagesList.innerHTML = "";

                    // Loop through each message document in the collection
                    snapshot.forEach((doc) => {
                        // Get the data for the message
                        const message = doc.data();

                        // Create a new message element and add it to the messages list
                        const messageElement = document.createElement("div");
                        messageElement.classList.add("message");
                        // Create a new message element and add it to the messages list

                        messageElement.innerHTML = `
                <span>${message.message}</span>
                <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
            `;

                        // Check if the message was sent by the current user or received by the current user
                        if (message.senderId === currentUserEmail) {
                            // Message was sent by the current user
                            messageElement.classList.add("sent-message");
                        } else if (message.receiverId === currentUserEmail) {
                            // Message was received by the current user
                            messageElement.classList.add("received-message");
                        }

                        messagesList.appendChild(messageElement);
                        // Scroll to the bottom of the messages list
                        messagesList.scroll({
                            top: messagesList.scrollHeight,
                            behavior: "smooth"
                        });
                    });
                });



            function formatTimestamp(timestamp) {
                // Format the timestamp using the Date object
                const date = new Date(timestamp * 1000);
                const hours = date.getHours();
                const minutes = "0" + date.getMinutes();
                const formattedTime = hours + ":" + minutes.substr(-2);
                return formattedTime;
            }

            function threeButtonMenu() {
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

            }

        });

    });
});

