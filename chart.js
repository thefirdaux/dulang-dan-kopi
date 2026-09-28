// Your Chart: lists what's in the cart and hands the order to WhatsApp.
(() => {
  // Put the shop's WhatsApp number here, digits only with country code,
  // e.g. '60123456789'. While it's empty the button stays disabled.
  const WHATSAPP_NUMBER = '';

  const list = document.getElementById('chart-list');
  const empty = document.getElementById('chart-empty');
  const orderNo = document.getElementById('order-no');
  const orderTotal = document.getElementById('order-total');
  const send = document.getElementById('order-send');
  if (!list) return;

  const items = Cart.read();

  for (const line of items) {
    const li = document.createElement('li');
    li.className = 'chart-line';
    li.innerHTML = `
      <div class="chart-line__image" aria-hidden="true"></div>
      <div class="chart-line__details">
        <p class="type-caption2"></p>
        <p class="chart-line__name type-callout"></p>
        <p class="chart-line__note type-caption2"></p>
        <p class="type-caption1"></p>
      </div>
      <p class="chart-line__price type-subheadline"></p>`;
    const [code, name, note, qty] = li.querySelectorAll('.chart-line__details p');
    code.textContent = line.code;
    name.textContent = line.name;
    note.textContent = line.note || 'Note';
    qty.textContent = `Qty : ${line.quantity}`;
    if (line.image) li.querySelector('.chart-line__image').style.backgroundImage = line.image;
    li.querySelector('.chart-line__price').textContent = `MYR ${Cart.money(line.price * line.quantity)}`;
    list.append(li);
  }

  empty.hidden = items.length > 0;
  orderNo.textContent = items.length ? Cart.orderNo() : '—';
  orderTotal.textContent = items.length ? `MYR${Cart.money(Cart.total(items))}` : 'MYR00.00';

  // The order as a WhatsApp message
  const message = () => {
    const lines = items.map((line) => {
      const note = line.note ? ` (${line.note})` : '';
      return `• ${line.quantity} × ${line.name}${note} — MYR ${Cart.money(line.price * line.quantity)}`;
    });
    return [
      `Tempahan Dulang&Kopi #${Cart.orderNo()}`,
      '',
      ...lines,
      '',
      `Jumlah: MYR ${Cart.money(Cart.total(items))}`,
    ].join('\n');
  };

  if (!items.length || !WHATSAPP_NUMBER) {
    send.disabled = true;
    return;
  }

  send.addEventListener('click', () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message())}`, '_blank', 'noopener');
  });
})();
