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

  // One order number per visit
  const orderNo = () => {
    try {
      let no = sessionStorage.getItem(ORDER_KEY);
      if (!no) {
        no = String(Math.floor(100 + Math.random() * 900));
        sessionStorage.setItem(ORDER_KEY, no);
      }
      return no;
    } catch {
      return '—';
    }
  };

  return { read, write, add, pieces, total, money, orderNo };
})();
