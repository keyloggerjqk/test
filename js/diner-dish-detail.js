function dishDetailPage() {
  const id = new URLSearchParams(location.search).get('id') || 'm01';
  const i = appData.menuItems.find(x => x.id === id) || appData.menuItems[0];
  if (!i) return;

  const visual = document.querySelector('#detail-visual');
  const img = document.querySelector('#dish-img');
  const cat = document.querySelector('#dish-category');
  const time = document.querySelector('#dish-time');
  const rating = document.querySelector('#dish-rating');
  const tags = document.querySelector('#dish-tags');
  const name = document.querySelector('#dish-name');
  const desc = document.querySelector('#dish-desc');
  const spicy = document.querySelector('#dish-spicy');
  const price = document.querySelector('#dish-price');
  const menuIdInput = document.querySelector('#dish-menuId');
  const total = document.querySelector('#dish-total');
  const form = document.querySelector('#dish-form');

  if (visual) visual.className = `detail-visual tone-${i.id.slice(-1)}`;
  if (img) {
    img.src = dishImage(i);
    img.alt = i.name;
  }
  if (cat) cat.textContent = i.category;
  if (time) time.textContent = `${i.time} phút chuẩn bị`;
  if (rating) rating.textContent = `★ ${i.rating} · ${i.orders} lượt gọi`;
  if (tags) tags.textContent = (i.tags || []).join(' · ');
  if (name) name.textContent = i.name;
  if (desc) desc.textContent = i.description;
  if (spicy) spicy.textContent = '🌶️'.repeat(i.spicy) || 'Không cay';
  if (price) price.textContent = money(i.price);
  if (menuIdInput) menuIdInput.value = i.id;
  if (total) total.textContent = money(i.price);
  if (form) form.dataset.price = i.price;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.step) {
    const q = document.querySelector('#dish-qty');
    if (q) {
      q.value = Math.min(10, Math.max(1, +q.value + +b.dataset.step));
      q.dispatchEvent(new Event('input'));
    }
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'dish-qty') {
    const form = document.querySelector('#dish-form');
    const totalEl = document.querySelector('#dish-total');
    if (form && totalEl) {
      totalEl.textContent = money(+form.dataset.price * +e.target.value);
    }
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id !== 'dish-form') return;
  e.preventDefault();
  const fd = new FormData(f);
  const menuId = String(fd.get('menuId') || '');
  const button = f.querySelector('button[type="submit"]');

  if (!appData.menuItems.some(item => item.id === menuId)) {
    toast('Không tìm thấy món để thêm vào giỏ', 'error');
    return;
  }
  if (typeof addToCart === 'function') {
    if (!addToCart(menuId, +fd.get('qty'), String(fd.get('note') || ''))) return;
  }
  if (button) {
    button.disabled = true;
    button.textContent = 'Đã thêm vào giỏ';
  }
  setTimeout(() => {
    location.href = 'diner-menu.html';
  }, 450);
});

bootPage(dishDetailPage);
