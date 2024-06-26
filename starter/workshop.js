document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.querySelector("#editor");
  const toolbar = document.querySelector(".toolbar");
  const colorPicker = document.querySelector("#colorPicker");
  const fontSizePicker = document.querySelector("#fontSizePicker");
  const nameWritingType = document.querySelector(".name-writing-type");

  const savedWritingType = localStorage.getItem("selectedWritingType");
  if (savedWritingType) {
    nameWritingType.textContent = savedWritingType;
  } else {
    nameWritingType.textContent = "E-mail"; // Default to E-mail if no type is saved
  }

  textArea.addEventListener('click', function () {
    if (textArea.textContent.length < 21) {
      textArea.textContent = "";
      textArea.removeAttribute("style");
    }
  });

  function formatText(command, value = null) {
    document.execCommand(command, false, value);
  }
  function initializeEditor() {
    const textArea = document.querySelector("#editor");
    const toolbar = document.querySelector(".toolbar");
    const colorPicker = document.querySelector("#colorPicker");
    const fontSizePicker = document.querySelector("#fontSizePicker");
    const nameWritingType = document.querySelector(".name-writing-type");

    const savedWritingType = localStorage.getItem("selectedWritingType");
    if (savedWritingType) {
      nameWritingType.textContent = savedWritingType;
    } else {
      nameWritingType.textContent = "E-mail"; // Default to E-mail if no type is saved
    }
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
    saveEssayLocally(content, nameWritingType.textContent);
  });

  document.querySelector(".check").addEventListener("click", function () {
    const content = textArea.innerHTML;
    checkEssay(content);
  });

  async function saveEssayLocally(content, writingType) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;

    tempElement.querySelectorAll('span[style*="color: red"]').forEach(span => span.remove());

    const cleanedContent = tempElement.innerText;

    const blob = new Blob([cleanedContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${writingType.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function checkEssay(content) {
    const textContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    const response = await fetch('http://localhost:8080/api/essays/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentences: [textContent] })
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
      const correctedTextString = correctedText.join(" ");
      textArea.innerHTML = `<span style="background-color: yellow">${originalText}</span> <span style="color: red;">(${correctedTextString})</span>`;
    } else {
      textArea.innerHTML = `<span style="background-color: yellow">${originalText}</span> <span style="color: red;">(No corrections needed or error in correction process)</span>`;
    }
  }
});