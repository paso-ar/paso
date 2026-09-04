(function () {
  /* ── ESTILOS ── */
  const style = document.createElement('style');
  style.textContent = `
    /* Fondo borroso de la página */
    #acc-backdrop {
      position: fixed; inset: 0; z-index: 800;
      backdrop-filter: blur(10px) brightness(0.92);
      -webkit-backdrop-filter: blur(10px) brightness(0.92);
      background: rgba(239,233,220,0.35);
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s ease;
    }
    #acc-backdrop.open { opacity: 1; pointer-events: all; }

    /* Panel — "página más chica" */
    #acc-panel {
      position: fixed;
      top: 72px;
      left: 5vw; right: 5vw;
      bottom: 5vh;
      z-index: 801;
      background: #faf8f6;
      border: 0.5px solid rgba(42,38,35,0.14);
      border-radius: 2rem;
      overflow: hidden;
      display: flex; flex-direction: column;
      opacity: 0; pointer-events: none;
      transform: translateY(-10px) scale(0.99);
      transition: opacity 0.28s ease, transform 0.28s ease;
    }
    #acc-panel.open {
      opacity: 1; pointer-events: all;
      transform: translateY(0) scale(1);
    }

    /* Barra superior del panel */
    #acc-panel .ap-header {
      flex-shrink: 0;
      display: flex; justify-content: space-between; align-items: center;
      padding: 2rem 3.2rem 1.6rem;
      border-bottom: 0.5px solid rgba(42,38,35,0.1);
    }
    #acc-panel .ap-title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.1rem; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #b92c1d;
    }
    #acc-panel .ap-close {
      background: none; border: 1px solid rgba(42,38,35,0.18);
      border-radius: 10rem;
      cursor: pointer; color: #2A2623;
      font-size: 1.3rem; line-height: 1;
      padding: 0.5rem 1.2rem;
      font-family: 'Poppins', sans-serif;
      transition: background 0.2s, color 0.2s;
    }
    #acc-panel .ap-close:hover { background: #2A2623; color: #faf8f6; }

    /* Scroll interior */
    #acc-panel .ap-body {
      flex: 1; overflow-y: auto;
      padding: 2.4rem 3.2rem;
    }

    /* Filas de accesorios */
    #acc-panel .ap-row {
      display: flex; align-items: center;
      gap: 2.4rem;
      padding: 1.6rem 0;
      border-bottom: 0.5px solid rgba(42,38,35,0.07);
    }
    #acc-panel .ap-row:last-child { border-bottom: none; }

    #acc-panel .ap-info { min-width: 200px; }
    #acc-panel .ap-name {
      font-family: 'Poppins', sans-serif;
      font-size: 1.5rem; font-weight: 500;
      color: #2A2623;
    }
    #acc-panel .ap-price {
      font-family: 'Poppins', sans-serif;
      font-size: 1.2rem; color: #2A2623;
      margin-top: 4px;
    }

    /* Celdas de imagen */
    #acc-panel .ap-images { display: flex; gap: 10px; flex-wrap: wrap; }
    #acc-panel .ap-cell {
      width: 88px; height: 88px;
      border-radius: 12px;
      overflow: hidden; position: relative;
      cursor: pointer; flex-shrink: 0;
      background: #ede9e3;
      transition: box-shadow 0.2s;
    }
    #acc-panel .ap-cell:hover { box-shadow: inset 0 0 0 1.5px rgba(42,38,35,0.25); }
    #acc-panel .ap-cell.in-cart { box-shadow: inset 0 0 0 2.5px #2A2623; }

    #acc-panel .ap-cell img {
      width: 100%; height: 100%; object-fit: cover;
      transition: opacity 0.28s;
    }
    #acc-panel .ap-cell .img-h {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      opacity: 0;
    }
    #acc-panel .ap-cell:hover .img-h { opacity: 1; }
    #acc-panel .ap-cell:hover img:not(.img-h) { opacity: 0; }

    /* Control de cantidad */
    #acc-panel .ap-qty {
      position: absolute; bottom: 5px; left: 50%;
      transform: translateX(-50%);
      display: flex; align-items: center; gap: 4px;
      background: #2A2623; border-radius: 10rem;
      padding: 2px 6px; white-space: nowrap;
    }
    #acc-panel .ap-qty-btn {
      background: none; border: none; color: #faf8f6;
      font-size: 1.4rem; font-weight: 400; line-height: 1;
      cursor: pointer; padding: 0 2px;
      font-family: 'Poppins', sans-serif;
    }
    #acc-panel .ap-qty-btn:disabled { opacity: 0.3; cursor: default; }
    #acc-panel .ap-qty-num {
      color: #faf8f6; font-family: 'Poppins', sans-serif;
      font-size: 1.1rem; font-weight: 500;
      min-width: 12px; text-align: center;
    }

    /* Drawer carrito — derecha, mitad inferior */
    #acc-minicart {
      position: fixed;
      bottom: calc(5vh + 2rem); right: calc(5vw + 2rem);
      top: auto;
      height: clamp(320px, 46vh, 500px);
      width: clamp(260px, 28vw, 360px);
      z-index: 802;
      background: #faf8f6;
      border: 0.5px solid rgba(42,38,35,0.12);
      border-radius: 2rem;
      box-shadow: 0 8px 32px rgba(42,38,35,0.1), 0 2px 8px rgba(42,38,35,0.06);
      display: flex; flex-direction: column;
      opacity: 0;
      transform: translateX(calc(100% + 5vw + 40px));
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
      pointer-events: none;
      overflow: hidden;
      clip-path: inset(0 0 0 0 round 2rem);
    }
    #acc-minicart.visible { opacity: 1; transform: translateX(0); pointer-events: all; }

    #acc-minicart .mc-header {
      flex-shrink: 0;
      padding: 1.6rem 2rem 1.4rem;
      border-bottom: 0.5px solid rgba(42,38,35,0.1);
      display: flex; justify-content: space-between; align-items: center;
    }
    #acc-minicart .mc-title {
      font-family: 'Poppins', sans-serif; font-size: 1rem; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #9B8065;
    }
    #acc-minicart .mc-count-badge {
      background: #b92c1d; color: #faf8f6;
      font-family: 'Poppins', sans-serif; font-size: 1rem; font-weight: 600;
      border-radius: 10rem; padding: 0.15rem 0.8rem;
    }

    #acc-minicart .mc-items {
      flex: 1; overflow-y: auto;
      padding: 1.4rem 2rem;
      display: flex; flex-direction: column; gap: 1.2rem;
    }
    #acc-minicart .mc-item {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 1rem;
    }
    #acc-minicart .mc-item-info { flex: 1; }
    #acc-minicart .mc-item-name {
      font-family: 'Poppins', sans-serif; font-size: 1.2rem; font-weight: 500;
      color: #2A2623; line-height: 1.4;
    }
    #acc-minicart .mc-item-sub {
      font-family: 'Poppins', sans-serif; font-size: 1rem;
      color: #9B8065; margin-top: 2px;
    }
    #acc-minicart .mc-item-price {
      font-family: 'Poppins', sans-serif; font-size: 1.2rem; font-weight: 500;
      color: #2A2623; white-space: nowrap;
    }

    #acc-minicart .mc-footer {
      flex-shrink: 0;
      padding: 1.4rem 2rem 2rem;
      border-top: 0.5px solid rgba(42,38,35,0.1);
    }
    #acc-minicart .mc-total-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.2rem;
    }
    #acc-minicart .mc-total-label {
      font-family: 'Poppins', sans-serif; font-size: 1rem;
      color: #9B8065; text-transform: uppercase; letter-spacing: 0.08em;
    }
    #acc-minicart .mc-total {
      font-family: 'Poppins', sans-serif; font-size: 1.5rem; font-weight: 600;
      color: #2A2623;
    }
    #acc-minicart .mc-btn {
      display: block; width: 100%;
      background: #2A2623; color: #faf8f6;
      border: none; border-radius: 10rem;
      font-family: 'Poppins', sans-serif; font-size: 1.2rem; font-weight: 500;
      padding: 1rem; cursor: pointer; text-align: center;
      text-decoration: none;
      transition: background 0.2s;
    }
    #acc-minicart .mc-btn:hover { background: #3d3835; }

    @media (max-width: 768px) {
      #acc-panel { top: 56px; left: 0; right: 0; bottom: 0; border-radius: 1.6rem 1.6rem 0 0; border-left: none; border-right: none; border-bottom: none; }
      #acc-panel .ap-body { padding: 0; }
      #acc-panel .ap-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.2rem;
        padding: 2rem 2rem 2.4rem;
      }
      #acc-panel .ap-info { min-width: unset; }
      #acc-panel .ap-name { font-size: 1.6rem; }
      #acc-panel .ap-images {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        gap: 1rem;
        width: 100%;
        padding-bottom: 0.4rem;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      #acc-panel .ap-images::-webkit-scrollbar { display: none; }
      #acc-panel .ap-cell { width: 100px; height: 100px; flex-shrink: 0; }
      #acc-minicart { bottom: 0; right: 0; left: 0; top: auto; width: 100%; height: auto; border-radius: 1.2rem 1.2rem 0 0; transform: translateX(0) translateY(100%); }
      #acc-minicart.visible { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  /* ── DATOS ── */
  const ACCS = [
    {
      id: 'estante', name: 'Estante', price: 49999,
      colors: [
        { color: 'navy',  name: 'Azul',  img1: 'assets/images/accesorios%20azules/estantes1azul.png',          img2: 'assets/images/accesorios%20azules/estante2azul.png' },
        { color: 'verde', name: 'Verde', img1: 'assets/images/accesorios%20verde/estante1verde.png',            img2: 'assets/images/accesorios%20verde/estante2verde.png' },
        { color: 'gris',  name: 'Gris',  img1: 'assets/images/accesorios%20gris/estante1gris.png',             img2: 'assets/images/accesorios%20gris/estante2gris.png' },
        { color: 'negro', name: 'Negro', img1: 'assets/images/accesorios%20negro/estante1negro.png',            img2: 'assets/images/accesorios%20negro/estante2negro.png' },
      ]
    },
    {
      id: 'control', name: 'Box · control', price: 24999,
      colors: [
        { color: 'navy',  name: 'Azul',  img1: 'assets/images/accesorios%20azules/boxcontrolremoto1azul.png',  img2: 'assets/images/accesorios%20azules/boxcontrolremoto2azul.png' },
        { color: 'verde', name: 'Verde', img1: 'assets/images/accesorios%20verde/boxcontrolremoto1verde.png',  img2: 'assets/images/accesorios%20verde/boxcontrolremoto2verde.png' },
        { color: 'gris',  name: 'Gris',  img1: 'assets/images/accesorios%20gris/bozcontrolremoto1gris.png',   img2: 'assets/images/accesorios%20gris/boxcontrolremoto2gris.png' },
        { color: 'negro', name: 'Negro', img1: 'assets/images/accesorios%20negro/boxcontrolremoto1negor.png', img2: 'assets/images/accesorios%20negro/boxcontrolremoto2negro.png' },
      ]
    },
    {
      id: 'play', name: 'Soporte · play/xbox', price: 19999,
      colors: [
        { color: 'navy',  name: 'Azul',  img1: 'assets/images/accesorios%20azules/play1azul.png',             img2: 'assets/images/accesorios%20azules/play2azul.png' },
        { color: 'verde', name: 'Verde', img1: 'assets/images/accesorios%20verde/play1verde.png',             img2: 'assets/images/accesorios%20verde/play2verde.png' },
        { color: 'gris',  name: 'Gris',  img1: 'assets/images/accesorios%20gris/play1gris.png',              img2: 'assets/images/accesorios%20gris/play2gris.png' },
        { color: 'negro', name: 'Negro', img1: 'assets/images/accesorios%20negro/play1negro.png',            img2: 'assets/images/accesorios%20negro/play2negro.png' },
      ]
    },
    {
      id: 'gancho', name: 'Soporte · joystick', price: 19999,
      colors: [
        { color: 'navy',  name: 'Azul',  img1: 'assets/images/accesorios%20azules/ganchoplay1azul.png',      img2: 'assets/images/accesorios%20azules/ganchoplay2azul.png' },
        { color: 'verde', name: 'Verde', img1: 'assets/images/accesorios%20verde/ganchoplay1verde.png',      img2: 'assets/images/accesorios%20verde/ganchoplay2verde.png' },
        { color: 'gris',  name: 'Gris',  img1: 'assets/images/accesorios%20gris/ganchoplay1gris.png',       img2: 'assets/images/accesorios%20gris/ganchoplay2gris.png' },
        { color: 'negro', name: 'Negro', img1: 'assets/images/accesorios%20negro/ganchoplay1negro.png',     img2: 'assets/images/accesorios%20negro/ganchoplay2negro.png' },
      ]
    },
    {
      id: 'soporte', name: 'Soporte · cable', price: 14999,
      colors: [
        { color: 'navy',  name: 'Azul',  img1: 'assets/images/accesorios%20azules/ganchocable1azul.png',    img2: 'assets/images/accesorios%20azules/ganchocable2azul.png' },
        { color: 'verde', name: 'Verde', img1: 'assets/images/accesorios%20verde/ganchocable1verde.png',    img2: 'assets/images/accesorios%20verde/ganchocable2verde.png' },
        { color: 'gris',  name: 'Gris',  img1: 'assets/images/accesorios%20gris/ganchocable1gris.png',     img2: 'assets/images/accesorios%20gris/gachocable2gris.png' },
        { color: 'negro', name: 'Negro', img1: 'assets/images/accesorios%20negro/ganchocable1negro.png',   img2: 'assets/images/accesorios%20negro/ganchocable2negro.png' },
      ]
    },
  ];

  /* ── ESTADO LOCAL DEL CARRITO ── */
  const localCart = {}; // { cartId: { name, price, qty } }

  function cartTotals() {
    const ids = Object.keys(localCart);
    const items = ids.reduce((n, id) => n + localCart[id].qty, 0);
    const total = ids.reduce((s, id) => s + localCart[id].price * localCart[id].qty, 0);
    return { items, total };
  }

  function updateMiniCart() {
    const mc = document.getElementById('acc-minicart');
    if (!mc) return;
    const ids = Object.keys(localCart);
    const totalItems = ids.reduce((n, id) => n + localCart[id].qty, 0);
    const totalPrice = ids.reduce((s, id) => s + localCart[id].price * localCart[id].qty, 0);

    mc.querySelector('.mc-count-badge').textContent = totalItems;
    mc.querySelector('.mc-total').textContent = '$' + totalPrice.toLocaleString('es-AR');

    const list = mc.querySelector('.mc-items');
    list.innerHTML = ids.map(id => {
      const it = localCart[id];
      const subtotal = it.price * it.qty;
      return `
        <div class="mc-item">
          <div class="mc-item-info">
            <div class="mc-item-name">${it.name}</div>
            <div class="mc-item-sub">${it.colorName} · x${it.qty}</div>
          </div>
          <div class="mc-item-price">$${subtotal.toLocaleString('es-AR')}</div>
        </div>
      `;
    }).join('');

    mc.classList.toggle('visible', totalItems > 0);
  }

  /* ── CONSTRUIR PANEL ── */
  function buildPanel() {
    const backdrop = document.createElement('div');
    backdrop.id = 'acc-backdrop';
    document.body.appendChild(backdrop);

    const panel = document.createElement('div');
    panel.id = 'acc-panel';
    panel.innerHTML = `
      <div class="ap-header">
        <span class="ap-title">Accesorios · paso · 01</span>
        <button class="ap-close" aria-label="Cerrar panel">Cerrar</button>
      </div>
      <div class="ap-body">
        ${ACCS.map(acc => `
          <div class="ap-row" data-id="${acc.id}" data-price="${acc.price}">
            <div class="ap-info">
              <div class="ap-name">${acc.name}</div>
              <div class="ap-price">$${acc.price.toLocaleString('es-AR')}</div>
            </div>
            <div class="ap-images">
              ${acc.colors.map(c => `
                <div class="ap-cell" data-color="${c.color}" data-color-name="${c.name}"
                     title="${c.name}">
                  <img src="${c.img1}" alt="${acc.name} ${c.name}">
                  <img class="img-h" src="${c.img2}" alt="">
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    document.body.appendChild(panel);

    /* mini carrito */
    const mc = document.createElement('div');
    mc.id = 'acc-minicart';
    mc.innerHTML = `
      <div class="mc-header">
        <span class="mc-title">Carrito</span>
        <span class="mc-count-badge">0</span>
      </div>
      <div class="mc-items"></div>
      <div class="mc-footer">
        <div class="mc-total-row">
          <span class="mc-total-label">Total</span>
          <span class="mc-total">$0</span>
        </div>
        <a href="carrito.html" class="mc-btn">Completar compra</a>
      </div>
    `;
    document.body.appendChild(mc);

    panel.querySelector('.ap-close').addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

    panel.querySelectorAll('.ap-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        if (cell.querySelector('.ap-qty')) return;
        const row = cell.closest('.ap-row');
        const cartId = `acc-${row.dataset.id}-${cell.dataset.color}`;
        const name = row.querySelector('.ap-name').textContent.trim();
        const price = parseInt(row.dataset.price);
        localCart[cartId] = { name, price, qty: 1, colorName: cell.dataset.colorName };
        if (typeof Cart !== 'undefined' && Cart.add) {
          Cart.add({ id: cartId, name, color: cell.dataset.color, colorName: cell.dataset.colorName, price, qty: 1 });
          if (typeof Cart.updateBadge === 'function') Cart.updateBadge();
        }
        cell.classList.add('in-cart');
        updateMiniCart();
        spawnQty(cell, row, cartId);
      });
    });
  }

  function spawnQty(cell, row, cartId) {
    let qty = 1;
    const ctrl = document.createElement('div'); ctrl.className = 'ap-qty';
    const btnM = document.createElement('button'); btnM.className = 'ap-qty-btn'; btnM.textContent = '−';
    const num  = document.createElement('span');   num.className  = 'ap-qty-num'; num.textContent = '1';
    const btnP = document.createElement('button'); btnP.className = 'ap-qty-btn'; btnP.textContent = '+';
    ctrl.append(btnM, num, btnP);
    cell.appendChild(ctrl);

    function render() {
      num.textContent = qty;
      btnP.disabled = qty >= 10;
      if (qty <= 0) { ctrl.remove(); cell.classList.remove('in-cart'); }
    }

    btnP.addEventListener('click', e => {
      e.stopPropagation();
      if (qty >= 10) return;
      qty++;
      if (localCart[cartId]) localCart[cartId].qty = qty;
      if (typeof Cart !== 'undefined' && Cart.add) {
        Cart.add({ id: cartId, name: row.querySelector('.ap-name').textContent.trim(), color: cell.dataset.color, colorName: cell.dataset.colorName, price: parseInt(row.dataset.price), qty: 1 });
        if (typeof Cart.updateBadge === 'function') Cart.updateBadge();
      }
      updateMiniCart();
      render();
    });

    btnM.addEventListener('click', e => {
      e.stopPropagation();
      qty--;
      if (localCart[cartId]) localCart[cartId].qty = qty;
      if (qty <= 0) delete localCart[cartId];
      if (typeof Cart !== 'undefined') {
        if (qty > 0 && Cart.updateQty) Cart.updateQty(cartId, cell.dataset.color, qty);
        else if (qty <= 0 && Cart.remove) Cart.remove(cartId, cell.dataset.color);
        if (typeof Cart.updateBadge === 'function') Cart.updateBadge();
      }
      updateMiniCart();
      render();
    });

    render();
  }

  function openPanel() {
    document.getElementById('acc-backdrop').classList.add('open');
    document.getElementById('acc-panel').classList.add('open');
  }
  function closePanel() {
    document.getElementById('acc-backdrop').classList.remove('open');
    document.getElementById('acc-panel').classList.remove('open');
  }

  function init() {
    buildPanel();
    document.querySelectorAll('a[href="accesorios.html"], a[href="accesorios"], a[href="/accesorios"], a[href="/accesorios.html"]').forEach(link => {
      link.addEventListener('click', e => { e.preventDefault(); openPanel(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
