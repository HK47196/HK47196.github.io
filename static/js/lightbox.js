const images = Array.from(document.querySelectorAll('article img')).filter(image => image.naturalWidth > image.width);
const lightbox = document.getElementById('lightbox');
const closeButton = document.getElementById('closeButton');

const close_lightbox = (event) => {
  if (lightbox.style.display !== 'none') {
    lightbox.style.display = 'none';
  }
	document.removeEventListener('click', close_lightbox);
};


images.forEach(image => {
	image.setAttribute('data-scaled-down', '');
  image.addEventListener('click', () => {
    const imageSrc = image.src;
    lightboxImage.src = imageSrc;
    lightbox.style.display = 'block';
		event.stopPropagation(); // Prevent click from bubbling up to document
		document.addEventListener('click', close_lightbox);
  });
});

// Close lightbox on Esc key press
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.style.display === 'block') {
    lightbox.style.display = 'none';
  }
	document.removeEventListener('click', close_lightbox);
});

