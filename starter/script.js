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

        // Scroll to top of page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

function toggleOptions() {
    const menu = document.getElementById('writingOptions');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function selectWriting(page) {
    const formContent = document.getElementById('formContent');

    fetch(`how_to_write/${page}`)
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
