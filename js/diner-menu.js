const initialMenuQuery = new URLSearchParams(location.search).get('q') || '';
let menuFilters = { q: initialMenuQuery.trim(), category: 'Tất cả', sort: 'popular' };

function normalizeMenuText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeMenuTextWithAccents(value) {
  return String(value || '')
    .normalize('NFC')
    .toLocaleLowerCase('vi-VN')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function matchesMenuQuery(item, query) {
  const rawQuery = String(query || '');
  const accentSensitive = normalizeMenuTextWithAccents(rawQuery) !== normalizeMenuText(rawQuery);
  const normalize = accentSensitive ? normalizeMenuTextWithAccents : normalizeMenuText;
  const terms = normalize(rawQuery).split(' ').filter(Boolean);
  if (!terms.length) return true;
  const tags = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');
  const words = normalize(`${item.name || ''} ${item.category || ''} ${item.description || ''} ${tags}`).split(' ').filter(Boolean);
  return terms.every(term => words.some(word => word === term || (term.length >= 2 && word.startsWith(term))));
}

function containsAvoidedIngredient(item, avoid) {
  return String(avoid || '').split(',').map(term => term.trim()).filter(Boolean).some(term => matchesMenuQuery(item, term));
}

function dinerMenuPage() {
  const table = sessionStorage.getItem('menumind:table') || 'A01';
  const tableKicker = document.querySelector('.page-head .kicker');
  if (tableKicker) tableKicker.textContent = `Bàn ${table}`;
  renderCategories();
  renderMenu();
  if (typeof updateCartCount === 'function') updateCartCount();
}

function renderCategories() {
  const cats = ['Tất cả', ...new Set(appData.menuItems.map(i => i.category))];
  const container = document.querySelector('#category-filter');
  if (container) {
    container.innerHTML = cats.map(c => `<button type="button" class="chip ${menuFilters.category === c ? 'active' : ''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
  }
}

function renderMenu() {
  let items = appData.menuItems.filter(i => i.available && (menuFilters.category === 'Tất cả' || i.category === menuFilters.category) && matchesMenuQuery(i, menuFilters.q));
  if (menuFilters.sort === 'price-low') items.sort((a, b) => a.price - b.price);
  if (menuFilters.sort === 'time') items.sort((a, b) => a.time - b.time);
  if (menuFilters.sort === 'popular') items.sort((a, b) => b.orders - a.orders);
  const grid = document.querySelector('#menu-grid');
  const countEl = document.querySelector('#menu-count');
  if (countEl) countEl.textContent = items.length;
  if (grid) {
    grid.innerHTML = items.length ? items.map(dishCard).join('') : emptyState('Không thấy món phù hợp', 'Thử từ khóa khác hoặc xóa bộ lọc hiện tại.', `<button class="button quiet" data-action="clear-filter">Xóa bộ lọc</button>`);
  }
}

function dishCard(i) {
  return `<article class="dish-card"><a class="dish-visual tone-${i.id.slice(-1)}" data-dish-id="${escapeHtml(i.id)}" href="diner-dish-detail.html?id=${encodeURIComponent(i.id)}" aria-label="Xem ${escapeHtml(i.name)}">${dishPicture(i, 'dish-photo')}<small>${i.time} phút</small></a><div class="dish-body"><div class="dish-meta"><span>${escapeHtml(i.category)}</span><span>★ ${i.rating}</span></div><h3><a href="diner-dish-detail.html?id=${encodeURIComponent(i.id)}">${escapeHtml(i.name)}</a></h3><p>${escapeHtml(i.description)}</p><div class="dish-foot"><strong>${money(i.price)}</strong><button class="add-button" data-add="${escapeHtml(i.id)}" aria-label="Thêm ${escapeHtml(i.name)} vào giỏ">+</button></div></div></article>`;
}

function tasteScore(item, taste) {
  let score = Number(item.rating || 0) + Math.min(3, Number(item.orders || 0) / 50);
  const category = normalizeMenuText(item.category);
  if (taste === 'Thuần chay') score += item.vegetarian ? 12 : -100;
  if (taste === 'Thanh nhẹ') {
    if (item.vegetarian) score += 3;
    if (['khai vi', 'mon chay', 'do uong'].includes(category)) score += 4;
    ['thanh', 'tuoi', 'salad', 'rau', 'chanh'].forEach(term => { if (matchesMenuQuery(item, term)) score += 2; });
    score -= Number(item.spicy || 0) * 2;
  }
  if (taste === 'Đậm đà') {
    ['dam', 'nuong', 'sot', 'tieu', 'bo', 'heo'].forEach(term => { if (matchesMenuQuery(item, term)) score += 2; });
    if (category === 'do uong') score -= 6;
  }
  if (taste === 'Cay ấm') {
    score += Number(item.spicy || 0) * 5;
    ['cay', 'tieu', 'gung', 'ot'].forEach(term => { if (matchesMenuQuery(item, term)) score += 2; });
  }
  return score;
}

function runTasteAI(form) {
  const result = document.querySelector('#taste-result');
  const fields = new FormData(form);
  const taste = String(fields.get('taste') || '');
  const avoid = String(fields.get('avoid') || '').trim();
  if (!taste) {
    result.innerHTML = '<div class="ai-warning"><strong>AI chưa đủ dữ liệu</strong><p>Hãy chọn ít nhất một khẩu vị để nhận gợi ý chính xác.</p></div>';
    return;
  }
  result.innerHTML = `<div class="ai-loading"><span></span><p>Đang đối chiếu khẩu vị với ${appData.menuItems.length} món...</p></div>`;
  setTimeout(() => {
    const matches = appData.menuItems
      .filter(item => item.available && !containsAvoidedIngredient(item, avoid) && (taste !== 'Thuần chay' || item.vegetarian))
      .sort((a, b) => tasteScore(b, taste) - tasteScore(a, taste));
    const pick = matches[0];
    if (!pick) {
      result.innerHTML = `<div class="ai-warning"><strong>Không tìm thấy món an toàn</strong><p>Không có món nào vừa hợp “${escapeHtml(taste)}” vừa tránh “${escapeHtml(avoid)}”. Hãy điều chỉnh yêu cầu.</p></div>`;
      return;
    }
    const confidence = Math.min(98, Math.max(75, Math.round(78 + tasteScore(pick, taste))));
    const avoidReason = avoid ? `<li>Đã loại các món chứa “${escapeHtml(avoid)}” trong tên, mô tả hoặc thẻ món</li>` : '';
    result.innerHTML = `<article class="ai-answer"><p class="confidence">Độ phù hợp <strong>${confidence}%</strong></p><h3>${escapeHtml(pick.emoji || '🍽️')} ${escapeHtml(pick.name)}</h3><p contenteditable="false" id="ai-taste-copy">${escapeHtml(pick.description)}</p><details><summary>Vì sao có gợi ý này?</summary><ul><li>Khớp lựa chọn “${escapeHtml(taste)}”</li>${avoidReason}<li>Điểm đánh giá ${pick.rating}/5</li><li>Thời gian bếp dự kiến ${pick.time} phút</li></ul></details><div class="ai-actions"><button class="button small primary" data-ai-accept="${escapeHtml(pick.id)}">Chấp nhận</button><button class="button small quiet" data-action="edit-ai">Sửa</button><button class="link-button" data-action="regenerate-taste">Tạo lại</button><button class="link-button danger-text" data-action="reject-ai">Từ chối</button></div></article>`;
  }, 500);
}

// Event listeners specific to diner-menu
document.addEventListener('click', e => {
  const b = e.target.closest('button, a');
  if (!b) return;

  if (b.dataset.category) {
    menuFilters.category = b.dataset.category;
    renderCategories();
    renderMenu();
  }
  if (b.dataset.add) {
    if (typeof addToCart === 'function') addToCart(b.dataset.add);
  }
  if (b.dataset.aiAccept) {
    if (typeof addToCart === 'function') addToCart(b.dataset.aiAccept);
  }
  if (b.dataset.action === 'clear-filter') {
    menuFilters = { q: '', category: 'Tất cả', sort: 'popular' };
    const searchInput = document.querySelector('#menu-search');
    if (searchInput) searchInput.value = '';
    renderCategories();
    renderMenu();
  }
  if (b.dataset.action === 'edit-ai') {
    const p = b.closest('.ai-answer')?.querySelector('p[id], textarea');
    if (p) {
      p.contentEditable = 'true';
      p.focus();
      toast('Bạn có thể sửa nội dung trước khi lưu', 'info');
    }
  }
  if (b.dataset.action === 'reject-ai') {
    const res = b.closest('.ai-result');
    if (res) res.innerHTML = emptyState('Đã từ chối gợi ý', 'Bạn có thể điều chỉnh đầu vào và thử lại.');
  }
  if (b.dataset.action === 'regenerate-taste') {
    document.querySelector('#taste-form')?.requestSubmit();
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'menu-search') {
    menuFilters.q = e.target.value.trim().toLowerCase();
    renderMenu();
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'menu-sort') {
    menuFilters.sort = e.target.value;
    renderMenu();
  }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'taste-form') {
    e.preventDefault();
    runTasteAI(e.target);
  }
});

bootPage(dinerMenuPage);
