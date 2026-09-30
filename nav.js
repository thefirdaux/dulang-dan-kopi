(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const closeButton = nav.querySelector('.site-nav__close');
  const backdrop = document.querySelector('.nav-backdrop');
  const page = document.querySelector('.page');

  const isOpen = () => nav.classList.contains('is-open');

  const setOpen = (open) => {
    if (open) {
      // Drawer and dim layer live in the page, so line them up with what's on screen
      document.documentElement.style.setProperty('--nav-top', `${window.scrollY}px`);
    }
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    // Keep keyboard and screen-reader focus inside the drawer while it's open
    page.inert = open;
    if (open) {
      closeButton.focus();
    } else {
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  closeButton.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));

  // Dropdown groups: each header opens/closes its own list
  nav.querySelectorAll('.nav-group__header').forEach((header) => {
    header.addEventListener('click', () => {
      const open = header.getAttribute('aria-expanded') !== 'true';
      header.setAttribute('aria-expanded', String(open));
      header.closest('.nav-group').classList.toggle('is-open', open);
    });
  });

  // Close after choosing a link
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });

  // Which build this page is running, so a cached copy is easy to spot. It
  // reads the ?v= tag the HTML already carries, so there's nothing to keep
  // in step by hand.
  const build = document.getElementById('build-version');
  if (build) {
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    const version = stylesheet && stylesheet.getAttribute('href').match(/[?&]v=([0-9a-z]+)/);
    build.textContent = version ? `Versi ${version[1]}` : '';
  }
})();
