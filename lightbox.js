function openLightbox(imageSrc) {
    document.getElementById('lightbox').style.display = 'block';
    document.getElementById('lightbox-img').src = imageSrc;
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}
