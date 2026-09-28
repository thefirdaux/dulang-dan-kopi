// Menu search: filters the items as you type, matching on name or code,
// and highlights the matching letters.
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

  const items = [...grid.children].map((li) => {
    const parts = [li.querySelector('.menu-card__code'), li.querySelector('.menu-card__name')]
      .map((el) => ({ el, text: el.textContent }));
    return {
      el: li,
      parts,
      haystack: parts.map((p) => p.text).join(' ').toLowerCase(),
    };
  });
  const label = heading.textContent.replace(/\s*\(\d+\)\s*$/, '');

  // Rewrites the text with each match wrapped in <mark>
  const mark = (el, text, query) => {
    el.textContent = '';
    if (!query) {
      el.textContent = text;
      return;
    }
    const haystack = text.toLowerCase();
    let from = 0;
    let at = haystack.indexOf(query);
    while (at !== -1) {
      if (at > from) el.append(text.slice(from, at));
      const hit = document.createElement('mark');
      hit.textContent = text.slice(at, at + query.length);
      el.append(hit);
      from = at + query.length;
      at = haystack.indexOf(query, from);
    }
    el.append(text.slice(from));
  };

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    for (const item of items) {
      const match = !query || item.haystack.includes(query);
      item.el.hidden = !match;
      if (match) {
        shown += 1;
        for (const part of item.parts) mark(part.el, part.text, query);
      }
    }
    heading.textContent = `${label} (${shown})`;
    empty.hidden = shown > 0;
  };

  input.addEventListener('input', filter);
  input.addEventListener('search', filter);   // Safari's clear (✕) button
})();
