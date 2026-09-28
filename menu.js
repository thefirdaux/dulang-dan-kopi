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

    // Categories split into groups (e.g. Lunch): count each and hide empty ones
    for (const group of panel.querySelectorAll('.menu-group')) {
      const left = [...group.querySelectorAll('.menu-card')].filter((card) => !card.hidden).length;
      const title = group.querySelector('.menu-subheading');
      title.textContent = `${title.dataset.label} (${left})`;
      group.hidden = left === 0;
    }

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
  // Shows how many items are in the cart and what they come to.
  // Wire the real cart by calling renderCart([{ name, price, quantity }, ...]).
  const bar = document.getElementById('cart-bar');
  if (bar) {
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');

    window.renderCart = (chosen = []) => {
      bar.toggleAttribute('data-empty', chosen.length === 0);
      // Count the food, not the lines: 2 × Nasi Goreng is "2 items"
      const pieces = Cart.pieces(chosen);
      count.textContent = `${pieces} item${pieces === 1 ? '' : 's'}`;
      total.textContent = chosen.length ? Cart.money(Cart.total(chosen)) : '00.00';
    };
    window.renderCart([]);
  }

  // ---- Add to Cart sheet ----------------------------------------------
  const sheet = document.getElementById('item-sheet');
  if (sheet) {
    const backdrop = document.getElementById('sheet-backdrop');
    const els = {
      code: document.getElementById('sheet-code'),
      name: document.getElementById('sheet-name'),
      image: document.getElementById('sheet-image'),
      note: document.getElementById('sheet-note'),
      quantity: document.getElementById('sheet-quantity'),
      total: document.getElementById('sheet-total'),
      minus: document.getElementById('sheet-minus'),
      plus: document.getElementById('sheet-plus'),
      add: document.getElementById('sheet-add'),
      close: document.getElementById('sheet-close'),
    };

    let cart = Cart.read();
    let chosen = null;        // the item the sheet is showing
    let quantity = 1;
    let opener = null;        // card to return focus to

    window.renderCart(cart);

    const showTotal = () => {
      els.quantity.textContent = quantity;
      els.minus.disabled = quantity <= 1;
      els.total.textContent = `MYR ${(chosen.price * quantity).toFixed(2)}`;
    };

    const open = (card) => {
      opener = card;
      chosen = {
        code: card.querySelector('.menu-card__code').textContent,
        name: card.querySelector('.menu-card__name').textContent,
        price: Number(card.querySelector('.menu-card__amount').textContent),
        image: card.querySelector('.menu-card__image').style.backgroundImage || '',
      };
      els.code.textContent = chosen.code;
      els.name.textContent = chosen.name;
      els.image.style.backgroundImage = chosen.image;
      els.note.value = '';
      quantity = 1;
      showTotal();

      sheet.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.documentElement.classList.add('sheet-open');
      els.close.focus();
    };

    const close = () => {
      sheet.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.documentElement.classList.remove('sheet-open');
      if (opener) opener.focus({ preventScroll: true });
    };

    // Cards open the sheet; they're buttons so keyboards can reach them
    for (const panel of panels) {
      panel.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-card');
        if (card) open(card);
      });
      panel.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.menu-card');
        if (!card) return;
        e.preventDefault();
        open(card);
      });
    }

    els.minus.addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      showTotal();
    });
    els.plus.addEventListener('click', () => {
      quantity += 1;
      showTotal();
    });

    els.add.addEventListener('click', () => {
      cart = Cart.add(chosen, quantity, els.note.value.trim());
      window.renderCart(cart);
      close();
    });

    els.close.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) close();
    });
  }

  // Open the category named in the address, e.g. .../tempah.html#desserts
  const fromHash = tabs.findIndex((t) => t.id === `tab-${location.hash.slice(1)}`);
  if (fromHash > 0) select(fromHash, { scroll: false });
})();
