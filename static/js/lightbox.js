const setupLightbox = () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeButton = document.getElementById('closeButton');

  if (!lightbox || !lightboxImage || !closeButton) {
    return;
  }

  const closeLightbox = () => {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
  };

  const openLightbox = (image) => {
    lightboxImage.src = image.src;
    lightbox.setAttribute('aria-hidden', 'false');
  };

  Array.from(document.querySelectorAll('article img'))
    .filter((image) => image.naturalWidth > image.clientWidth)
    .forEach((image) => {
      image.setAttribute('data-scaled-down', '');
      image.addEventListener('click', (event) => {
        event.stopPropagation();
        openLightbox(image);
      });
    });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', closeLightbox);
  lightboxImage.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
};

window.addEventListener('load', setupLightbox);
