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

  mergeConfig(newItems) {
    // Replace paso-01 and update/add only the accessories in this config.
    // Accessories added individually from accesorios.html are left untouched.
    const configIds = new Set(newItems.map(i => i.id + '|' + i.color));
    // Remove paso-01 and any acc already in this config (will be re-added fresh)
    this.items = this.items.filter(i => {
      if (i.id === 'paso-01') return false;
      if (configIds.has(i.id + '|' + i.color)) return false;
      return true;
    });
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

  smartTotal() {
    const PACK_DEFS = [
      { name: 'Pack Control + Estante', accs: ['control', 'estante'], price: 509999 },
      { name: 'Pack Gamer',             accs: ['play', 'gancho'],     price: 479999 },
      { name: 'Pack Orden',             accs: ['control', 'soporte'], price: 479999 },
      { name: 'Pack Rack + Estante',    accs: ['estante'],            price: 489999 },
    ];
    const ACC_PRICES = { estante: 49999, control: 24999, play: 19999, soporte: 14999, gancho: 19999 };

    const hasRack = this.items.some(i => i.id === 'paso-01');
    if (!hasRack) return { total: this.total(), pack: null, savings: 0 };

    const accInCart = new Set(
      this.items
        .filter(i => i.id.startsWith('acc-'))
        .map(i => i.id.replace(/^acc-/, '').replace(/-(navy|esmeralda|negro|gris)$/, ''))
    );

    const baseline = this.total();
    if (accInCart.size === 0) return { total: baseline, pack: null, savings: 0 };

    let bestTotal = baseline;
    let bestPack = null;

    for (const def of PACK_DEFS) {
      if (!def.accs.every(a => accInCart.has(a))) continue;
      const remaining = [...accInCart].filter(a => !def.accs.includes(a));
      const remainingCost = remaining.reduce((s, a) => s + (ACC_PRICES[a] || 0), 0);
      const packTotal = def.price + remainingCost;
      if (packTotal < bestTotal) {
        bestTotal = packTotal;
        bestPack = def.name;
      }
    }

    return { total: bestTotal, pack: bestPack, savings: baseline - bestTotal };
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  formatPrice(n) {
    return 'ARS $' + n.toLocaleString('es-AR');
  },

  updateUI() {
    const n = this.count();
    ['cart-count', 'cart-count-nav'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = n;
    });
  },

  updateBadge() { this.updateUI(); }
};

Cart.updateUI();
