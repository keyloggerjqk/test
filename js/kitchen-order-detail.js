function kitchenDetailPage() {
  const id = new URLSearchParams(location.search).get('id')?.trim();
  const orders = getStore('orders', appData.orders);
  const wrapper = document.querySelector('#kitchen-detail-wrapper');
  if (!wrapper) return;

  if (!id) {
    wrapper.innerHTML = `${pageHead('Chi tiết đơn', 'Chưa chọn đơn để xem', 'Hãy mở chi tiết từ một đơn cụ thể trên bảng điều phối bếp.', '<a class="button primary" href="kitchen-board.html">Mở bảng đơn</a>')}${emptyState('Không có đơn được chọn', 'Trang chi tiết chỉ hiển thị khi bạn chọn một đơn từ bảng bếp.')}`;
    return;
  }

  const o = orders.find(order => String(order.id) === id);
  if (!o) {
    wrapper.innerHTML = `${pageHead('Chi tiết đơn', 'Không tìm thấy đơn', `Mã đơn ${escapeHtml(id)} không tồn tại hoặc đã bị xóa.`, '<a class="button primary" href="kitchen-board.html">Về bảng đơn</a>')}${emptyState('Đơn không còn trong hệ thống', 'Hãy làm mới bảng bếp và chọn lại một đơn đang có.')}`;
    return;
  }

  wrapper.innerHTML = `${pageHead('Chi tiết ' + escapeHtml(o.id), `Bàn ${escapeHtml(o.table)} · ${o.items.reduce((s, x) => s + x.qty, 0)} món`, `Được tạo lúc ${escapeHtml(o.createdAt)}. Kiểm tra ghi chú trước khi cập nhật trạng thái.`, '<a class="button quiet" href="kitchen-board.html">Về bảng bếp</a>')}<div class="detail-layout"><section class="surface"><div class="section-title compact"><div><p class="kicker">Danh sách chế biến</p><h2>Các món trong đơn</h2></div>${badge(o.status)}</div>${o.items.map((x, n) => { const m = appData.menuItems.find(i => i.id === x.menuId); return `<article class="prep-row"><span>${n + 1}</span><div><h3>${x.qty} × ${escapeHtml(m?.name || x.menuId)}</h3><p>${escapeHtml(x.note || 'Chế biến theo công thức tiêu chuẩn')}</p></div><label class="check"><input type="checkbox" data-prep-item>Hoàn thành</label></article>`; }).join('')}<div class="order-note"><strong>Ghi chú chung</strong><p>${escapeHtml(o.note || 'Không có ghi chú')}</p></div></section><aside class="order-panel"><p class="kicker">Tiến độ đơn</p><h2>${o.wait} phút chờ</h2><label>Chuyển trạng thái<select id="order-status">${['new', 'cooking', 'ready', 'served', 'cancelled'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}</select></label><label>Ghi chú nội bộ<textarea id="kitchen-note" rows="3" placeholder="Thông báo cho ca sau...">${escapeHtml(o.note || '')}</textarea></label><button class="button primary full" data-update-order="${escapeHtml(o.id)}">Lưu cập nhật</button><button class="button quiet full" data-priority-order="${escapeHtml(o.id)}">${o.priority ? 'Bỏ ưu tiên' : 'Đánh dấu ưu tiên'}</button></aside></div>`;
}

document.addEventListener('click', async e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.dataset.updateOrder) {
    const orders = getStore('orders', appData.orders);
    const o = orders.find(x => x.id === b.dataset.updateOrder);
    if (!o) return;
    const old = { status: o.status, note: o.note };
    o.status = document.querySelector('#order-status')?.value || o.status;
    o.note = document.querySelector('#kitchen-note')?.value.trim() || o.note;
    b.disabled = true;
    b.textContent = 'Đang lưu...';
    try {
      if (typeof updateOrderRemote === 'function') await updateOrderRemote(o);
      setStore('orders', orders);
      toast('Đã lưu trạng thái lên Supabase');
      setTimeout(() => { location.href = 'kitchen-board.html'; }, 500);
    } catch (error) {
      Object.assign(o, old);
      b.disabled = false;
      b.textContent = 'Lưu cập nhật';
      toast(`Không thể cập nhật: ${error.message}`, 'error');
    }
  }

  if (b.dataset.priorityOrder) {
    const orders = getStore('orders', appData.orders);
    const o = orders.find(x => x.id === b.dataset.priorityOrder);
    if (!o) return;
    o.priority = !o.priority;
    if (typeof updateOrderRemote === 'function') updateOrderRemote(o).catch(console.warn);
    setStore('orders', orders);
    toast(o.priority ? 'Đã ưu tiên đơn' : 'Đã bỏ ưu tiên');
    kitchenDetailPage();
  }
});

bootPage(kitchenDetailPage);
