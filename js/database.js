// Database & Supabase REST adapter
let SUPABASE_URL = window.MENUMIND_SUPABASE?.url || '';
let SUPABASE_KEY = window.MENUMIND_SUPABASE?.key || '';
let remoteEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function apiFetch(resource, options = {}) {
  if (!remoteEnabled) throw new Error('Supabase chưa được cấu hình');
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, { cache: 'no-store', ...options, headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || errorBody.error_description || errorBody.msg || `Supabase ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = errorBody.code;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

async function signIn(email, password) {
  if (!remoteEnabled) throw new Error('Chưa cấu hình máy chủ đăng nhập');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error_description || payload.msg || 'Email hoặc mật khẩu không đúng');
  return payload;
}

async function getStaffRole(email, token) {
  const rows = await apiFetch(`staff?select=id,name,email,role,status,shift&email=eq.${encodeURIComponent(email)}&limit=1`, { headers: { Authorization: `Bearer ${token}` } });
  const staff = rows[0];
  if (!staff || staff.status !== 'active') throw new Error('Tài khoản chưa được cấp quyền hoạt động');
  return staff;
}

async function configureSupabase() {
  if (remoteEnabled) return;
  const root = typeof ROOT !== 'undefined' ? ROOT : '.';
  try {
    const response = await fetch(`${root}/assets/config/supabase.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('config unavailable');
    const config = await response.json();
    SUPABASE_URL = String(config.url || '').replace(/\/$/, '');
    SUPABASE_KEY = String(config.publishableKey || '');
    remoteEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);
  } catch (error) {
    console.warn('Supabase config unavailable; local fallback enabled.', error);
  }
}

async function readRemoteData() {
  if (!remoteEnabled) return null;
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  const secured = auth?.accessToken ? { headers: { Authorization: `Bearer ${auth.accessToken}` } } : null;
  const safeRead = async (resource, options = {}) => {
    try { return await apiFetch(resource, options); }
    catch (error) { console.warn(`Không thể tải ${resource.split('?')[0]} từ Supabase`, error); return []; }
  };
  const [menuItems, tables] = await Promise.all([safeRead('menuItems?select=*'), safeRead('tables?select=*')]);
  const canReadPayments = ['service', 'manager', 'admin'].includes(auth?.staff?.role);
  const [staff, orders, feedback, payments] = secured ? await Promise.all([
    safeRead('staff?select=*', secured),
    safeRead('orders?select=*&order=createdAt.desc', secured),
    safeRead('feedback?select=*&order=createdAt.desc', secured),
    canReadPayments ? safeRead('payments?select=*&order=created_at.desc', secured) : Promise.resolve([])
  ]) : [[], [], [], []];
  return {
    menuItems,
    tables: tables.map(t => ({ ...t, id: t.code || t.id })),
    staff,
    orders: orders.map(o => ({ ...o, table: o.table, createdAt: o.createdAt || o.created_at })),
    feedback,
    payments
  };
}

async function remoteWrite(resource, method, body, query = '', accessToken = '') {
  return apiFetch(`${resource}${query}`, { method, headers: { Prefer: 'return=representation', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify(body) });
}

const MENU_IMAGE_BUCKET = 'menu-images';
const MENU_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MENU_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

function validateMenuImage(file) {
  if (!(file instanceof File) || !file.size) throw new Error('Vui lòng chọn ảnh món ăn');
  if (!MENU_IMAGE_TYPES.has(file.type)) throw new Error('Ảnh phải có định dạng JPG, PNG hoặc WebP');
  if (file.size > MENU_IMAGE_MAX_SIZE) throw new Error('Ảnh không được lớn hơn 5 MB');
}

function menuImageExtension(file) {
  return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[file.type];
}

async function uploadMenuImage(file, itemId) {
  validateMenuImage(file);
  if (!remoteEnabled) throw new Error('Không kết nối được Supabase Storage');
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Phiên đăng nhập đã hết hạn');
  const objectName = `${itemId}.${menuImageExtension(file)}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${MENU_IMAGE_BUCKET}/${encodeURIComponent(objectName)}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': file.type,
      'x-upsert': 'false'
    },
    body: file
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `Không thể tải ảnh lên (${response.status})`);
  return {
    objectName,
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${MENU_IMAGE_BUCKET}/${encodeURIComponent(objectName)}`
  };
}

async function removeMenuImage(objectName) {
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!remoteEnabled || !auth?.accessToken || !objectName) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/${MENU_IMAGE_BUCKET}/${encodeURIComponent(objectName)}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${auth.accessToken}` }
  });
}

async function createMenuItemRemote(item) {
  if (!remoteEnabled) throw new Error('Không kết nối được Supabase');
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Phiên đăng nhập đã hết hạn');
  const rows = await remoteWrite('menuItems', 'POST', item, '', auth.accessToken);
  return rows?.[0] || item;
}

async function createStaffProfileRemote(profile) {
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Phiên đăng nhập đã hết hạn');
  const rows = await callRpc('create_staff_profile', {
    p_name: profile.name,
    p_email: profile.email,
    p_role: profile.role,
    p_shift: profile.shift
  }, auth.accessToken);
  return rows?.[0];
}

async function setStaffStatusRemote(id, status) {
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Phiên đăng nhập đã hết hạn');
  const rows = await callRpc('set_staff_status', { p_staff_id: id, p_status: status }, auth.accessToken);
  return rows?.[0];
}

async function callRpc(name, body, accessToken = '') {
  return apiFetch(`rpc/${name}`, { method: 'POST', headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, body: JSON.stringify(body) });
}

async function validateQrSession(table, token) {
  return callRpc('validate_dining_session', { p_table: table, p_token: token });
}

async function createQrSession(table) {
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Vui lòng đăng nhập lại');
  const rows = await callRpc('create_dining_session', { p_table: table }, auth.accessToken);
  return rows[0];
}

async function closeQrSession(table) {
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Vui lòng đăng nhập lại');
  return callRpc('close_dining_session', { p_table: table }, auth.accessToken);
}

async function requestPayment(method) {
  const qr = typeof getQrSession === 'function' ? getQrSession() : null;
  if (!qr) throw new Error('Không tìm thấy phiên QR');
  const rows = await callRpc('request_qr_payment', { p_table: qr.table, p_token: qr.token, p_method: method });
  return rows[0];
}

async function loadQrPayment(qr) {
  const rows = await callRpc('get_qr_payment', { p_table: qr.table, p_token: qr.token });
  return rows[0] || null;
}

async function submitQrFeedback(rating, message) {
  const qr = typeof getQrSession === 'function' ? getQrSession() : null;
  if (!qr?.table || !qr?.token) throw new Error('Không tìm thấy phiên QR. Vui lòng quét lại mã tại bàn.');
  const rows = await callRpc('submit_qr_feedback', {
    p_table: qr.table,
    p_token: qr.token,
    p_rating: rating,
    p_text: message
  });
  return rows?.[0] || null;
}

async function createOrderRemote(order) {
  if (!remoteEnabled) throw new Error('Không kết nối được máy chủ');
  const qr = typeof getQrSession === 'function' ? getQrSession() : null;
  if (!qr || qr.table !== order.table) throw new Error('Phiên QR của bàn không hợp lệ');
  await callRpc('place_qr_order', { p_table: order.table, p_token: qr.token, p_order_id: order.id, p_items: order.items, p_total: order.total, p_note: order.note });
}

async function updateOrderRemote(order) {
  if (!remoteEnabled) return;
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  await remoteWrite('orders', 'PATCH', { status: order.status, priority: order.priority, wait: order.wait, note: order.note }, `?id=eq.${encodeURIComponent(order.id)}`, auth?.accessToken);
}

async function updateMenuRemote(item) {
  if (!remoteEnabled) return;
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  await remoteWrite('menuItems', 'PATCH', { available: item.available }, `?id=eq.${encodeURIComponent(item.id)}`, auth?.accessToken);
}

async function createTableRemote(table) {
  if (!remoteEnabled) throw new Error('Không kết nối được Supabase');
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Phiên đăng nhập đã hết hạn');
  const rows = await remoteWrite('tables', 'POST', { code: table.id, zone: table.zone, seats: table.seats, status: table.status }, '', auth.accessToken);
  return rows?.[0] || table;
}

async function confirmPaymentRemote(paymentId) {
  const auth = typeof getAuthSession === 'function' ? getAuthSession() : null;
  if (!auth?.accessToken) throw new Error('Phiên đăng nhập đã hết hạn');
  return callRpc('confirm_payment', { p_payment_id: paymentId }, auth.accessToken);
}
