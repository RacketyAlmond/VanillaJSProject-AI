window.onload = function() {
  loadForum();

};
function loadForum() {
  fetch('forum.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;
      const script = document.createElement('script');
      script.src = 'forum.js';
      document.body.appendChild(script);


    })
    .catch(error => console.error('Error loading forum:', error));
}