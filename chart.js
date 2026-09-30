// Your Order: lists the cart, lets it be changed, and hands the order to WhatsApp.
(() => {
  // Put the shop's WhatsApp number here, digits only with country code,
  // e.g. '60123456789'. While it's empty the button stays disabled.
  const WHATSAPP_NUMBER = '';

  const list = document.getElementById('chart-list');
  const empty = document.getElementById('chart-empty');
  const clear = document.getElementById('chart-clear');
  const orderNo = document.getElementById('order-no');
  const orderTotal = document.getElementById('order-total');
  const send = document.getElementById('order-send');
  if (!list) return;

  let items = Cart.read();

  const money = (amount) => Cart.money(amount);

  // One row per cart line: picture, name and price, note, then edit/delete and the stepper
  const line = (item, index) => {
    const li = document.createElement('li');
    li.className = 'chart-line';
    li.innerHTML = `
      <div class="chart-line__image" aria-hidden="true"></div>
      <div class="chart-line__row">
        <p class="chart-line__name type-subheadline"></p>
        <p class="chart-line__price type-subheadline"></p>
      </div>
      <p class="chart-line__note type-caption2"></p>
      <div class="chart-line__controls">
        <div class="chart-line__buttons">
          <a class="icon-button" href="tempah.html" aria-label="Ubah item"><img src="assets/edit.svg" width="32" height="32" alt=""></a>
          <button class="icon-button" type="button" aria-label="Buang item"><img src="assets/delete.svg" width="32" height="32" alt=""></button>
        </div>
        <div class="sheet__amount">
          <output class="chart-line__quantity type-callout"></output>
          <div class="stepper">
            <button class="stepper__button" type="button" aria-label="Kurangkan kuantiti">&#8722;</button>
            <button class="stepper__button" type="button" aria-label="Tambah kuantiti">&#43;</button>
          </div>
        </div>
      </div>`;

    li.querySelector('.chart-line__name').textContent = item.name;
    li.querySelector('.chart-line__price').textContent = money(item.price * item.quantity);
    const note = li.querySelector('.chart-line__note');
    note.textContent = item.note || '';
    note.hidden = !item.note;
    li.querySelector('.chart-line__quantity').textContent = item.quantity;
    if (item.image) li.querySelector('.chart-line__image').style.backgroundImage = item.image;

    // The pencil goes back to that item on the menu
    const category = item.code.startsWith('DNKR-KS') ? 'lunch'
      : item.code.startsWith('DNKR-DS') ? 'desserts'
      : item.code.startsWith('DNKR-BV') ? 'coffee-drinks'
      : item.code.startsWith('DNKR-MS') ? 'meal-set'
      : 'all-day';
    li.querySelector('.icon-button[href]').href = `tempah.html#${category}`;

    li.querySelector('button.icon-button').addEventListener('click', () => {
      items.splice(index, 1);
      save();
    });

    const [minus, plus] = li.querySelectorAll('.stepper__button');
    minus.disabled = item.quantity <= 1;
    minus.addEventListener('click', () => {
      if (item.quantity <= 1) return;
      item.quantity -= 1;
      save();
    });
    plus.addEventListener('click', () => {
      item.quantity += 1;
      save();
    });

    return li;
  };

  const render = () => {
    list.textContent = '';
    items.forEach((item, index) => list.append(line(item, index)));
    empty.hidden = items.length > 0;
    clear.disabled = items.length === 0;
    orderNo.textContent = items.length ? Cart.orderNo() : '—';
    orderTotal.textContent = items.length ? `RM${money(Cart.total(items))}` : 'RM00.00';
    send.disabled = !items.length || !WHATSAPP_NUMBER;
  };

  const save = () => {
    Cart.write(items);
    render();
  };

  clear.addEventListener('click', () => {
    if (!items.length) return;
    if (!confirm('Kosongkan pesanan anda?')) return;
    items = [];
    save();
  });

  // The order as a WhatsApp message
  const message = () => {
    const lines = items.map((item) => {
      const note = item.note ? ` (${item.note})` : '';
      return `• ${item.quantity} × ${item.name}${note} — RM ${money(item.price * item.quantity)}`;
    });
    return [
      `Tempahan Dulang&Kopi #${Cart.orderNo()}`,
      '',
      ...lines,
      '',
      `Jumlah: RM ${money(Cart.total(items))}`,
    ].join('\n');
  };

  send.addEventListener('click', () => {
    if (send.disabled) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message())}`, '_blank', 'noopener');
  });

  render();
})();
