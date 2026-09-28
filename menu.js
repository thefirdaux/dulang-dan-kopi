// Tempah page: category tabs plus a search that filters the open category
// and highlights the matching letters.
(() => {
  const input = document.getElementById('menu-search');
  const tabs = [...document.querySelectorAll('.menu-chip[role="tab"]')];
  if (!input || !tabs.length) return;

  // Tapping the padding around the field should open the keyboard too
  input.form.addEventListener('click', (e) => {
    if (e.target !== input) input.focus();
  });

  // Enter (the keyboard's "Search" key) closes the keyboard instead of reloading
  input.form.addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur();
  });

  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  // Remember each card's original text so highlighting can be redone from scratch
  const cards = panels.map((panel) =>
    [...panel.querySelectorAll('.menu-card')].map((li) => {
      const parts = [li.querySelector('.menu-card__code'), li.querySelector('.menu-card__name')]
        .map((el) => ({ el, text: el.textContent }));
      return { el: li, parts, haystack: parts.map((p) => p.text).join(' ').toLowerCase() };
    }));

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

  const filter = (index) => {
    const panel = panels[index];
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    for (const card of cards[index]) {
      const match = !query || card.haystack.includes(query);
      card.el.hidden = !match;
      if (match) {
        shown += 1;
        for (const part of card.parts) mark(part.el, part.text, query);
      }
    }
    const heading = panel.querySelector('.menu-heading');
    heading.textContent = `${heading.dataset.label} (${shown})`;
    const empty = panel.querySelector('.menu-empty');
    if (cards[index].length) empty.hidden = shown > 0;
  };

  const select = (index, { focus = false, scroll = true } = {}) => {
    tabs.forEach((tab, i) => {
      const current = i === index;
      tab.setAttribute('aria-selected', String(current));
      tab.tabIndex = current ? 0 : -1;
      panels[i].hidden = !current;
    });
    filter(index);
    if (focus) tabs[index].focus();
    tabs[index].scrollIntoView({ inline: 'nearest', block: 'nearest' });
    if (scroll) window.scrollTo({ top: 0 });
    history.replaceState(null, '', `#${tabs[index].id.replace('tab-', '')}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    // Left/right arrows move between tabs, as expected of a tab bar
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select((index + step + tabs.length) % tabs.length, { focus: true, scroll: false });
    });
  });

  const current = () => tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  input.addEventListener('input', () => filter(current()));
  input.addEventListener('search', () => filter(current()));   // Safari's clear (✕) button

  // ---- Cart bar -------------------------------------------------------
  // Empty: dashed box, "0 items", MYR 00.00 (Figma 131:3319).
  // With items: up to three item pictures stacked, count and total (129:3316).
  // Wire the real cart by calling renderCart([{ name, price, image }, ...]).
  const bar = document.getElementById('cart-bar');
  if (bar) {
    const thumbs = document.getElementById('cart-thumbs');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');

    window.renderCart = (chosen = []) => {
      bar.toggleAttribute('data-empty', chosen.length === 0);
      count.textContent = `${chosen.length} item${chosen.length === 1 ? '' : 's'}`;
      const sum = chosen.reduce((n, item) => n + (item.price || 0) * (item.quantity || 1), 0);
      total.textContent = chosen.length ? sum.toFixed(2) : '00.00';

      thumbs.textContent = '';
      for (const item of chosen.slice(0, 3)) {
        const thumb = document.createElement('span');
        thumb.className = 'cart-bar__thumb';
        if (item.image) thumb.style.backgroundImage = `url("${item.image}")`;
        thumbs.append(thumb);
      }
    };
    window.renderCart([]);
  }

  // Open the category named in the address, e.g. .../tempah.html#desserts
  const fromHash = tabs.findIndex((t) => t.id === `tab-${location.hash.slice(1)}`);
  if (fromHash > 0) select(fromHash, { scroll: false });
})();
