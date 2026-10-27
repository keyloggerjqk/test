function adminTablesPage() {
  const tables = getStore('tables', appData.tables);
  const totalEl = document.querySelector('#tables-total-count');
  const availEl = document.querySelector('#tables-available-count');
  const occEl = document.querySelector('#tables-occupied-count');
  const cleanEl = document.querySelector('#tables-cleaning-count');
  const grid = document.querySelector('#admin-table-grid');

  if (totalEl) totalEl.textContent = tables.length;
  if (availEl) availEl.textContent = tables.filter(t => t.status === 'available').length;
  if (occEl) occEl.textContent = tables.filter(t => t.status === 'occupied').length;
  if (cleanEl) cleanEl.textContent = tables.filter(t => t.status === 'cleaning').length;
  if (grid) grid.innerHTML = tableGrid(tables);
}

function tableGrid(tables) {
  return tables.map(t => `<article class="admin-table ${t.status}"><header><strong>${t.id}</strong>${badge(t.status)}</header><p>${t.zone} · ${t.seats} chỗ</p><label>Trạng thái<select data-table-status="${t.id}">${['available', 'occupied', 'reserved', 'cleaning'].map(s => `<option value="${s}" ${t.status === s ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}</select></label><div class="table-session-actions"><button class="button small primary" data-create-qr="${t.id}">Cấp QR mới</button><button class="button small quiet" data-close-qr="${t.id}">Kết thúc lượt</button></div></article>`).join('');
}

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.dataset.createQr) {
    b.disabled = true;
    b.textContent = 'Đang tạo...';
    if (typeof createQrSession === 'function') {
      createQrSession(b.dataset.createQr).then(qr => {
        showQrDialog(qr.table_code, qr.token, qr.expires_at);
        toast('Đã cấp phiên QR mới');
      }).catch(error => toast(error.message || 'Không thể tạo QR', 'error')).finally(() => {
        b.disabled = false;
        b.textContent = 'Cấp QR mới';
      });
    }
  }

  if (b.dataset.closeQr) {
    b.disabled = true;
    if (typeof closeQrSession === 'function') {
      closeQrSession(b.dataset.closeQr).then(() => {
        toast('Đã kết thúc lượt dùng bàn');
        setTimeout(() => location.reload(), 500);
      }).catch(error => {
        b.disabled = false;
        toast(error.message || 'Không thể đóng phiên', 'error');
      });
    }
  }

  if (b.dataset.copyQr) {
    const input = document.querySelector('#qr-order-url');
    if (input) {
      navigator.clipboard.writeText(input.value || '').then(() => toast('Đã chép liên kết QR'));
    }
  }
});

document.addEventListener('change', e => {
  if (e.target.dataset.tableStatus) {
    const tables = getStore('tables', appData.tables);
    const t = tables.find(x => x.id === e.target.dataset.tableStatus);
    if (!t) return;
    t.status = e.target.value;
    setStore('tables', tables);
    const grid = document.querySelector('#admin-table-grid');
    if (grid) grid.innerHTML = tableGrid(tables);
    toast('Đã cập nhật trạng thái bàn');
    if (typeof remoteWrite === 'function' && typeof remoteEnabled !== 'undefined' && remoteEnabled) {
      remoteWrite('tables', 'PATCH', { status: t.status }, `?code=eq.${encodeURIComponent(t.id)}`, getAuthSession()?.accessToken).catch(console.warn);
    }
  }
});

document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.id !== 'add-table-form') return;
  e.preventDefault();
  if (!f.reportValidity()) return;

  const fd = new FormData(f);
  const tables = getStore('tables', appData.tables);
  const id = String(fd.get('id')).trim().toUpperCase();
  const button = f.querySelector('button[type="submit"]');

  if (tables.some(t => t.id === id)) {
    toast(`Mã bàn ${id} đã tồn tại`, 'error');
    return;
  }
  const table = { id, zone: fd.get('zone'), seats: +fd.get('seats'), status: 'available' };
  if (button) { button.disabled = true; button.textContent = 'Đang tạo...'; }

  try {
    if (typeof createTableRemote === 'function') await createTableRemote(table);
    tables.push(table);
    appData.tables = tables;
    setStore('tables', tables);
    document.querySelector('#table-dialog')?.close();
    const grid = document.querySelector('#admin-table-grid');
    if (grid) grid.innerHTML = tableGrid(tables);
    f.reset();
    toast(`Đã tạo bàn ${id} trên Supabase`);
  } catch (error) {
    console.warn(error);
    toast(error.message.includes('409') ? `Mã bàn ${id} đã tồn tại trên Supabase` : `Không thể tạo bàn: ${error.message}`, 'error');
  } finally {
    if (button) { button.disabled = false; button.textContent = 'Tạo bàn'; }
  }
});

bootPage(adminTablesPage);
