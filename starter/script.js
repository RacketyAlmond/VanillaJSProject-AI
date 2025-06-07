window.onload = function() {
    const header__title = document.querySelector('.header__title');
    header__title.classList.remove('hidden');
    const section = document.querySelector('.section');
    section.classList.remove('hidden');
};

document.querySelectorAll(".writing-link").forEach(link => {
    link.addEventListener("click", function (e) {
        const writingType = this.getAttribute("data-type");
        localStorage.setItem("currentWritingType", writingType);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});


function selectWriting(filename) {
    const label = getLabelFromFilename(filename);

    const selectedButton = document.querySelector('.selectedOption');
    if (selectedButton) {
        selectedButton.textContent = label + ' ▸';
    }

    const formContent = document.getElementById('formContent');

    fetch(`how_to_write/${filename}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(html => {
            formContent.innerHTML = html;
        })
        .catch(error => {
            formContent.innerHTML = `<p>Content not found for "${page}".</p>`;
            console.error('Error loading content:', error);
        });
    document.getElementById("writingOptions").style.display = 'none';
}



function getLabelFromFilename(filename) {
    const name = filename.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function toggleOptions() {
    const options = document.getElementById("writingOptions");
    if (options.style.display === 'block') {
        options.style.display = 'none';
    } else {
        options.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    selectWriting('essay.html');

    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('writingOptions');
        const button = document.querySelector('.selectedOption');
        if (!button.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
});

document.querySelector("#essayType").addEventListener("click", () => {
    setBackgroundColor("this?element");
});
