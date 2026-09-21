(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const backdrop = document.querySelector('.nav-backdrop');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  const isOpen = () => nav.classList.contains('is-open');

  toggle.addEventListener('click', () => {
    setOpen(!isOpen());
    if (isOpen()) nav.querySelector('a').focus();
  });

  // Close after choosing a link, on Escape, or when tapping the backdrop.
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  backdrop.addEventListener('click', () => setOpen(false));
})();
