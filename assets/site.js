(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gallery = document.querySelector('.photo-gallery');
  if (gallery) {
    const items = [...gallery.querySelectorAll('.image-open')];
    let previousWidth = 0;
    function layoutPhotos() {
      const width = gallery.clientWidth;
      if (!width || width === previousWidth) return;
      previousWidth = width;
      const gap = parseFloat(getComputedStyle(gallery).gap);
      const target = width * (innerWidth <= 700 ? .38 : .165);
      let row = [], ratio = 0;
      function finish() {
        const height = (width - gap * (row.length - 1)) / ratio;
        row.forEach(({button, aspect}) => {
          button.style.flex = 'none';
          button.style.width = `${height * aspect}px`;
          button.style.height = `${height}px`;
        });
        row = []; ratio = 0;
      }
      items.forEach(button => {
        const img = button.querySelector('img');
        const aspect = Number(img.getAttribute('width')) / Number(img.getAttribute('height'));
        if (row.length && Math.abs(ratio * target + gap * (row.length - 1) - width) < Math.abs((ratio + aspect) * target + gap * row.length - width)) finish();
        row.push({button, aspect}); ratio += aspect;
      });
      if (row.length) finish();
    }
    new ResizeObserver(layoutPhotos).observe(gallery);
    layoutPhotos();
  }
  const dialog = document.querySelector('.lightbox');
  const viewer = dialog.querySelector('img');
  let viewing = [], viewed = 0, opener;
  function showImage(delta = 0) {
    viewed = (viewed + delta + viewing.length) % viewing.length;
    viewer.src = viewing[viewed].src;
    viewer.alt = viewing[viewed].alt;
    dialog.querySelector('.lightbox-count').textContent = `${viewed + 1} / ${viewing.length}`;
  }
  document.querySelectorAll('.image-open').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      const group = button.closest('.slideshow, .photo-gallery') || button;
      viewing = [...group.querySelectorAll('img')];
      viewed = viewing.indexOf(button.querySelector('img'));
      showImage(); dialog.showModal(); document.body.classList.add('no-scroll');
    });
  });
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-previous').addEventListener('click', () => showImage(-1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => showImage(1));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('no-scroll'); viewer.removeAttribute('src'); opener?.focus(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showImage(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  document.querySelectorAll('.slideshow').forEach(slideshow => {
    const slides = [...slideshow.querySelectorAll('.slide')];
    let current = 0, hovering = false, visible = false, paused = reduced;
    const play = slideshow.querySelector('.play-toggle');
    const count = slideshow.querySelector('.slide-count');
    function updatePlay() { play.textContent = paused ? '▶' : 'Ⅱ'; play.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); }
    function advance(delta) {
      slides[current].hidden = true; slides[current].classList.remove('active');
      current = (current + delta + slides.length) % slides.length;
      slides[current].hidden = false; slides[current].classList.add('active');
      count.textContent = `${current + 1} / ${slides.length}`;
    }
    slideshow.querySelector('.previous').addEventListener('click', () => advance(-1));
    slideshow.querySelector('.next').addEventListener('click', () => advance(1));
    play.addEventListener('click', () => { paused = !paused; updatePlay(); });
    slideshow.addEventListener('pointerenter', () => hovering = true);
    slideshow.addEventListener('pointerleave', () => hovering = false);
    slideshow.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); advance(event.key === 'ArrowLeft' ? -1 : 1); }
    });
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(slideshow);
    setInterval(() => { if (visible && !paused && !hovering && !document.hidden && !dialog.open && !slideshow.contains(document.activeElement)) advance(1); }, Number(slideshow.dataset.delay) * 1000);
    updatePlay();
  });
})();
