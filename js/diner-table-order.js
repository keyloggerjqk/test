function cartPage() {
  const cart = getStore('cart', []);
  const details = cart.map((c, index) => ({ ...c, index, item: appData.menuItems.find(i => i.id === c.menuId) })).filter(x => x.item);
  const subtotal = details.reduce((s, x) => s + x.item.price * x.qty, 0);
  const payment = getStore('payment', null);
  const locked = paymentLocksOrdering(payment);
  const lockMessage = orderingLockMessage(payment);
  const table = sessionStorage.getItem('menumind:table') || 'A01';
  
  const kicker = document.querySelector('#cart-kicker');
  const subtitle = document.querySelector('#cart-subtitle');
  const headActions = document.querySelector('#cart-head-actions');
  const wrapper = document.querySelector('#cart-content-wrapper');

  if (kicker) kicker.textContent = `Bàn ${table}`;
  if (subtitle) subtitle.textContent = locked ? lockMessage : 'Bạn vẫn có thể thay đổi số lượng, ghi chú hoặc bỏ món.';
  if (headActions) {
    headActions.innerHTML = locked
      ? `<span class="button quiet is-disabled" aria-disabled="true">Không thể thêm món</span>`
      : `<a class="button quiet" href="diner-menu.html">+ Thêm món</a>`;
  }

  if (!wrapper) return;

  if (!details.length) {
    wrapper.innerHTML = emptyState('Giỏ món đang trống', locked ? lockMessage : 'Khám phá thực đơn và thêm món bạn muốn.', locked ? '' : `<a class="button primary" href="diner-menu.html">Xem thực đơn</a>`);
    return;
  }

  wrapper.innerHTML = `<div class="checkout-layout"><section class="cart-list" aria-label="Các món đã chọn">${details.map(x => `<article class="cart-row"><div class="mini-food tone-${x.item.id.slice(-1)}" data-dish-id="${escapeHtml(x.item.id)}">${dishPicture(x.item, 'mini-food-photo')}</div><div><h2>${escapeHtml(x.item.name)}</h2><p>${x.note ? `Ghi chú: ${escapeHtml(x.note)}` : 'Không có ghi chú'}</p><button class="link-button danger-text" data-remove-cart="${x.index}" ${locked ? 'disabled' : ''}>Bỏ món</button></div><label>Số lượng<input type="number" min="1" max="10" value="${x.qty}" data-cart-qty="${x.index}" ${locked ? 'disabled' : ''}></label><strong>${money(x.item.price * x.qty)}</strong></article>`).join('')}</section><aside class="bill-panel"><p class="kicker">Tóm tắt đơn</p><h2>${details.reduce((s, x) => s + x.qty, 0)} món · Bàn ${escapeHtml(table)}</h2><dl><div><dt>Tạm tính</dt><dd>${money(subtotal)}</dd></div><div><dt>Phí phục vụ</dt><dd>${money(Math.round(subtotal * .05))}</dd></div><div class="total"><dt>Tổng cộng</dt><dd>${money(Math.round(subtotal * 1.05))}</dd></div></dl>${locked ? `<div class="order-lock-notice" role="alert"><strong>Không thể gửi thêm món</strong><span>${escapeHtml(lockMessage)}</span></div>` : ''}<label class="check"><input id="confirm-order" type="checkbox" ${locked ? 'disabled' : ''}>Tôi đã kiểm tra món và các ghi chú</label><button id="submit-order" class="button primary full" disabled>${locked ? (payment?.status === 'paid' ? 'Phiên đã thanh toán' : 'Đã yêu cầu thanh toán') : 'Gửi đơn đến bếp'}</button><p class="fine-print">${locked ? 'Vui lòng nhờ nhân viên cấp phiên QR mới nếu muốn mở lượt dùng bàn mới.' : 'Thời gian dự kiến sẽ được cập nhật sau khi bếp nhận đơn.'}</p></aside></div>`;
}

async function submitOrder() {
  const cart = getStore('cart', []);
  if (!cart.length) return;
  const button = document.querySelector('#submit-order');
  if (button) { button.disabled = true; button.textContent = 'Đang kiểm tra phiên...'; }

  try {
    await ensureQrOrderingOpen();
    if (button) button.textContent = 'Đang gửi đơn...';

    const orders = getStore('orders', appData.orders);
    const items = cart.map(x => {
      const menuItem = appData.menuItems.find(i => i.id === x.menuId);
      return { ...x, unitPrice: menuItem?.price || 0 };
    });
    const order = {
      id: `MM-${Date.now().toString().slice(-8)}`,
      table: sessionStorage.getItem('menumind:table'),
      createdAt: new Date().toISOString(),
      status: 'new',
      priority: false,
      wait: 0,
      items,
      total: items.reduce((sum, x) => sum + (x.unitPrice || 0) * x.qty, 0),
      note: 'Đơn gửi từ QR tại bàn'
    };

    if (typeof createOrderRemote === 'function') {
      await createOrderRemote(order);
    }
    orders.unshift(order);
    setStore('orders', orders);
    setStore('lastOrder', order);
    setStore('cart', []);
    toast('Đơn đã được gửi đến bếp');
    setTimeout(() => { location.href = 'diner-order-status.html'; }, 650);
  } catch (error) {
    console.warn(error);
    if (error.code === 'ORDER_LOCKED' || paymentLocksOrdering()) {
      if (button) { button.disabled = true; button.textContent = getStore('payment', null)?.status === 'paid' ? 'Phiên đã thanh toán' : 'Không thể gửi đơn'; }
    } else if (button) {
      button.disabled = false;
      button.textContent = 'Gửi đơn đến bếp';
    }
    toast(error.message || 'Không thể gửi đơn. Vui lòng quét lại QR.', 'error');
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.removeCart !== undefined) {
    const cart = getStore('cart', []);
    cart.splice(+b.dataset.removeCart, 1);
    setStore('cart', cart);
    cartPage();
  }
  if (b.id === 'submit-order') {
    submitOrder();
  }
});

document.addEventListener('input', e => {
  if (e.target.dataset.cartQty !== undefined) {
    const cart = getStore('cart', []);
    cart[+e.target.dataset.cartQty].qty = Math.max(1, +e.target.value);
    setStore('cart', cart);
    cartPage();
  }
  if (e.target.id === 'confirm-order') {
    const submitBtn = document.querySelector('#submit-order');
    if (submitBtn) {
      submitBtn.disabled = !e.target.checked || paymentLocksOrdering();
    }
  }
});

bootPage(cartPage);
