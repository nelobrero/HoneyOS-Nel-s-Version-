// voice.js
let recognition;

// Function to handle the voice commands
function handleVoiceCommand(command) {
  if (command.includes("new file")) {
    createNewFile();
    speakText("Creating a new file.");
  } else if (command.includes("open file")) {
    openFile();
    speakText("Opening a file.");
  } else if (command.includes("save file")) {
    saveFile();
    speakText("Saving the file.");
  } else if (command.includes("close file")) {
    closeFile();
    speakText("Closing the file.");
  }
}

// Function to create a new file
function createNewFile() {
  if (!isFileSaved) {
    alert('Please save or discard changes in the current file before creating a new file.');
    return;
  }
  
  // Check if the code editor already exists
  const existingEditor = document.getElementById('code-editor');
  if (existingEditor) {
    // If the code editor exists, clear its contents
    existingEditor.value = '';
    existingEditor.style.backgroundColor = 'lightgray';
    currentFileHandle = null;
  } else {
    // If the code editor doesn't exist, create it
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    codeEditor = document.createElement('textarea');
    codeEditor.id = 'code-editor';
    codeEditor.style.backgroundColor = 'lightgray';
    const closeButton = document.createElement('button');
    closeButton.id = 'close-editor';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', function() {
      closeCodeEditor();
    });
    editorContainer.appendChild(codeEditor);
    editorContainer.appendChild(closeButton);
    document.body.appendChild(editorContainer);
  }
  
  // Add the event listener after creating the code editor
  codeEditor.addEventListener('input', function() {
    if (currentFileHandle) {
      codeEditor.style.backgroundColor = 'lightgray';
    }
  });
  
  isFileSaved = false;
}

// Function to open a file
async function openFile() {
  if (codeEditor && !isFileSaved) {
    const confirmOpen = confirm('Are you sure you want to open a new file without saving the current file?');
    if (!confirmOpen) {
      return;
    }
  }

  try {
    const selectedFile = await Neutralino.os.showOpenDialog();
    
    if (selectedFile && selectedFile.length > 0) {
      const filePath = selectedFile[0];
      const content = await Neutralino.filesystem.readFile(filePath);

      if (!codeEditor) {
        createCodeEditor();
      }

      codeEditor.value = content;
      currentFileHandle = filePath;
      codeEditor.style.backgroundColor = 'white';
      isFileSaved = true;

      console.log('File opened successfully');
    }
  } catch (err) {
    console.error('Failed to open file:', err);
  }
}

// Function to save a file
async function saveFile() {
  if (codeEditor) {
    const content = codeEditor.value;
    try {
      if (currentFileHandle) {
        // Save changes to the existing file
        await Neutralino.filesystem.writeFile(currentFileHandle, content);
        codeEditor.style.backgroundColor = 'white';
        isFileSaved = true;
      } else {
        // Save as a new file
        const selectedFile = await Neutralino.os.showSaveDialog();
        if (selectedFile) {
          await Neutralino.filesystem.writeFile(selectedFile, content);
          currentFileHandle = selectedFile;
          codeEditor.style.backgroundColor = 'white';
          isFileSaved = true;
        }
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  } else {
    alert('No file is currently open.');
  }
}

// Function to close a file
async function closeFile() {
  if (codeEditor) {
    if (!isFileSaved) {
      const confirmClose = confirm('Are you sure you want to exit without saving the file?');
      if (confirmClose) {
        removeCodeEditor();
      } else {
        return;
      }
    } else {
      removeCodeEditor();
    }
  }
}

// Function to start voice recognition
function startVoiceRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Set continuous to false
    
    // Set a longer timeout duration (e.g., 15 seconds)
    recognition.timeout = 15000;
    
    recognition.onstart = function() {
      console.log('Voice recognition started.');
      displayMessage('Listening... Say "Hey Honey" followed by a command and end with "please".');
      playSound('sfx/start-sound.mp3');
    };
    
    recognition.onresult = function(event) {
      const command = event.results[event.results.length - 1][0].transcript;
      if (command.toLowerCase().includes("hey honey")) {
        const extractedCommand = command.toLowerCase().replace("hey honey", "").trim();
        
        if (extractedCommand.endsWith("please")) {
          const finalCommand = extractedCommand.slice(0, -6).trim(); // Remove "please" from the command
          handleVoiceCommand(finalCommand);
        }
      }
    };
    
    recognition.onerror = function(event) {
      console.error('Voice recognition error:', event.error);
      displayMessage('Voice recognition error occurred.');
      playSound('sfx/error-sound.mp3');
    };
    
    recognition.onend = function() {
      console.log('Voice recognition ended.');
      displayMessage('Voice recognition ended.');
      playSound('sfx/end-sound.mp3');
      // Enable the voice recognition toggle button on end
      document.getElementById('voice-toggle').disabled = false;
    };
    
    recognition.start();
  }

// Function to stop voice recognition
function stopVoiceRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// Function to toggle voice recognition
function toggleVoiceRecognition() {
  const toggleButton = document.getElementById('voice-toggle');
  
  if (recognition) {
    stopVoiceRecognition();
    toggleButton.textContent = '';
  } else {
    startVoiceRecognition();
    toggleButton.textContent = '';
  }
}

// Function to display a message
function displayMessage(message) {
  const messageElement = document.getElementById('voice-message');
  messageElement.textContent = message;
}

// Function to play a sound
function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.play();
}

// Function to speak text
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get the list of available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find a female voice
    const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female'));
    
    // Set the voice to the female voice if available
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }

// Add event listener to the voice recognition toggle button
document.getElementById('voice-toggle').addEventListener('click', toggleVoiceRecognition);