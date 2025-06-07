const pageTitle = "JS SPA Routing";

const routes = {
  404: "404.html",
  "/": "index.html",
  section_1: "empty.html",
  section_2: "empty.html",
  write: "write/write.html",
  workshop: "workshop.html",
  saved: "saved/saved.html",
  howWrite: "how_to_write/how_to_write.html"
};

const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${url}`));
    document.body.appendChild(script);
  });
};

const locationHandler = async () => {
  const location = window.location.hash.replace("#", "");

  if (!location) return;

  const route = routes[location] || routes[404];

  const html = await fetch(route).then((response) => response.text());
  document.getElementById("content").innerHTML = html;
  document.title = pageTitle;

  const section1 = document.getElementById("section--1");
  const section2 = document.getElementById("section--2");

  if (location === 'workshop') {
    section1.classList.remove("hidden");
    if (section2) section2.classList.add("hidden");
  }
  else if (location === 'save') {
    if (section1) section1.classList.add("hidden");
    if (section2) section2.classList.add("hidden");
  }
  else{
    section1.classList.remove("hidden");
    section2.classList.remove("hidden");
  }


  if (location === 'workshop') {
    initializeEditor();
  } else if (location === 'saved') {
    if (section1) section1.classList.add("hidden");
    if (section2) section2.classList.add("hidden");
    await loadScript('saved/saved.js');
    initializeForum();
  }
};


window.addEventListener("hashchange", locationHandler);
locationHandler();

function setWritingType() {
  const writingType = localStorage.getItem('selectedWritingType');
  if (writingType) {
    const nameWritingType = document.querySelector(".name-writing-type");
    if (nameWritingType) {
      nameWritingType.textContent = writingType;
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const writingLinks = document.querySelectorAll('.writing-link');
  writingLinks.forEach(link => {
    link.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      localStorage.setItem('selectedWritingType', type);
    });
  });
});

function initializeEditor() {
  const textArea = document.querySelector("#editor");
  const toolbar = document.querySelector(".toolbar");
  const colorPicker = document.querySelector("#colorPicker");
  const fontSizePicker = document.querySelector("#fontSizePicker");
  const nameWritingType = document.querySelector(".name-writing-type");

  const writingType = localStorage.getItem('currentWritingType');
  if (writingType) {
    nameWritingType.textContent = writingType;
  }
  const currentWorkshopText = localStorage.getItem("currentWorkshopText");
  const currentWritingType = localStorage.getItem("currentWritingType");

  if (currentWorkshopText) {
    textArea.innerHTML = currentWorkshopText;
    localStorage.removeItem("currentWorkshopText");
  }

  if (currentWritingType) {
    nameWritingType.textContent = currentWritingType;
    localStorage.removeItem("currentWritingType");
  } else {
    nameWritingType.textContent = "Email";
  }

  textArea.addEventListener('click', function () {
    if (textArea.textContent.length <= 20) {
      textArea.textContent = "";
      textArea.removeAttribute("style");
    }
  });

  function formatText(command, value = null) {
    document.execCommand(command, false, value);
  }

  toolbar.querySelectorAll(".format-button").forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.getAttribute("data-command");
      if (command === "insertImage") {
        const imageUrl = prompt("Enter image URL:");
        if (imageUrl) {
          formatText("insertImage", imageUrl);
        }
      } else {
        formatText(command);
      }
    });
  });

  colorPicker.addEventListener("change", function () {
    formatText("foreColor", this.value);
  });

  fontSizePicker.addEventListener("change", function () {
    formatText("fontSize", this.value);
  });

  document.querySelector(".save").addEventListener("click", function () {
    const content = textArea.innerHTML;
    saveEssayLocally(content);
  });

  document.querySelector(".check").addEventListener("click", function () {
    const content = textArea.innerHTML;
    checkEssay(content);
  });

  function saveEssayLocally(content) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    tempElement.querySelectorAll('span[style*="color: red"]').forEach(span => span.remove());
    const cleanedContent = tempElement.innerText;
    const fileName = prompt("Enter a name for your essay:");

    if (!fileName) {
      alert("You must provide a file name.");
      return;
    }

    const writingType = localStorage.getItem('selectedWritingType') || "Unknown";

    const blob = new Blob([cleanedContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const essay = {
      fileName: `${fileName}.txt`,
      content: cleanedContent,
      writingType: writingType
    };

    const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];
    savedEssays.push(essay);
    localStorage.setItem("savedEssays", JSON.stringify(savedEssays));
  }

  async function checkEssay(content) {
    const textContent = content.replace(/<\/?[^>]+(>|$)/g, "");
    const response = await fetch('http://localhost:8080/api/essays/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentences: [`<pl>${textContent}`] })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Received corrected text:", result.correctedText);
      displayCorrectedEssay(textContent, result.correctedText);
    } else {
      console.error('Failed to check essay');
    }
  }

  function displayCorrectedEssay(originalText, correctedText) {
    console.log("Corrected text:", correctedText);
    if (Array.isArray(correctedText) && correctedText.length > 0) {
      const correctedTextString = correctedText[0];
      textArea.innerHTML = `<span>${originalText}</span> <span style="color: red;">(${correctedTextString})</span>`;
    } else {
      textArea.innerHTML = `<span>${originalText}</span> <span style="color: red;">(No corrections needed or error in correction process)</span>`;
    }
  }
}
