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
  }, 10000);

  const newFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(1) .hexagon');
  const openFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(2) .hexagon');
  const saveFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(3) .hexagon');
  const closeFileHexagon = document.querySelector('.hexagon-wrapper:nth-child(4) .hexagon');

  newFileHexagon.addEventListener('click', createNewFile);
  openFileHexagon.addEventListener('click', openFile);
  saveFileHexagon.addEventListener('click', saveFile);
  closeFileHexagon.addEventListener('click', closeFile);

  const editorTask = document.getElementById('editor-task');
  editorTask.addEventListener('click', maximizeEditor); // Maximize the editor when the taskbar button is clicked
});

function createCodeEditor() {
  const editorContainer = document.getElementById('editor-container');
  codeEditor = document.getElementById('code-editor');

  const newFileIcon = document.getElementById('new-file');
  const openFileIcon = document.getElementById('open-file');
  const saveFileIcon = document.getElementById('save-file');
  const closeFileIcon = document.getElementById('close-file');
  const minimizeIcon = document.getElementById('minimize');
  const maximizeIcon = document.getElementById('maximize');

  newFileIcon.addEventListener('click', createNewFile);
  openFileIcon.addEventListener('click', openFile);
  saveFileIcon.addEventListener('click', saveFile);
  closeFileIcon.addEventListener('click', closeFile);
  minimizeIcon.addEventListener('click', minimizeEditor);
  maximizeIcon.addEventListener('click', maximizeEditor);

  editorContainer.classList.remove('hidden');

  const hexagonContainer = document.querySelector('.hexagon-container');
  hexagonContainer.classList.add('hidden');

  codeEditor.addEventListener('input', function() {
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
}

function createNewFile() {
  if (!isFileSaved) {
    alert('Please save or discard changes in the current file before creating a new file.');
    return;
  }

  createCodeEditor();
  codeEditor.value = '';
  codeEditor.style.backgroundColor = 'lightgray';
  currentFileHandle = null;
  
  isFileSaved = false;
}

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

async function saveFile() {
  if (codeEditor) {
    const content = codeEditor.value;
    try {
      if (currentFileHandle) {
        await Neutralino.filesystem.writeFile(currentFileHandle, content);
        codeEditor.style.backgroundColor = 'white';
        isFileSaved = true;
      } else {
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
  editorContainer.classList.remove('hidden');

  const hexagonContainer = document.querySelector('.hexagon-container');
  hexagonContainer.classList.add('hidden');

  const taskbar = document.getElementById('taskbar');
  taskbar.classList.add('hidden'); // Hide the taskbar
}
