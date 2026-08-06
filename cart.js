/* ── CART STATE ── */
const CORRECT_PRICES = { 'paso-01': 450000 };

const Cart = {
  items: JSON.parse(localStorage.getItem('paso-cart') || '[]').map(i =>
    CORRECT_PRICES[i.id] ? { ...i, price: CORRECT_PRICES[i.id] } : i
  ),

  save() {
    localStorage.setItem('paso-cart', JSON.stringify(this.items));
    this.updateUI();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id && i.color === product.color);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, qty: product.qty || 1 });
    }
    this.save();
  },

  get() {
    return this.items;
  },

  replaceConfig(newItems) {
    // Remove all previously configured items (paso-01 + acc-*) and set fresh ones
    this.items = this.items.filter(i => !i.id.startsWith('acc-') && i.id !== 'paso-01');
    newItems.forEach(p => this.items.push({ ...p, qty: p.qty || 1 }));
    this.save();
  },

  remove(id, color) {
    this.items = this.items.filter(i => !(i.id === id && i.color === color));
    this.save();
  },

  updateQty(id, color, qty) {
    const item = this.items.find(i => i.id === id && i.color === color);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save();
    }
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  formatPrice(n) {
    return 'ARS $' + n.toLocaleString('es-AR');
  },

  updateUI() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = this.count();
  }
};

Cart.updateUI();
