function paymentPanel(orders) {
  const payment = getStore('payment', null);
  const total = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0);
  if (payment?.status === 'paid') return `<section class="surface payment-panel payment-confirmed"><span class="payment-confirm-icon" aria-hidden="true">✓</span><p class="kicker">Thanh toán phiên bàn</p><h2>Đã thanh toán</h2><p>Cảm ơn quý khách đã sử dụng dịch vụ.</p></section>`;
  const pending = payment?.status === 'pending';
  return `<form id="payment-form" class="surface payment-panel"><p class="kicker">Thanh toán phiên bàn</p><div class="payment-total"><span>Tổng cộng ${orders.length} lần gọi món</span><strong>${money(total)}</strong></div><fieldset class="payment-methods" ${pending ? 'disabled' : ''}><legend>Chọn phương thức</legend><label><input type="radio" name="method" value="cash" required ${payment?.method === 'cash' ? 'checked' : ''}><span><b>₫</b><strong>Tiền mặt</strong><small>Thanh toán với nhân viên tại bàn</small></span></label><label><input type="radio" name="method" value="card" required ${payment?.method === 'card' ? 'checked' : ''}><span><b>▣</b><strong>Thẻ tín dụng</strong><small>Quẹt hoặc chạm thẻ tại bàn</small></span></label><label><input type="radio" name="method" value="bank_transfer" required ${payment?.method === 'bank_transfer' ? 'checked' : ''}><span><b>↗</b><strong>Chuyển khoản</strong><small>Nhận QR ngân hàng từ nhân viên</small></span></label></fieldset><button class="button primary full" type="submit" ${total <= 0 || pending ? 'disabled' : ''}>${pending ? 'Đã yêu cầu thanh toán' : 'Yêu cầu thanh toán'}</button><p class="fine-print">Đây là yêu cầu hỗ trợ thanh toán tại bàn. Website không thực hiện giao dịch hoặc lưu thông tin thẻ.</p></form>`;
}

function feedbackSessionMatches(storageKey) {
  const token = getQrSession()?.token;
  return Boolean(token && sessionStorage.getItem(storageKey) === token);
}

function feedbackFormMarkup() {
  return `<form id="feedback-form" class="surface feedback-form"><p class="kicker">Đánh giá phiên bàn</p><h2 tabindex="-1">Trải nghiệm của bạn thế nào?</h2><fieldset class="rating"><legend>Chọn số sao</legend>${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="rating" value="${n}" required><span>★</span><span class="sr-only">${n} sao</span></label>`).join('')}</fieldset><label>Chia sẻ thêm<textarea name="text" rows="3" minlength="8" required placeholder="Món ăn, tốc độ phục vụ..."></textarea></label><button class="button primary full" type="submit">Gửi phản hồi</button></form>`;
}

function feedbackAreaMarkup() {
  if (!paymentLocksOrdering()) return '';
  if (feedbackSessionMatches('menumind:feedback-submitted')) {
    return `<section class="surface feedback-thanks"><strong>✓ Cảm ơn bạn đã đánh giá</strong><p>Phản hồi đã được gửi đến quản lý nhà hàng.</p></section>`;
  }
  if (!feedbackSessionMatches('menumind:feedback-ready')) return '';
  return `<section class="surface feedback-invite"><div><p class="kicker">Sau bữa ăn</p><h2>Chia sẻ trải nghiệm của bạn</h2></div><button class="button quiet full" type="button" data-action="open-feedback">☆ Đánh giá trải nghiệm</button></section>`;
}

function renderFeedbackArea() {
  const area = document.querySelector('#feedback-area');
  if (!area) return;
  area.innerHTML = feedbackAreaMarkup();
}

function showFeedbackDialog() {
  document.querySelector('#feedback-dialog')?.remove();
  const popup = document.createElement('dialog');
  popup.id = 'feedback-dialog';
  popup.className = 'feedback-dialog';
  popup.setAttribute('aria-labelledby', 'feedback-dialog-title');
  popup.innerHTML = `<header class="dialog-head"><h2 id="feedback-dialog-title">Đánh giá phiên bàn</h2><button class="icon-button" type="button" data-close="feedback-dialog" aria-label="Đóng form đánh giá">×</button></header>${feedbackFormMarkup()}`;
  document.body.append(popup);
  popup.addEventListener('close', () => popup.remove(), { once: true });
  popup.showModal();
  popup.querySelector('.feedback-form h2')?.focus();
}

function showPaymentRequestPopup() {
  document.querySelector('#payment-request-dialog')?.remove();
  const popup = document.createElement('dialog');
  popup.id = 'payment-request-dialog';
  popup.className = 'payment-request-dialog';
  popup.innerHTML = `<div class="payment-popup-content"><span class="payment-wait-icon" aria-hidden="true">⌛</span><h2>Quý khách vui lòng chờ nhân viên hỗ trợ tới bàn</h2><button class="button primary" data-close="payment-request-dialog" data-action="reveal-feedback-invite">Đã hiểu</button></div>`;
  document.body.append(popup);
  document.body.classList.add('payment-dialog-open');
  popup.addEventListener('close', () => {
    document.body.classList.remove('payment-dialog-open');
  }, { once: true });
  popup.showModal();
}

function statusPageV2() {
  const table = sessionStorage.getItem('menumind:table') || 'A01';
  const orders = getStore('orders', appData.orders).filter(o => !table || o.table === table).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const wrapper = document.querySelector('#status-content-wrapper');
  if (!wrapper) return;

  if (!orders.length) {
    wrapper.innerHTML = `${pageHead('Theo dõi đơn', 'Bạn chưa gửi đơn nào', 'Mọi lần gọi món trong phiên QR này sẽ xuất hiện tại đây.')} ${emptyState('Chưa có đơn tại phiên bàn này', 'Hãy chọn món và gửi đơn trước.', '<a class="button primary" href="diner-menu.html">Xem thực đơn</a>')}`;
    return;
  }
  const openCount = orders.filter(o => ['new', 'cooking', 'ready'].includes(o.status)).length;
  const cards = orders.map((order, index) => {
    const steps = ['new', 'cooking', 'ready', 'served'];
    const current = steps.indexOf(order.status);
    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
    const created = new Date(order.createdAt);
    const createdLabel = Number.isNaN(created.getTime()) ? order.createdAt : created.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `<article class="surface session-order-card"><header><div><p class="kicker">Lần gọi món ${orders.length - index}</p><h2>${order.id}</h2><small>${createdLabel} · ${itemCount} món</small></div>${badge(order.status)}</header><div class="mini-order-progress" aria-label="Tiến độ đơn ${escapeHtml(order.id)}">${steps.map((step, i) => `<span class="${order.status === 'cancelled' ? 'cancelled' : i < current ? 'done' : i === current ? 'current' : ''}">${i < current ? '✓' : i + 1}<small>${['Đã nhận', 'Đang nấu', 'Sẵn sàng', 'Đã phục vụ'][i]}</small></span>`).join('')}</div><div class="order-items">${order.items.map(x => { const m = appData.menuItems.find(i => i.id === x.menuId); return `<div class="order-line"><span>${x.qty} × ${escapeHtml(m?.name || x.menuId)}</span><strong>${money(x.qty * (m?.price || x.unitPrice || 0))}</strong></div>`; }).join('')}</div>${order.note ? `<p class="fine-print">Ghi chú: ${escapeHtml(order.note)}</p>` : ''}</article>`;
  }).join('');
  const addOrderAction = paymentLocksOrdering()
    ? `<span class="button primary is-disabled" aria-disabled="true">Đã khóa gọi món</span>`
    : `<a class="button primary" href="diner-menu.html">+ Gọi thêm món</a>`;

  wrapper.innerHTML = `${pageHead(`Bàn ${table}`, 'Theo dõi tất cả lần gọi món', `${orders.length} đơn thuộc phiên QR hiện tại. Mỗi lần gọi món được theo dõi riêng.`, `<div class="head-actions">${addOrderAction}<button class="button quiet" data-action="refresh-status">↻ Cập nhật</button></div>`)}<section class="metric-strip"><div><span>Tổng lần gọi</span><strong>${orders.length}</strong></div><div><span>Đơn đang xử lý</span><strong>${openCount}</strong></div><div><span>Đã phục vụ</span><strong>${orders.filter(o => o.status === 'served').length}</strong></div><div><span>Tổng số món</span><strong>${orders.reduce((sum, o) => sum + o.items.reduce((n, x) => n + x.qty, 0), 0)}</strong></div></section><div class="content-grid wide-right"><section class="session-order-list">${cards}</section><aside class="checkout-sidebar">${paymentPanel(orders)}<div id="feedback-area" aria-live="polite">${feedbackAreaMarkup()}</div></aside></div>`;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button, a');
  if (!b) return;
  const action = b.dataset.action;
  if (action === 'refresh-status') {
    b.disabled = true;
    b.textContent = 'Đang tải…';
    setTimeout(() => { location.reload(); }, 700);
  }
  if (action === 'reveal-feedback-invite') {
    const token = getQrSession()?.token;
    if (token) sessionStorage.setItem('menumind:feedback-ready', token);
    renderFeedbackArea();
  }
  if (action === 'open-feedback') {
    showFeedbackDialog();
  }
});

document.addEventListener('submit', async e => {
  const f = e.target;
  const formId = f.id;

  if (formId === 'payment-form') {
    e.preventDefault();
    const button = f.querySelector('button[type="submit"]');
    const method = new FormData(f).get('method');
    button.disabled = true;
    button.textContent = 'Đang gửi yêu cầu...';
    try {
      const payment = await requestPayment(method);
      setStore('payment', payment);
      statusPageV2();
      showPaymentRequestPopup();
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Yêu cầu thanh toán';
      toast(`Không thể gửi yêu cầu: ${error.message}`, 'error');
    }
  }

  if (formId === 'feedback-form') {
    e.preventDefault();
    const fd = new FormData(f);
    const rating = Number(fd.get('rating'));
    const message = String(fd.get('text') || '').trim();
    const token = getQrSession()?.token;
    const button = f.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Đang gửi phản hồi...';
    try {
      const saved = await submitQrFeedback(rating, message);
      if (saved) {
        const feedback = getStore('feedback', appData.feedback).filter(item => item.id !== saved.id);
        feedback.unshift(saved);
        setStore('feedback', feedback);
      }
      if (token) sessionStorage.setItem('menumind:feedback-submitted', token);
      f.closest('dialog')?.close();
      renderFeedbackArea();
      toast('Cảm ơn bạn đã gửi phản hồi.');
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Gửi phản hồi';
      toast(`Không thể gửi phản hồi: ${error.message}`, 'error');
    }
  }
});

bootPage(statusPageV2);
