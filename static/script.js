document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
});

function closeModal() {
  let modal = document.getElementById("modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

function showNote(noteId) {
  let modal = document.getElementById("modal");
  let modalContent = document.getElementById("modal-content");

  if (!modal || !modalContent) {
    console.error("Error: Modal elements not found");
    return;
  }

  fetch(`/show/${noteId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch note content (HTTP ${response.status})`
        );
      }
      return response.text();
    })
    .then((html) => {
      modalContent.innerHTML = html;
      modal.classList.remove("hidden");
      modal.style.display = "flex";
    })
    .catch((error) => {
      console.error("Error loading note:", error);
      alert("Failed to load the note. Check console for details.");
    });
}

function insertElement(type) {
  let editor = document.getElementById("editor");
  let newElement;

  switch (type) {
    case "h1":
      newElement = "<h1 class='text-2xl font-bold'>Title</h1>";
      break;
    case "h2":
      newElement = "<h2 class='text-xl font-semibold'>Subtitle</h2>";
      break;
    case "img":
      newElement = "<img src='' alt='Image' class='max-w-full mx-auto'/>";
      break;
    case "video":
      newElement =
        "<video controls class='max-w-full mx-auto'><source src='' type='video/mp4'></video>";
      break;
    case "h3":
      newElement = "<h3 class='text-lg font-medium'>Paragraph Title</h3>";
      break;
    case "p":
      newElement = "<p class='text-gray-700'>Paragraph text...</p>";
      break;
    case "a":
      newElement = "<a href='#' class='text-blue-500 underline'>Link</a>";
      break;
    case "blockquote":
      newElement =
        "<blockquote class='border-l-4 border-gray-500 pl-4 italic'>Quote text...</blockquote>";
      break;
    case "code":
      newElement =
        "<pre class='bg-gray-200 p-2 rounded-md'><code>Code block...</code></pre>";
      break;
    case "ol":
      newElement =
        "<ol class='list-decimal ml-6'><li>Item 1</li><li>Item 2</li></ol>";
      break;
    case "ul":
      newElement =
        "<ul class='list-disc ml-6'><li>Item 1</li><li>Item 2</li></ul>";
      break;
    case "table":
      newElement =
        "<table class='w-full border-collapse border border-gray-400'><tr><th class='border border-gray-400 px-2 py-1'>Header 1</th><th class='border border-gray-400 px-2 py-1'>Header 2</th></tr><tr><td class='border border-gray-400 px-2 py-1'>Data 1</td><td class='border border-gray-400 px-2 py-1'>Data 2</td></tr></table>";
      break;
  }

  if (newElement) {
    editor.innerHTML += newElement;
  }
}

function showPopup(id) {
  document.getElementById(id).classList.remove("hidden");
}

function insertImage() {
  let url = document.getElementById("imageUrl").value;
  let editor = document.getElementById("editor");
  if (url) {
    editor.innerHTML += `<img src="${url}" class='max-w-full mx-auto'/>`;
  }
  document.getElementById("imagePopup").classList.add("hidden");
}

function insertVideo() {
  let url = document.getElementById("videoUrl").value;
  let editor = document.getElementById("editor");
  if (url.includes("youtube.com")) {
    let embedUrl = url.replace("watch?v=", "embed/");
    editor.innerHTML += `<iframe width='560' height='315' src='${embedUrl}' frameborder='0' allowfullscreen></iframe>`;
  }
  document.getElementById("videoPopup").classList.add("hidden");
}

function insertTable() {
  let rows = document.getElementById("tableRows").value;
  let cols = document.getElementById("tableCols").value;
  let table = `<table class='border-collapse border border-gray-400 w-full'>`;
  for (let r = 0; r < rows; r++) {
    table += "<tr>";
    for (let c = 0; c < cols; c++) {
      table += "<td class='border border-gray-400 px-2 py-1'>Cell</td>";
    }
    table += "</tr>";
  }
  table += "</table>";
  document.getElementById("editor").innerHTML += table;
  document.getElementById("tablePopup").classList.add("hidden");
}

function insertCode() {
  let language = document.getElementById("codeLanguage").value;
  let code = document.getElementById("codeContent").value;
  let formattedCode = `<pre class='bg-gray-200 p-2 rounded-md'><code class='language-${language}'>${code}</code></pre>`;
  document.getElementById("editor").innerHTML += formattedCode;
  document.getElementById("codePopup").classList.add("hidden");
}

function uploadImage() {
  let fileInput = document.getElementById("imageUpload");
  let file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  let formData = new FormData();
  formData.append("file", file);

  fetch("/upload_image", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.url) {
        insertImage(data.url);
      } else {
        alert("Upload failed: " + data.error);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function insertImage(url) {
  let editor = document.getElementById("editor");
  editor.innerHTML += `<img src="${url}" class='max-w-full mx-auto'/>`;
  document.getElementById("imagePopup").classList.add("hidden");
}

function uploadVideo() {
  let fileInput = document.getElementById("videoUpload");
  let file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  let formData = new FormData();
  formData.append("file", file);

  fetch("/upload_video", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.url) {
        insertVideo(data.url);
      } else {
        alert("Upload failed: " + data.error);
      }
    })
    .catch((error) => console.error("Error:", error));
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  let saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      let content = document.getElementById("editor").innerHTML;
      let noteId = saveButton.getAttribute("data-note-id"); // Ensure this attribute is set

      fetch(`/save/${noteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Note saved successfully!");
          } else {
            alert("Error saving note.");
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }
});

function insertVideo(url) {
  let editor = document.getElementById("editor");
  editor.innerHTML += `<video controls class='max-w-full mx-auto'><source src="${url}" type="video/mp4"></video>`;
  document.getElementById("videoPopup").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  let saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      let content = document.getElementById("editor").innerHTML;
      let noteId = saveButton.getAttribute("data-note-id"); // Ensure this attribute is set

      fetch(`/save/${noteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Note saved successfully!");
          } else {
            alert("Error saving note.");
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }
});

function shareNote(noteId) {
  let recipientUrl = prompt("Enter recipient's app URL:");
  if (!recipientUrl) return;

  fetch(`/share/${noteId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient_url: recipientUrl }),
  })
    .then((response) => response.json())
    .then((data) => alert(data.message || "Note shared successfully"))
    .catch((error) => alert("Failed to share note"));
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  let folderInput = document.querySelector('input[name="name"]');

  if (folderInput) {
    folderInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevents any unintended behavior
        this.form.submit();
      }
    });
  }
});

function openNotePopup() {
  let activeFolderId = localStorage.getItem("activeFolder");
  let folderSelect = document.getElementById("noteFolder");

  if (folderSelect && activeFolderId) {
    folderSelect.value = activeFolderId;
  }

  document.getElementById("notePopup").classList.remove("hidden");
}

function closeNotePopup() {
  document.getElementById("notePopup").classList.add("hidden");
}

function submitNote(event) {
  event.preventDefault(); // Prevent default form submission

  let title = document.getElementById("noteTitle").value;
  let folderId = document.getElementById("noteFolder").value;
  let subtitle = document.getElementById("noteSubtitle").value;

  if (!title || !folderId) {
    alert("Title and folder are required.");
    return;
  }

  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ title, folder_id: folderId, subtitle }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        closeNotePopup();
        window.location.href = "/";
      } else {
        alert("Error creating note: " + data.error);
      }
    })
    .catch((error) => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  let noteForm = document.getElementById("noteForm");
  if (noteForm) {
    noteForm.addEventListener("submit", submitNote);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let activeFolderId = localStorage.getItem("activeFolder");

  if (activeFolderId) {
    let activeElement = document.querySelector(
      `[data-folder-id='${activeFolderId}']`
    );
    if (activeElement) {
      setActiveFolder(activeElement, activeFolderId);
    }
  }
});

function setActiveFolder(selectedElement, folderId) {
  document.querySelectorAll("#folderList li").forEach((folder) => {
    folder.classList.remove("bg-custom-folder", "text-gray-700");
    folder.classList.add("bg-custom-slidebar");
  });
  selectedElement.classList.remove("bg-custom-slidebar");
  selectedElement.classList.add("bg-custom-folder", "text-gray-700");
  localStorage.setItem("activeFolder", folderId);
  fetch(`/get_notes?folder_id=${folderId}`)
    .then((response) => response.json())
    .then((data) => {
      let notesList = document.getElementById("notesList");
      notesList.className = "grid grid-cols-2 gap-4"; // set grid layout
      notesList.innerHTML = "";
      data.forEach((note) => {
        let li = document.createElement("li");
        li.className =
          "group p-6 border-b bg-custom-folder rounded-2xl transition duration-200 hover:rounded-md";
        li.innerHTML = `
          <div class="flex flex-row justify-between">
            <a href="/note/${note.id}" class="block">
              <div class="gap-2 flex flex-col">
                <span class="note-title font-europabold opacity-85 text-lg font-bold">${note.title}</span>
                <p class="note-subtitle font-nexa text-md text-gray-500">${note.subtitle}</p>
              </div>
            </a>
            <div class="flex space-x-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onclick="editNote(${note.id})">
                <img src="/static/svg/edit.svg" alt="Edit" class="w-5 h-5">
              </button>
              <button onclick="deleteNote(${note.id})">
                <img src="/static/svg/delete.svg" alt="Delete" class="w-5 h-5">
              </button>
            </div>
          </div>
        `;
        notesList.appendChild(li);
      });
    })
    .catch((error) => console.error("Error fetching notes:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  const notePopup = document.getElementById("notePopup");
  notePopup.addEventListener("click", (e) => {
    if (e.target === notePopup) closeNotePopup();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const noteForm = document.getElementById("noteForm");
  noteForm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      noteForm.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });
});

function editNote(noteId) {
  window.location.href = `/edit/${noteId}`;
}

let noteToDelete = null;
function deleteNote(noteId) {
  noteToDelete = noteId;
  document.getElementById("deletePopup").classList.remove("hidden");
}
function closeDeletePopup() {
  document.getElementById("deletePopup").classList.add("hidden");
  noteToDelete = null;
}
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", () => {
      if (noteToDelete) {
        fetch(`/delete/${noteToDelete}`, { method: "POST" })
          .then(() => {
            closeDeletePopup();
            window.location.reload();
          })
          .catch((err) => {
            console.error("Error deleting note:", err);
            closeDeletePopup();
          });
      }
    });
});

function editFolder(folderId) {
  const folderLi = document.querySelector(`li[data-folder-id='${folderId}']`);
  const span = folderLi.querySelector(".folder-name");
  const currentName = span.textContent.trim();
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className =
    "folder-name text-xl font-garamond font-bold bg-custom-folder mt-1 ml-4 border-none focus:border-none focus:outline-none";
  folderLi.replaceChild(input, span);
  input.focus();
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      fetch(`/edit_folder/${folderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: input.value }),
      })
        .then((res) => {
          if (res.ok) {
            const newSpan = document.createElement("span");
            newSpan.textContent = input.value;
            newSpan.className =
              "folder-name font-garamond text-xl font-bold mt-1 ml-4";
            folderLi.replaceChild(newSpan, input);
          } else {
            alert("Error updating folder.");
          }
        })
        .catch((err) => {
          console.error("Error updating folder:", err);
          alert("Error updating folder.");
        });
    }
  });
}

let folderToDelete = null;
function deleteFolder(folderId) {
  folderToDelete = folderId;
  document.getElementById("deleteFolderPopup").classList.remove("hidden");
}
function closeDeleteFolderPopup() {
  document.getElementById("deleteFolderPopup").classList.add("hidden");
  folderToDelete = null;
}
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("confirmDeleteFolderButton")
    .addEventListener("click", () => {
      if (folderToDelete) {
        fetch(`/delete_folder/${folderToDelete}`, { method: "POST" })
          .then(() => {
            closeDeleteFolderPopup();
            window.location.reload();
          })
          .catch((err) => {
            console.error("Error deleting folder:", err);
            closeDeleteFolderPopup();
          });
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const titleInput = document.getElementById("noteTitle");
  const subtitleInput = document.getElementById("noteSubtitle");

  titleInput.addEventListener("input", function () {
    if (this.value.length > 67) this.value = this.value.slice(0, 70);
  });

  subtitleInput.addEventListener("input", function () {
    if (this.value.length > 250) this.value = this.value.slice(0, 200);
  });
});
