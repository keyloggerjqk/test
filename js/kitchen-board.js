function boardColumn(status, title, orders) {
  const list = orders.filter(o => o.status === status).sort((a, b) => Number(b.priority) - Number(a.priority));
  return `<section class="board-column"><header><div><h2>${title}</h2><span>${list.length} đơn</span></div><i class="column-${status}"></i></header><div>${list.length ? list.map(orderCard).join('') : emptyState('Đã xử lý hết', 'Không có đơn ở trạng thái này.')}</div></section>`;
}

function orderCard(o) {
  const done = ['served', 'cancelled'].includes(o.status);
  const created = new Date(o.createdAt);
  const time = Number.isNaN(created.getTime()) ? o.createdAt : created.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `<article class="kitchen-card ${o.priority && !done ? 'priority' : ''} ${done ? 'completed' : ''}"><header><div><strong>${o.table}</strong><span>${o.id} · ${time}</span></div><div>${o.priority && !done ? '<span class="priority-mark">Ưu tiên</span>' : ''}${badge(o.status)}</div></header><ul>${o.items.map(x => { const m = appData.menuItems.find(i => i.id === x.menuId); return `<li><b>${x.qty}×</b> ${m?.name || x.menuId}</li>`; }).join('')}</ul>${o.note ? `<p class="order-note">${escapeHtml(o.note)}</p>` : ''}<footer><span class="wait ${o.wait > 15 && !done ? 'late' : ''}">${o.wait} phút</span><div><a class="icon-button" href="kitchen-order-detail.html?id=${o.id}" aria-label="Xem chi tiết">⋯</a><button class="button small primary" data-order-next="${o.id}" ${done ? 'disabled' : ''}>${o.status === 'new' ? 'Nhận đơn' : o.status === 'cooking' ? 'Nấu xong' : o.status === 'ready' ? 'Đã giao' : statusLabel(o.status)}</button></div></footer></article>`;
}

function kitchenBoardPageV2() {
  const orders = getStore('orders', appData.orders);
  const rank = { new: 0, cooking: 1, ready: 2, served: 3, cancelled: 4 };
  const sorted = [...orders].sort((a, b) => {
    const aDone = ['served', 'cancelled'].includes(a.status), bDone = ['served', 'cancelled'].includes(b.status);
    if (aDone !== bDone) return Number(aDone) - Number(bDone);
    if (!aDone && a.priority !== b.priority) return Number(b.priority) - Number(a.priority);
    if ((rank[a.status] ?? 9) !== (rank[b.status] ?? 9)) return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  const limit = getStore('kitchenLimit', 'all');
  const visible = limit === 'all' ? sorted : sorted.slice(0, Number(limit));
  const active = visible.filter(o => !['served', 'cancelled'].includes(o.status));
  const completed = visible.filter(o => ['served', 'cancelled'].includes(o.status));
  const avgWait = orders.filter(o => !['served', 'cancelled'].includes(o.status)).length ? Math.round(orders.filter(o => !['served', 'cancelled'].includes(o.status)).reduce((sum, o) => sum + Number(o.wait || 0), 0) / orders.filter(o => !['served', 'cancelled'].includes(o.status)).length) : 0;

  const wrapper = document.querySelector('#kitchen-board-wrapper');
  if (wrapper) {
    wrapper.innerHTML = `${pageHead('Hàng đợi trực tiếp', 'Bảng điều phối bếp', 'Đơn ưu tiên và chưa chế biến nằm trên cùng. Đơn hoàn tất được chuyển xuống cuối.', `<div class="head-actions"><label class="compact-field">Hiển thị<select id="kitchen-limit"><option value="3" ${limit === '3' ? 'selected' : ''}>3 đơn</option><option value="6" ${limit === '6' ? 'selected' : ''}>6 đơn</option><option value="all" ${limit === 'all' ? 'selected' : ''}>Tất cả</option></select></label><button class="button primary" data-action="refresh-board">↻ Làm mới</button></div>`)}<section class="metric-strip"><div><span>Chưa thực hiện</span><strong>${orders.filter(o => o.status === 'new').length}</strong></div><div><span>Đang chế biến</span><strong>${orders.filter(o => o.status === 'cooking').length}</strong></div><div><span>Chờ phục vụ</span><strong>${orders.filter(o => o.status === 'ready').length}</strong></div><div><span>Chờ trung bình</span><strong>${avgWait}′</strong></div></section><section class="queue-section"><div class="section-title compact"><div><p class="kicker">Cần xử lý trước</p><h2>Đơn đang hoạt động · ${active.length}</h2></div></div><div class="board kitchen-queue-grid">${active.length ? active.map(orderCard).join('') : emptyState('Đã xử lý hết', 'Không còn đơn đang chờ trong bếp.')}</div></section><section class="queue-section completed-queue"><div class="section-title compact"><div><p class="kicker">Lịch sử gần đây</p><h2>Đơn đã hoàn tất · ${completed.length}</h2></div></div><div class="kitchen-queue-grid">${completed.length ? completed.map(orderCard).join('') : emptyState('Chưa có đơn hoàn tất', 'Đơn đã phục vụ sẽ được chuyển xuống khu vực này.')}</div></section>`;
  }
}

document.addEventListener('click', async e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.dataset.orderNext) {
    const orders = getStore('orders', appData.orders);
    const o = orders.find(x => x.id === b.dataset.orderNext);
    const next = { new: 'cooking', cooking: 'ready', ready: 'served' };
    if (!o) return;
    const oldStatus = o.status;
    o.status = next[o.status] || o.status;
    b.disabled = true;
    try {
      if (typeof updateOrderRemote === 'function') await updateOrderRemote(o);
      setStore('orders', orders);
      kitchenBoardPageV2();
      toast('Đã cập nhật trạng thái đơn');
    } catch (error) {
      o.status = oldStatus;
      b.disabled = false;
      toast(`Không thể cập nhật: ${error.message}`, 'error');
    }
  }

  if (b.dataset.action === 'refresh-board') {
    b.disabled = true;
    b.textContent = 'Đang tải…';
    setTimeout(() => { location.reload(); }, 700);
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'kitchen-limit') {
    setStore('kitchenLimit', e.target.value);
    kitchenBoardPageV2();
  }
});

bootPage(kitchenBoardPageV2);
