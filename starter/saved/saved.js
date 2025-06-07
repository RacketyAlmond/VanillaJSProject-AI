window.onload = function () {
  initializeForum();
};

function initializeForum() {
  const savedList = document.getElementById("saved-list");
  const sortButtons = document.querySelectorAll(".sort-buttons button");
  const searchBar = document.getElementById("search-bar");

  let savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];

  displayEssays(savedEssays);

  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const sortedEssays = sortEssaysByType(savedEssays, type);
      displayEssays(sortedEssays);
    });
  });

  searchBar.addEventListener("input", () => {
    const searchText = searchBar.value.toLowerCase();
    const filteredEssays = filterEssaysBySearchText(savedEssays, searchText);
    displayEssays(filteredEssays);
  });
}

function sortEssaysByType(essays, type) {
  if (type.toLowerCase() === "all") {
    return essays;
  } else {
    const lowerCaseType = type.toLowerCase();
    return essays.filter(essay => essay.writingType.toLowerCase() === lowerCaseType);
  }
}

function filterEssaysBySearchText(essays, searchText) {
  return essays.filter(essay => essay.fileName.toLowerCase().includes(searchText));
}

function displayEssays(essays) {
  const savedList = document.getElementById("saved-list");
  savedList.innerHTML = "";

  if (essays.length === 0) {
    savedList.textContent = "No essays saved yet.";
  } else {
    essays.forEach((essay, index) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const button = document.createElement("button");
      button.textContent = essay.fileName;
      button.addEventListener("click", () => {
        showPopup(essay.content, essay.fileName, essay.writingType, index);
      });

      const writingType = document.createElement("span");
      writingType.textContent = essay.writingType;
      writingType.classList.add("writing-type");

      card.appendChild(button);
      card.appendChild(writingType);
      savedList.appendChild(card);
    });
  }
}

function showPopup(content, title, writingType, index) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    modal.remove();
  };

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;

  const writingTypeElement = document.createElement("p");
  writingTypeElement.textContent = `Type: ${writingType}`;
  writingTypeElement.classList.add("popup-writing-type");

  const contentElement = document.createElement("pre");
  contentElement.textContent = content;
  contentElement.classList.add("popup-content");

  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy Text";
  copyButton.classList.add("popup-button");
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(content).then(() => {
      displayNotification("Text copied to clipboard!");
    });
  });

  const copyToWorkshopButton = document.createElement("button");
  copyToWorkshopButton.textContent = "Copy to Workshop";
  copyToWorkshopButton.classList.add("popup-button");
  copyToWorkshopButton.addEventListener("click", () => {
    localStorage.setItem("currentWorkshopText", content);
    localStorage.setItem("currentWritingType", writingType);
    window.location.hash = "#workshop";
  });

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("popup-button");
  deleteButton.addEventListener("click", () => {
    deleteEssay(index);
    modal.remove();
  });

  modalContent.appendChild(closeButton);
  modalContent.appendChild(titleElement);
  modalContent.appendChild(writingTypeElement);
  modalContent.appendChild(contentElement);
  modalContent.appendChild(copyButton);
  modalContent.appendChild(copyToWorkshopButton);
  modalContent.appendChild(deleteButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function displayNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

function deleteEssay(index) {
  const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];
  savedEssays.splice(index, 1);
  localStorage.setItem("savedEssays", JSON.stringify(savedEssays));
  initializeForum();
}
