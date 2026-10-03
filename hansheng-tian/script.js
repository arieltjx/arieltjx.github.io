const dialog = document.getElementById('photo-dialog');
const largePhoto = document.getElementById('large-photo');
const caption = document.getElementById('photo-caption');
let lastPhotoButton;
let imageZoom = 100;
const zoomControls = dialog.querySelector(".notebook-zoom-controls");
function setImageZoom(value) {
 imageZoom = Math.max(100, Math.min(250, value));
 largePhoto.style.width = imageZoom + "%";
 document.getElementById("zoom-level").textContent = imageZoom + "%";
 document.getElementById("zoom-out").disabled = imageZoom === 100;
 document.getElementById("zoom-in").disabled = imageZoom === 250;
}
document.getElementById("zoom-in").addEventListener("click", () => setImageZoom(imageZoom + 50));
document.getElementById("zoom-out").addEventListener("click", () => setImageZoom(imageZoom - 50));
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    lastPhotoButton = button;
    const isNotebook = button.id === "notebook-zoom";
    dialog.classList.toggle("notebook-zoom-dialog", isNotebook);
    zoomControls.hidden = !isNotebook;
    largePhoto.style.width = "";
    if (isNotebook) setImageZoom(100);
    largePhoto.src = button.dataset.image;
    largePhoto.alt = button.querySelector('img')?.alt || button.dataset.caption;
    caption.textContent = button.dataset.caption;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});
dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lastPhotoButton?.focus();
});
