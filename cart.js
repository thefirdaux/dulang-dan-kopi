// Shared cart: kept for this browser tab, so it survives moving between the
// menu and Your Order and a refresh, and empties when the tab is closed.
window.Cart = (() => {
  const KEY = 'dnk-cart';
  const ORDER_KEY = 'dnk-order-no';

  const read = () => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || [];
    } catch {
      return [];   // private browsing, cleared data, etc.
    }
  };

  const write = (items) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* nothing to do — the cart just won't survive the next page */
    }
  };

  // Same dish with the same note counts as one line
  const add = (item, quantity, note) => {
    const items = read();
    const same = items.find((line) => line.code === item.code && line.note === note);
    if (same) {
      same.quantity += quantity;
    } else {
      items.push({ ...item, quantity, note });
    }
    write(items);
    return items;
  };

  const pieces = (items) => items.reduce((n, line) => n + line.quantity, 0);
  const total = (items) => items.reduce((n, line) => n + line.price * line.quantity, 0);
  const money = (amount) => amount.toFixed(2);

  // Which ten-second slot of the day it is in Kuala Lumpur: 0 at midnight,
  // 8639 at 23:59:5x, on the shop's clock whatever the customer's phone says
  const slotOfDay = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date());
    const at = (type) => Number(parts.find((part) => part.type === type).value);
    return Math.floor(((at('hour') % 24) * 3600 + at('minute') * 60 + at('second')) / 10);
  };

  // One order number per visit, always four digits: 1000 at midnight climbing
  // to 9639 by the end of the day. Nothing hands numbers out (there is no
  // server), so the clock keeps them apart — two orders can only share a
  // number if they were placed within the same ten seconds.
  const orderNo = () => {
    const no = String(1000 + slotOfDay());
    try {
      const kept = sessionStorage.getItem(ORDER_KEY);
      if (kept) return kept;
      sessionStorage.setItem(ORDER_KEY, no);
    } catch {
      /* private browsing: the number just isn't kept between pages */
    }
    return no;
  };

  return { read, write, add, pieces, total, money, orderNo };
})();
