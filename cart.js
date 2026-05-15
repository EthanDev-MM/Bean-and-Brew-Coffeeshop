// ===== CART STATE =====
let cart = {};

// ===== TOGGLE CART SIDEBAR =====
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

// ===== ADD TO CART (Quick Add button) =====
function addToCart(name, price) {
  if (cart[name]) {
    cart[name].qty += 1;
  } else {
    cart[name] = { price, qty: 1 };
  }
  syncQtyControls(name);
  renderCart();
  flashBadge();
}

// ===== CHANGE QTY via +/- buttons on card =====
function changeQty(controlId, delta, name, price) {
  const control = document.getElementById(controlId);
  const qtySpan = control.querySelector('.qty-num');
  let current = parseInt(qtySpan.textContent) || 0;
  current = Math.max(0, current + delta);
  qtySpan.textContent = current;

  if (current === 0) {
    delete cart[name];
  } else {
    cart[name] = { price, qty: current };
  }
  renderCart();
  flashBadge();
}

// ===== REMOVE FROM CART =====
function removeFromCart(name) {
  delete cart[name];
  // Reset matching qty controls
  document.querySelectorAll('.qty-num').forEach(span => {
    const row = span.closest('.card-footer-row');
    if (!row) return;
    const btn = row.querySelector('.qty-btn[onclick*="' + name.replace(/'/g, "\\'") + '"]');
    if (btn) span.textContent = '0';
  });
  renderCart();
}

// ===== SYNC QTY DISPLAY ON CARDS =====
function syncQtyControls(name) {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    const onclickStr = btn.getAttribute('onclick') || '';
    if (onclickStr.includes(name)) {
      const control = btn.closest('.qty-control');
      if (control) {
        const qtySpan = control.querySelector('.qty-num');
        qtySpan.textContent = cart[name] ? cart[name].qty : 0;
      }
    }
  });
}

// ===== RENDER CART =====
function renderCart() {
  const itemsContainer = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');
  const badgeEl = document.getElementById('cartBadge');

  const keys = Object.keys(cart);
  let total = 0;
  let totalQty = 0;

  // Clear existing items (keep empty msg)
  itemsContainer.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (keys.length === 0) {
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    badgeEl.textContent = '0';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  keys.forEach(name => {
    const { price, qty } = cart[name];
    const lineTotal = price * qty;
    total += lineTotal;
    totalQty += qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-name">${name} <span style="color:var(--muted);font-size:0.78rem;">×${qty}</span></div>
      <div class="cart-item-price">$${lineTotal}</div>
      <button class="cart-item-remove" onclick="removeFromCart('${name.replace(/'/g, "\\'")}')">✕</button>
    `;
    itemsContainer.appendChild(div);
  });

  totalEl.textContent = '$' + total;
  badgeEl.textContent = totalQty > 99 ? '99+' : totalQty;
}

// ===== BADGE FLASH ANIMATION =====
function flashBadge() {
  const badge = document.getElementById('cartBadge');
  badge.style.transform = 'scale(1.4)';
  badge.style.background = '#e6c78b';
  setTimeout(() => {
    badge.style.transform = 'scale(1)';
    badge.style.background = '';
  }, 250);
}

// ===== CLOSE CART ON ESC =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }
});


function searchProducts(query) {
  const cards = document.querySelectorAll('.product-card');
  const clear = document.getElementById('searchClear');
  const noResults = document.getElementById('noResults');
  const q = query.toLowerCase().trim();

  clear.style.display = q ? 'block' : 'none';

  let count = 0;
  cards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const brand = card.querySelector('.card-brand').textContent.toLowerCase();
    const desc  = card.querySelector('.card-desc').textContent.toLowerCase();

    if (!q || title.includes(q) || brand.includes(q) || desc.includes(q)) {
      card.style.display = '';
      count++;
    } else {
      card.style.display = 'none';
    }
  });

  if (noResults) noResults.style.display = count === 0 ? 'block' : 'none';
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  searchProducts('');
}