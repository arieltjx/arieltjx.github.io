# Ariel's portfolio

Static portfolio migrated from Ariel's Cargo site. Open `index.html`, or run:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. There is no build step, package install, backend, or Cargo dependency.

## Pages

- `index.html`: landing
- `menu.html`: work menu
- `gallery.html`: 17 photographs
- `design.html`: six projects and 44 slideshow images/animations
- `about.html`: biography and portrait

All 64 media files (including the two original backdrop photos) are stored under `assets/media/`. The photographs and portrait use higher-resolution copies for zooming. Original animated GIFs are preserved.

## GitHub Pages

Upload the contents of this directory to the `arieltjx/arieltjx.github.io` repository. In **Settings → Pages**, choose **Deploy from a branch**, `main`, and `/ (root)`. The expected address after a successful deployment is https://arieltjx.github.io/.

Original Cargo page slugs have local redirects. Domain/DNS changes are separate from this migration.

## Editing

Edit the page HTML to update content, `assets/site.css` for styling, and `assets/site.js` for the slideshow, image viewer, and landing animation.

The original Cargo-only Diatype font is replaced with a system sans-serif. The landing and work-menu backdrops use the exact photographs selected in Cargo (IMG_3367.JPG and cancun_view_05.jpeg). The Ripple effect is independently implemented with each page’s original distortion, scale, speed, direction, and mouse-sensitivity values; the animation is not pixel-identical to Cargo’s renderer. The unused Cargo template pages are retained in the local source archive, outside this public website.

Website text and artwork belong to their respective owner. No Cargo editor files or account configuration are included in this directory.
