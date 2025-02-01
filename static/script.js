document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
});

function showNote(noteId) {
  let modal = document.getElementById("modal");
  let modalContent = document.getElementById("modal-content");

  if (!modal || !modalContent) {
    console.error("Error: Modal elements not found");
    return;
  }

  fetch(`/templates/show/${noteId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch note content");
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
    });
}

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
