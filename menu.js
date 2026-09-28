// Menu search: filters the items as you type, matching on name or code.
(() => {
  const input = document.getElementById('menu-search');
  if (!input) return;

  // Tapping the padding around the field should open the keyboard too
  input.form.addEventListener('click', (e) => {
    if (e.target !== input) input.focus();
  });

  // Enter (the keyboard's "Search" key) closes the keyboard instead of reloading
  input.form.addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur();
  });

  const grid = document.getElementById('menu-grid');
  const empty = document.getElementById('menu-empty');
  const heading = document.getElementById('menu-heading');
  if (!grid) return;   // categories with no items yet

  const items = [...grid.children].map((li) => ({
    el: li,
    text: li.textContent.toLowerCase(),
  }));
  const label = heading.textContent.replace(/\s*\(\d+\)\s*$/, '');

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    for (const item of items) {
      const match = !query || item.text.includes(query);
      item.el.hidden = !match;
      if (match) shown += 1;
    }
    heading.textContent = `${label} (${shown})`;
    empty.hidden = shown > 0;
  };

  input.addEventListener('input', filter);
  input.addEventListener('search', filter);   // Safari's clear (✕) button
})();
