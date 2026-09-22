(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const closeButton = nav.querySelector('.site-nav__close');
  const backdrop = document.querySelector('.nav-backdrop');
  const page = document.querySelector('.page');

  const isOpen = () => nav.classList.contains('is-open');

  const setOpen = (open) => {
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

  // Close after choosing a link
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
})();
