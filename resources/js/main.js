let codeEditor;
let currentFileHandle;
let isFileSaved = true;

function onWindowClose() {
  Neutralino.app.exit();
}

Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    const splashScreen = document.getElementById("splash-screen");
    splashScreen.style.transition = "opacity 1s ease-out";
    splashScreen.style.opacity = 0;
    setTimeout(function () {
      window.location.href = "index2.html";
    }, 1000);
  }, 500);

  const newFileHexagon = document.querySelector(
    ".hexagon-wrapper:nth-child(1) .hexagon"
  );
  const openFileHexagon = document.querySelector(
    ".hexagon-wrapper:nth-child(2) .hexagon"
  );
  const saveFileHexagon = document.querySelector(
    ".hexagon-wrapper:nth-child(3) .hexagon"
  );
  const closeFileHexagon = document.querySelector(
    ".hexagon-wrapper:nth-child(4) .hexagon"
  );

  newFileHexagon.addEventListener("click", createNewFile);
  openFileHexagon.addEventListener("click", openFile);
  saveFileHexagon.addEventListener("click", saveFile);
  closeFileHexagon.addEventListener("click", closeFile);

  const editorTask = document.getElementById("editor-task");
  editorTask.addEventListener("click", maximizeEditor); // Maximize the editor when the taskbar button is clicked
});

function createCodeEditor() {
  const editorContainer = document.getElementById('editor-container');
  codeEditor = document.getElementById('code-editor');

  const newFileIcon = document.getElementById('new-file');
  const openFileIcon = document.getElementById('open-file');
  const saveFileIcon = document.getElementById('save-file');
  const closeFileIcon = document.getElementById('close-file');
  const minimizeIcon = document.getElementById('minimize');
  const maximizeIcon = document.getElementById('max');

  newFileIcon.addEventListener('click', createNewFile);
  openFileIcon.addEventListener('click', openFile);
  saveFileIcon.addEventListener('click', saveFile);
  closeFileIcon.addEventListener('click', closeFile);
  minimizeIcon.addEventListener('click', minimizeEditor);
  maximizeIcon.addEventListener('click', max);

  editorContainer.classList.remove('hidden');

  const hexagonContainer = document.querySelector('.hexagon-container');
  hexagonContainer.classList.add('hidden');

  const taskbar = document.getElementById('taskbar');
  taskbar.classList.remove('hidden'); // Show the taskbar

  // Ensure default dimensions are applied
  editorContainer.style.width = '50%';
  editorContainer.style.height = '80%';


  codeEditor.addEventListener('input', function () {
    isFileSaved = false;
    codeEditor.style.backgroundColor = 'lightgray';
  });
}

function removeCodeEditor() {
  const editorContainer = document.getElementById('editor-container');
  codeEditor.value = '';
  currentFileHandle = null;
  isFileSaved = true;
  editorContainer.classList.add('hidden');

  const hexagonContainer = document.querySelector('.hexagon-container');
  hexagonContainer.classList.remove('hidden');

  const taskbar = document.getElementById('taskbar');
  taskbar.classList.add('hidden'); // Hide the taskbar
}

function createNewFile() {
  if (!isFileSaved) {
    alert(
      "Please save or discard changes in the current file before creating a new file."
    );
    return;
  }

  createCodeEditor();
  codeEditor.value = "";
  codeEditor.style.backgroundColor = "lightgray";
  currentFileHandle = null;

  isFileSaved = false;
}

async function openFile() {
  if (codeEditor && !isFileSaved) {
    const confirmOpen = confirm(
      "Are you sure you want to open a new file without saving the current file?"
    );
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
      codeEditor.style.backgroundColor = "white";
      isFileSaved = true;

      console.log("File opened successfully");
    }
  } catch (err) {
    console.error("Failed to open file:", err);
  }
}

async function saveFile() {
  if (codeEditor) {
    const content = codeEditor.value;
    try {
      if (currentFileHandle) {
        await Neutralino.filesystem.writeFile(currentFileHandle, content);
        codeEditor.style.backgroundColor = "white";
        isFileSaved = true;
      } else {
        const selectedFile = await Neutralino.os.showSaveDialog();
        if (selectedFile) {
          await Neutralino.filesystem.writeFile(selectedFile, content);
          currentFileHandle = selectedFile;
          codeEditor.style.backgroundColor = "white";
          isFileSaved = true;
        }
      }
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  } else {
    alert("No file is currently open.");
  }
}

async function closeFile() {
  if (codeEditor) {
    if (!isFileSaved) {
      const confirmClose = confirm(
        "Are you sure you want to exit without saving the file?"
      );
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

function minimizeEditor() {
  const editorContainer = document.getElementById('editor-container');
  editorContainer.classList.add('hidden');

  const hexagonContainer = document.querySelector('.hexagon-container');
  hexagonContainer.classList.remove('hidden');

  const taskbar = document.getElementById('taskbar');
  taskbar.classList.remove('hidden'); // Show the taskbar
}

function maximizeEditor() {
  const editorContainer = document.getElementById('editor-container');
  const hexagonContainer = document.querySelector('.hexagon-container');
  const taskbar = document.getElementById('taskbar');

  if (editorContainer.classList.contains('hidden')) {
    // Editor is hidden, maximize it
    editorContainer.classList.remove('hidden');
    taskbar.classList.add('hidden'); // Hide taskbar (optional)
  } else {
    // Editor is visible, minimize it
    editorContainer.classList.add('hidden');
    hexagonContainer.classList.remove('hidden');
    taskbar.classList.remove('hidden'); // Show taskbar (optional)
  }
}


let isFullScreen = false;
let defaultWidth, defaultHeight;

function max() {
  const editorContainer = document.getElementById("editor-container");
  const taskbar = document.getElementById("taskbar");

  if (!isFullScreen) {
    // Save default dimensions if not already saved
    if (!defaultWidth && !defaultHeight) {
      defaultWidth = editorContainer.style.width;
      defaultHeight = editorContainer.style.height;
    }

    // Save current position before expanding
    const currentPositionX = parseFloat(editorContainer.style.left);
    const currentPositionY = parseFloat(editorContainer.style.top);

    // Maximize editor
    editorContainer.style.width = "100vw"; // Set width to viewport width
    editorContainer.style.height = "100vh"; // Set height to viewport height
    editorContainer.style.left = "0";
    editorContainer.style.top = "0";
    editorContainer.style.transform = "none"; // Remove transform to ensure it fits the screen

    isFullScreen = true;
  } else {
    // Restore default dimensions and position
    editorContainer.style.width = defaultWidth || "50%";
    editorContainer.style.height = defaultHeight || "80%";
    editorContainer.style.left = "50%";
    editorContainer.style.top = "50%";
    editorContainer.style.transform = "translate(-50%, -50%)";

    isFullScreen = false;
  }
}

function shutdown() {
  // Ask for confirmation
  const confirmed = window.confirm("Are you sure you want to shut down?");

  // If user confirms, proceed with shutdown process
  if (confirmed) {
    // Load shutdown.html dynamically
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "shutdown.html", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        // Create a div element and set its innerHTML to the content of shutdown.html
        const div = document.createElement("div");
        div.innerHTML = xhr.responseText;
        // Set styles for the div
        div.style.position = "fixed";
        div.style.top = "0";
        div.style.left = "0";
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.backgroundColor = "rgba(0,0,0)";
        div.style.zIndex = "9999";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        // Append the div to the body
        document.body.appendChild(div);

        // Play the sound
        // const audio = new Audio("sfx/shutdown.mp3"); // Replace 'path/to/sound.mp3' with the actual path to your sound file
        // audio.play();

        // Set a timeout to execute Neutralino.app.exit() after 5 seconds
        setTimeout(function () {
          // Remove the shutdown splash screen
          div.parentNode.removeChild(div);
          // Exit the application
          Neutralino.app.exit();
        }, 4000); // 5000 milliseconds = 5 seconds
      }
    };
    xhr.send();
  }
}

const shutdownButton = document.getElementById("shutdown-button");
shutdownButton.addEventListener("click", shutdown);

let isDragging = false;
let initialMouseX, initialMouseY;
let initialEditorX, initialEditorY;

document
  .getElementById("editor-container")
  .addEventListener("mousedown", startDragging);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDragging);

function startDragging(event) {
  isDragging = true;
  initialMouseX = event.clientX;
  initialMouseY = event.clientY;
  const editorContainer = document.getElementById("editor-container");
  const style = window.getComputedStyle(editorContainer);
  initialEditorX = parseFloat(style.left);
  initialEditorY = parseFloat(style.top);
}

function drag(event) {
  if (!isDragging) return;
  const dx = event.clientX - initialMouseX;
  const dy = event.clientY - initialMouseY;
  const editorContainer = document.getElementById("editor-container");
  editorContainer.style.left = initialEditorX + dx + "px";
  editorContainer.style.top = initialEditorY + dy + "px";
}

function stopDragging() {
  isDragging = false;
}
