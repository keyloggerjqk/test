function paymentMethodLabel(method) {
  return ({ cash: 'Tiền mặt', card: 'Thẻ tín dụng', bank_transfer: 'Chuyển khoản' })[method] || method;
}

function paymentTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

function paymentRequestTable(payments, showAction) {
  if (!payments.length) return emptyState(showAction ? 'Chưa có bàn yêu cầu thanh toán' : 'Chưa có lịch sử thanh toán', showAction ? 'Khi khách nhấn yêu cầu thanh toán, bàn sẽ xuất hiện tại đây.' : 'Các khoản đã xác nhận sẽ được lưu tại đây.');
  return `<div class="responsive-table"><table class="payment-request-table"><thead><tr><th>Bàn</th><th>Yêu cầu lúc</th><th>Phương thức</th><th>Số tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${payments.map(payment => `<tr><td data-label="Bàn"><strong class="payment-table-code"><span class="pulse-dot" aria-hidden="true"></span>${escapeHtml(payment.table_code)}</strong><small>${escapeHtml(payment.reference || '')}</small></td><td data-label="Yêu cầu lúc">${paymentTime(payment.created_at)}</td><td data-label="Phương thức">${escapeHtml(paymentMethodLabel(payment.method))}</td><td data-label="Số tiền"><strong>${money(payment.amount)}</strong></td><td data-label="Trạng thái">${badge(payment.status)}</td><td data-label="Thao tác">${showAction && payment.status === 'pending' ? `<button class="button small primary" data-confirm-payment="${escapeHtml(payment.id)}" data-payment-table="${escapeHtml(payment.table_code)}">Xác nhận đã thu tiền</button>` : `<span class="payment-completed-time">${payment.paid_at ? paymentTime(payment.paid_at) : '—'}</span>`}</td></tr>`).join('')}</tbody></table></div>`;
}

function managerPaymentsPage() {
  const payments = getStore('payments', appData.payments || []);
  const sorted = [...payments].sort((a, b) => Number(a.status !== 'pending') - Number(b.status !== 'pending') || new Date(b.created_at) - new Date(a.created_at));
  const pending = sorted.filter(payment => payment.status === 'pending');
  const completed = sorted.filter(payment => payment.status !== 'pending');
  const pendingTotal = pending.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const pendingCount = document.querySelector('#pending-count');
  const pendingTotalEl = document.querySelector('#pending-total');
  const cashCount = document.querySelector('#cash-count');
  const cardCount = document.querySelector('#card-count');
  const pendingSecTitle = document.querySelector('#pending-section-title');
  const histSecTitle = document.querySelector('#history-section-title');
  const pendingTable = document.querySelector('#pending-payments-table');
  const historyTable = document.querySelector('#history-payments-table');

  if (pendingCount) pendingCount.textContent = pending.length;
  if (pendingTotalEl) pendingTotalEl.textContent = money(pendingTotal);
  if (cashCount) cashCount.textContent = pending.filter(payment => payment.method === 'cash').length;
  if (cardCount) cardCount.textContent = pending.filter(payment => payment.method !== 'cash').length;
  if (pendingSecTitle) pendingSecTitle.textContent = `Bàn bật cờ thanh toán · ${pending.length}`;
  if (histSecTitle) histSecTitle.textContent = `Lịch sử thanh toán gần đây · ${completed.length}`;
  if (pendingTable) pendingTable.innerHTML = paymentRequestTable(pending, true);
  if (historyTable) historyTable.innerHTML = paymentRequestTable(completed, false);
}

document.addEventListener('click', async e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.dataset.confirmPayment) {
    const table = b.dataset.paymentTable || '';
    if (!window.confirm(`Xác nhận đã thu đủ tiền tại bàn ${table}? Phiên QR của bàn sẽ được đóng.`)) return;
    b.disabled = true;
    b.textContent = 'Đang xác nhận...';
    try {
      if (typeof confirmPaymentRemote === 'function') await confirmPaymentRemote(b.dataset.confirmPayment);
      const payments = getStore('payments', appData.payments || []);
      const payment = payments.find(item => item.id === b.dataset.confirmPayment);
      if (payment) {
        payment.status = 'paid';
        payment.paid_at = new Date().toISOString();
      }
      setStore('payments', payments);
      appData.payments = payments;
      managerPaymentsPage();
      toast(`Đã xác nhận thanh toán bàn ${table}`);
    } catch (error) {
      b.disabled = false;
      b.textContent = 'Xác nhận đã thu tiền';
      toast(`Không thể xác nhận: ${error.message}`, 'error');
    }
  }

  if (b.dataset.action === 'refresh-payments') {
    b.disabled = true;
    b.textContent = 'Đang tải…';
    setTimeout(() => location.reload(), 350);
  }
});

bootPage(managerPaymentsPage);
