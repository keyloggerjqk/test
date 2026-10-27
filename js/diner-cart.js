function updateCartCount() {
  const cart = getStore('cart', []);
  const count = (Array.isArray(cart) ? cart : []).reduce(
    (total, item) => total + Math.max(1, Number.parseInt(item?.qty, 10) || 1),
    0
  );

  document.querySelectorAll('#cart-count').forEach(element => {
    element.textContent = count;
  });
  return count;
}

function addToCart(id, quantity = 1, note = '') {
  if (paymentLocksOrdering()) {
    toast(orderingLockMessage(), 'error');
    return false;
  }

  const menuId = String(id || '');
  const qty = Math.min(10, Math.max(1, Number.parseInt(quantity, 10) || 1));
  const normalizedNote = String(note || '').trim();
  const menuItem = appData.menuItems.find(item => String(item.id) === menuId && item.available);

  if (!menuItem) {
    toast('Món này hiện không thể thêm vào giỏ', 'error');
    return false;
  }

  const storedCart = getStore('cart', []);
  const cart = Array.isArray(storedCart) ? storedCart : [];
  const existingItem = cart.find(item =>
    String(item.menuId ?? item.id ?? '') === menuId
    && String(item.note || '').trim() === normalizedNote
  );

  if (existingItem) {
    existingItem.menuId = menuId;
    delete existingItem.id;
    existingItem.qty = Math.min(10, Math.max(1, Number.parseInt(existingItem.qty, 10) || 1) + qty);
  } else {
    cart.push({ menuId, qty, note: normalizedNote });
  }

  setStore('cart', cart);
  updateCartCount();
  toast(`Đã thêm ${menuItem.name} vào giỏ`);
  return true;
}

window.addEventListener('pageshow', updateCartCount);
window.addEventListener('storage', event => {
  if (event.key === 'menumind:cart') updateCartCount();
});
