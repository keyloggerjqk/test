const ROOT = document.body.dataset.root || '.';
const PAGE = document.body.dataset.page || 'home';
const pageTitle = document.body.dataset.title || 'MenuMind';

const fallbackData = { menuItems: [], orders: [], tables: [], feedback: [], staff: [], payments: [] };
let appData = fallbackData;

const paths = {
  home: `${ROOT}/index.html`,
  login: `${ROOT}/pages/login.html`,
  menu: `${ROOT}/pages/diner-menu.html`,
  cart: `${ROOT}/pages/diner-table-order.html`,
  status: `${ROOT}/pages/diner-order-status.html`,
  kitchen: `${ROOT}/pages/kitchen-board.html`,
  manager: `${ROOT}/pages/manager-menu-management.html`,
  admin: `${ROOT}/pages/admin-user-management.html`
};

const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const uid = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
const getStore = (key, fallback) => JSON.parse(localStorage.getItem(`menumind:${key}`) || JSON.stringify(fallback));
const setStore = (key, value) => localStorage.setItem(`menumind:${key}`, JSON.stringify(value));
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]));

function parseOrderDate(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (!Number.isNaN(d.getTime())) {
    return { date: d, isFullDate: String(createdAt).includes('-') || String(createdAt).includes('T') };
  }
  const match = String(createdAt).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const now = new Date();
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3] || '0', 10));
    if (candidate.getTime() > now.getTime() + 2 * 60000) {
      candidate.setDate(candidate.getDate() - 1);
    }
    return { date: candidate, isFullDate: false };
  }
  return null;
}

function getOrderWait(order, nowMs = Date.now()) {
  if (!order) return 0;
  const done = ['served', 'cancelled'].includes(order.status);
  const parsed = parseOrderDate(order.createdAt);

  if (parsed) {
    const elapsed = Math.max(0, Math.floor((nowMs - parsed.date.getTime()) / 60000));
    if (done && Number(order.wait) > 0) return Number(order.wait);
    if (!parsed.isFullDate && Number(order.wait) > 0) return Number(order.wait);
    if (!done) return elapsed;
    return Number(order.wait) || elapsed;
  }
  return Number(order.wait) || 0;
}

function dishImage(item) {
  const configured = String(item?.image || '').trim();
  if (/^(https?:)?\/\//i.test(configured) || configured.startsWith('/')) return configured;
  const localPath = configured || `assets/images/menu/${String(item?.id || '').replace(/[^a-z0-9_-]/gi, '')}.jpg`;
  return `${ROOT}/${localPath.replace(/^\.\//, '')}`;
}

function dishPicture(item, className = '') {
  return `<img class="${className}" src="${escapeHtml(dishImage(item))}" alt="${escapeHtml(item.name)}" width="720" height="480" loading="lazy" decoding="async"><span class="dish-fallback" hidden aria-hidden="true">${escapeHtml(item.emoji || '🍽️')}</span>`;
}

function toast(message, tone = 'success') {
  let region = document.querySelector('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  const item = document.createElement('div');
  item.className = `toast ${tone}`;
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 3200);
}

function getAuthSession() {
  try { return JSON.parse(sessionStorage.getItem('menumind:session') || 'null'); } catch { return null; }
}

function getQrSession() {
  try { return JSON.parse(sessionStorage.getItem('menumind:qr-session') || 'null'); } catch { return null; }
}

function roleHome(role) {
  return ({ kitchen: 'kitchen-board.html', manager: 'manager-menu-management.html', admin: 'admin-user-management.html', service: 'manager-table-management.html' })[role] || 'login.html';
}

const protectedRoles = {
  'kitchen-board': 'kitchen', 'kitchen-detail': 'kitchen', 'kitchen-alerts': 'kitchen',
  'manager-menu': 'manager', 'manager-payments': 'manager',
  'manager-feedback': 'manager', 'manager-sales': 'admin', 'admin-sales': 'admin', 'admin-sales-insights': 'admin',
  'manager-tables': ['manager', 'service'], 'admin-tables': ['manager', 'service'], 'admin-users': 'admin', 'admin-settings': 'admin'
};

function guardPage() {
  const requiredRole = protectedRoles[PAGE];
  if (!requiredRole) return true;
  let session = getAuthSession();
  if (!session?.staff) {
    location.href = `${ROOT}/pages/login.html?next=${encodeURIComponent(location.pathname.split('/').pop())}`;
    return false;
  }
  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!allowed.includes(session.staff.role)) {
    location.href = `${ROOT}/pages/${roleHome(session.staff.role)}`;
    return false;
  }
  return true;
}

function paymentLocksOrdering(payment = getStore('payment', null)) {
  return ['pending', 'paid'].includes(payment?.status);
}

function orderingLockMessage(payment = getStore('payment', null)) {
  return payment?.status === 'paid'
    ? 'Phiên bàn đã thanh toán. Không thể gửi thêm món đến bếp.'
    : 'Bàn đã yêu cầu thanh toán. Không thể gửi thêm món đến bếp.';
}

async function ensureQrOrderingOpen() {
  const qr = getQrSession();
  if (!qr?.table || !qr?.token) {
    const error = new Error('Không tìm thấy phiên QR của bàn. Vui lòng quét lại mã QR.');
    error.code = 'ORDER_LOCKED';
    throw error;
  }

  if (typeof validateQrSession === 'function') {
    const valid = await validateQrSession(qr.table, qr.token);
    if (valid !== true) {
      const error = new Error('Phiên bàn đã kết thúc hoặc đã thanh toán. Không thể gửi thêm món đến bếp.');
      error.code = 'ORDER_LOCKED';
      throw error;
    }
  }

  if (typeof loadQrPayment === 'function') {
    const payment = await loadQrPayment(qr);
    if (payment) setStore('payment', payment);
    else localStorage.removeItem('menumind:payment');

    if (paymentLocksOrdering(payment)) {
      const error = new Error(orderingLockMessage(payment));
      error.code = 'ORDER_LOCKED';
      throw error;
    }
  }
}

function showQrDialog(table, token, expiresAt) {
  document.querySelector('#qr-session-dialog')?.remove();
  const url = new URL(`${ROOT}/pages/diner-menu.html`, location.href);
  url.searchParams.set('table', table);
  url.searchParams.set('id', token);
  const dialogEl = document.createElement('dialog');
  dialogEl.id = 'qr-session-dialog';
  dialogEl.innerHTML = `<div class="dialog-head"><h2>QR gọi món · Bàn ${escapeHtml(table)}</h2><button class="icon-button" data-close="qr-session-dialog" aria-label="Đóng">×</button></div><div class="dialog-body"><div id="qr-code" class="qr-code" aria-label="Mã QR gọi món bàn ${escapeHtml(table)}"></div><label>Đường dẫn phiên bàn<input id="qr-order-url" value="${escapeHtml(url.href)}" readonly></label><p class="fine-print">Hết hạn lúc ${new Date(expiresAt).toLocaleString('vi-VN')}. Cấp mã mới sẽ vô hiệu mã cũ.</p><div class="dialog-actions"><button class="button quiet" data-copy-qr>Chép liên kết</button><button class="button primary" onclick="window.print()">In QR</button></div></div>`;
  document.body.append(dialogEl);
  dialogEl.showModal();
  if (window.QRCode) new QRCode(document.querySelector('#qr-code'), { text: url.href, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.H });
  else document.querySelector('#qr-code').textContent = 'Không tải được bộ tạo QR. Hãy dùng liên kết bên dưới.';
}

async function guardQrOrder() {
  if (!new Set(['menu', 'dish-detail', 'cart', 'status']).has(PAGE)) return true;
  const params = new URLSearchParams(location.search);
  let qr = getQrSession();
  if (params.get('table') && params.get('id')) qr = { table: params.get('table').toUpperCase(), token: params.get('id') };
  if (qr?.table && qr?.token && typeof validateQrSession === 'function') {
    try {
      const valid = await validateQrSession(qr.table, qr.token);
      if (valid === true) {
        sessionStorage.setItem('menumind:qr-session', JSON.stringify(qr));
        sessionStorage.setItem('menumind:table', qr.table);
        if (typeof callRpc === 'function') {
          const sessionOrders = await callRpc('get_qr_orders', { p_table: qr.table, p_token: qr.token });
          setStore('orders', sessionOrders);
          const payment = typeof loadQrPayment === 'function' ? await loadQrPayment(qr).catch(() => null) : null;
          if (payment) setStore('payment', payment); else localStorage.removeItem('menumind:payment');
          if (sessionOrders[0]) setStore('lastOrder', sessionOrders[0]);
          else localStorage.removeItem('menumind:lastOrder');
        }
        return true;
      }
    } catch (error) { console.warn('QR validation failed', error); }
  }
  const mainEl = document.querySelector('main');
  if (mainEl) {
    mainEl.innerHTML = `${pageHead('Phiên bàn không hợp lệ', 'Không thể mở thực đơn', 'Mã QR đã hết hạn, đã được đóng hoặc không thuộc bàn này.')}<section class="surface"><p>Vui lòng nhờ nhân viên tạo mã QR mới cho bàn của bạn.</p><a class="button primary" href="${paths.home}">Về trang chính</a></section>`;
  }
  return false;
}

function pageHead(kicker, title, desc, actions = '') {
  return `<header class="page-head"><div><p class="kicker">${kicker}</p><h1>${title}</h1><p>${desc}</p></div>${actions ? `<div class="head-actions">${actions}</div>` : ''}</header>`;
}

function emptyState(title, detail, action = '') {
  return `<div class="empty-state"><span aria-hidden="true">⌕</span><h2>${title}</h2><p>${detail}</p>${action}</div>`;
}

function statusLabel(s) {
  return ({
    new: 'Mới nhận', cooking: 'Đang nấu', ready: 'Chờ phục vụ', served: 'Đã phục vụ',
    cancelled: 'Đã hủy', available: 'Sẵn sàng', occupied: 'Đang dùng', reserved: 'Đã đặt',
    cleaning: 'Đang dọn', active: 'Hoạt động', inactive: 'Vô hiệu', replied: 'Đã phản hồi',
    pending: 'Chờ thanh toán', paid: 'Đã thanh toán', failed: 'Thất bại'
  }[s] || s);
}

function badge(s) {
  return `<span class="status ${s}">${statusLabel(s)}</span>`;
}

function cacheData(data) {
  appData = data;
  Object.entries(data).forEach(([key, value]) => setStore(key, value));
}

async function bootPage(renderPage) {
  if (typeof configureSupabase === 'function') {
    await configureSupabase();
    try {
      const remote = typeof readRemoteData === 'function' ? await readRemoteData() : null;
      if (!remote || !remote.menuItems.length) throw new Error('empty remote');
      cacheData(remote);
    } catch (remoteError) {
      try {
        const res = await fetch(`${ROOT}/assets/data/app-data.json`);
        if (!res.ok) throw new Error('load');
        appData = await res.json();
      } catch {
        appData = getStore('seed', fallbackData);
      }
      if (typeof remoteEnabled !== 'undefined' && remoteEnabled) {
        console.warn('Supabase unavailable; using local fallback.', remoteError);
      }
    }
  } else {
    try {
      const res = await fetch(`${ROOT}/assets/data/app-data.json`);
      if (!res.ok) throw new Error('load');
      appData = await res.json();
    } catch {
      appData = getStore('seed', fallbackData);
    }
  }

  if (!appData.menuItems.length) {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.innerHTML = emptyState('Không tải được dữ liệu', 'Hãy chạy website qua máy chủ cục bộ và thử lại.', `<button class="button primary" onclick="location.reload()">Thử lại</button>`);
    return;
  }
  if (!(await guardQrOrder())) return;
  if (!guardPage()) return;
  if (!localStorage.getItem('menumind:seed')) setStore('seed', appData);
  renderPage();
}

// Global modal & interaction listeners
document.addEventListener('click', e => {
  const b = e.target.closest('button, a');
  if (!b) return;
  if (b.dataset.open) {
    document.querySelector(`#${b.dataset.open}`)?.showModal();
  }
  if (b.dataset.close) {
    document.querySelector(`#${b.dataset.close}`)?.close();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
  }
});

document.addEventListener('error', e => {
  if (!(e.target instanceof HTMLImageElement) || !e.target.matches('.dish-photo, .detail-photo, .mini-food-photo, .tiny-food-photo')) return;
  e.target.hidden = true;
  if (e.target.nextElementSibling?.classList.contains('dish-fallback')) {
    e.target.nextElementSibling.hidden = false;
  }
}, true);
