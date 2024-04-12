document.addEventListener('DOMContentLoaded', function() {
            const drawer = document.getElementById('drawer');
            const additionalContainer = document.getElementById('additional-container');
            const content = document.getElementById('content');
            let lastClickTime = 0; // Variable to store the timestamp of the last click
            
            // Function to toggle the additional container
            function toggleAdditionalContainer() {
                additionalContainer.classList.toggle('active');
            }
            
            // Add event listener to the document to toggle the drawer
            document.addEventListener('click', function(event) {
                const clickX = event.clientX; // X-coordinate of the click event
                const screenWidth = window.innerWidth; // Width of the screen
                
                // Calculate the time difference since the last click
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - lastClickTime;
                
                // Check if the click occurs on the left half of the screen and if it's not a double click
                if (clickX <= (screenWidth / 7) && timeDiff > 300) { // Adjust the delay as needed (300 milliseconds)
                    // Toggle the drawer's visibility by changing its left position
                    drawer.style.left = (drawer.style.left === '0px') ? '-250px' : '0px';
                    
                    // Move the content to the right when the drawer is open
                    content.style.marginLeft = (drawer.style.left === '0px') ? '250px' : '0';
                    
                    // Update the last click time
                    lastClickTime = currentTime;
                }
            });
            
            // Function to toggle voice recognition
            function toggleVoiceRecognition() {
                // Your logic for toggling voice recognition here
                console.log('Voice recognition toggled');
            }
            
            // Add event listener to the voice recognition button within the drawer
            const voiceToggleButton = document.getElementById('voice-toggle');
            voiceToggleButton.addEventListener('click', toggleVoiceRecognition);
            
            // Add event listener to hide the drawer on double-click
            document.addEventListener('dblclick', function(event) {
                drawer.style.left = '-250px'; // Hide the drawer
                content.style.marginLeft = '0'; // Reset content margin
            });
        });