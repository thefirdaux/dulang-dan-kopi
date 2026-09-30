// Tempah page: category tabs plus a search that runs across every category
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

  const current = () => tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  const searchEmpty = document.getElementById('search-empty');

  // Filters one category, marking matches; returns how many are left
  const filterPanel = (index, query) => {
    const panel = panels[index];
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
    return shown;
  };

  // An empty box shows the open category; a search shows every category that matches,
  // one after another, with the count of each on its chip.
  const filter = () => {
    const query = input.value.trim().toLowerCase();
    const open = current();
    let found = 0;

    panels.forEach((panel, index) => {
      const shown = filterPanel(index, query);
      found += shown;
      panel.hidden = query ? shown === 0 : index !== open;

      const chip = tabs[index];
      chip.textContent = query ? `${chip.dataset.label} (${shown})` : chip.dataset.label;
      chip.classList.toggle('menu-chip--quiet', Boolean(query) && shown === 0);

      const empty = panel.querySelector(':scope > .menu-empty');
      if (empty) empty.hidden = cards[index].length ? true : Boolean(query);   // "Menu akan datang"
    });

    searchEmpty.hidden = !query || found > 0;
  };

  // While searching, a chip jumps to its category instead of changing tab
  const goTo = (index) => {
    if (panels[index].hidden) return;
    const height = (el) => (el ? el.offsetHeight : 0);
    // The header and the search bar both stick to the top, so clear both
    const sticky = height(document.querySelector('.site-header')) + height(document.querySelector('.menu__bar'));
    const top = panels[index].getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - sticky - 8) });
  };

  const select = (index, { focus = false, scroll = true } = {}) => {
    tabs.forEach((tab, i) => {
      const chosen = i === index;
      tab.setAttribute('aria-selected', String(chosen));
      tab.tabIndex = chosen ? 0 : -1;
    });
    input.value = '';        // a tab shows its whole category
    filter();
    if (focus) tabs[index].focus();
    tabs[index].scrollIntoView({ inline: 'nearest', block: 'nearest' });
    if (scroll) window.scrollTo({ top: 0 });
    history.replaceState(null, '', `#${tabs[index].id.replace('tab-', '')}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      if (input.value.trim()) goTo(index);
      else select(index);
    });
    // Left/right arrows move between tabs, as expected of a tab bar
    tab.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      select((index + step + tabs.length) % tabs.length, { focus: true, scroll: false });
    });
  });

  input.addEventListener('input', filter);
  input.addEventListener('search', filter);   // Safari's clear (✕) button

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
  // Plain items have one Amount row (Figma 129:3303). Drinks sold hot and cold
  // have an Amount (Hot) and an Amount (Cold) row, both starting at 0 (137:3464).
  const sheet = document.getElementById('item-sheet');
  if (sheet) {
    const backdrop = document.getElementById('sheet-backdrop');
    const el = (id) => document.getElementById(id);
    const els = {
      code: el('sheet-code'),
      name: el('sheet-name'),
      description: el('sheet-description'),
      image: el('sheet-image'),
      note: el('sheet-note'),
      total: el('sheet-total'),
      add: el('sheet-add'),
      close: el('sheet-close'),
      rows: { single: el('row-single'), hot: el('row-hot'), cold: el('row-cold') },
      counts: { single: el('sheet-quantity'), hot: el('hot-quantity'), cold: el('cold-quantity') },
      minus: { single: el('sheet-minus'), hot: el('hot-minus'), cold: el('cold-minus') },
      plus: { single: el('sheet-plus'), hot: el('hot-plus'), cold: el('cold-plus') },
    };

    let cart = Cart.read();
    let chosen = null;        // the item the sheet is showing
    let opener = null;        // card to return focus to
    let quantities = { single: 1, hot: 0, cold: 0 };

    window.renderCart(cart);

    const twoPrices = () => Boolean(chosen && chosen.priceCold);
    const totalPrice = () => (twoPrices()
      ? quantities.hot * chosen.price + quantities.cold * chosen.priceCold
      : quantities.single * chosen.price);

    const show = () => {
      for (const key of ['single', 'hot', 'cold']) {
        els.counts[key].textContent = quantities[key];
        els.minus[key].disabled = quantities[key] <= (key === 'single' ? 1 : 0);
      }
      els.total.textContent = `MYR ${totalPrice().toFixed(2)}`;
      // Nothing to add while every amount is zero
      els.add.disabled = twoPrices() && quantities.hot + quantities.cold === 0;
    };

    const open = (card) => {
      opener = card;
      chosen = {
        code: card.querySelector('.menu-card__code').textContent,
        name: card.querySelector('.menu-card__name').textContent,
        price: Number(card.dataset.price ?? card.querySelector('.menu-card__amount').textContent),
        priceCold: card.dataset.priceCold ? Number(card.dataset.priceCold) : null,
        image: card.querySelector('.menu-card__image').style.backgroundImage || '',
        description: card.dataset.description || '',
      };
      els.code.textContent = chosen.code;
      els.name.textContent = chosen.name;
      // Items without a description keep Figma's placeholder line
      els.description.textContent = chosen.description || 'Food Description';
      els.image.style.backgroundImage = chosen.image;
      els.note.value = '';
      quantities = { single: 1, hot: 0, cold: 0 };
      els.rows.single.hidden = twoPrices();
      els.rows.hot.hidden = !twoPrices();
      els.rows.cold.hidden = !twoPrices();
      show();

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

    // Cards open the sheet; they're reachable by keyboard too
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

    for (const key of ['single', 'hot', 'cold']) {
      const floor = key === 'single' ? 1 : 0;
      els.minus[key].addEventListener('click', () => {
        quantities[key] = Math.max(floor, quantities[key] - 1);
        show();
      });
      els.plus[key].addEventListener('click', () => {
        quantities[key] += 1;
        show();
      });
    }

    els.add.addEventListener('click', () => {
      const note = els.note.value.trim();
      if (twoPrices()) {
        if (quantities.hot) {
          cart = Cart.add({ ...chosen, name: `${chosen.name} (Hot)`, code: `${chosen.code}-H` }, quantities.hot, note);
        }
        if (quantities.cold) {
          cart = Cart.add({ ...chosen, name: `${chosen.name} (Cold)`, code: `${chosen.code}-C`, price: chosen.priceCold }, quantities.cold, note);
        }
      } else {
        cart = Cart.add(chosen, quantities.single, note);
      }
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
