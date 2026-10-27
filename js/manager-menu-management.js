/**
 * ============================================================================
 * MENUMIND - MODULE QUẢN LÝ THỰC ĐƠN & BẢNG GIÁ (S12)
 * Nguyễn Hoàng Hải (SV3 - Leader)
 * 
 * 🗺️ CẤU TRÚC PHÂN ĐOẠN LOGIC (JS ARCHITECTURE):
 * ----------------------------------------------------------------------------
 * 1. KHỞI TẠO STATE & DATA STORE: debounce(), getMenuItems()
 * 2. RENDER GIAO DIỆN & TRÌNH BÀY DOM: renderMenuTableRows()
 * 3. BỘ LỌC ĐA TIÊU CHÍ & QUẢN LÝ TRẠNG THÁI: applyMenuFilters()
 * 4. LẮNG NGHE SỰ KIỆN TƯƠNG TÁC (EVENTS): Input, Change, Click, Toggle trạng thái
 * 5. XỬ LÝ BIỂU MẪU & VALIDATION: Submit #add-dish-form, kiểm tra hợp lệ
 * ============================================================================
 */

/* ==========================================================================
   PHẦN 1: HÀM TIỆN ÍCH & TRUY XUẤT DỮ LIỆU LOCALSTORAGE
   ========================================================================== */

/**
 * Hàm Debounce: Trì hoãn thực thi hàm cho đến khi người dùng ngừng thao tác
 * Giúp tối ưu hiệu năng khi gõ tìm kiếm liên tục
 */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Lấy danh sách món ăn từ LocalStorage (key: 'menumind:menuItems')
 * Tự động nạp danh sách mặc định nếu bộ nhớ chưa có dữ liệu
 */
function getMenuItems() {
  return getStore('menuItems', appData.menuItems || []);
}


/* ==========================================================================
   PHẦN 2: RENDER CÁC HÀNG CỦA BẢNG DỮ LIỆU (TABLE ROWS TEMPLATE)
   Logic: Sinh mã HTML cho từng món ăn (Ảnh, Tên, Danh mục, Giá, Trạng thái bán)
   ========================================================================== */
function renderMenuTableRows(items) {
  return items.map(item => `
    <tr>
      <td data-label="Món">
        <div class="table-title">
          <span class="tiny-food" data-dish-id="${escapeHtml(item.id)}">
            ${dishPicture(item, 'tiny-food-photo')}
          </span>
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${item.time || 15} phút · ★ ${item.rating || '5.0'}</small>
          </div>
        </div>
      </td>
      <td data-label="Danh mục">${escapeHtml(item.category)}</td>
      <td data-label="Giá"><strong>${money(item.price)}</strong></td>
      <td data-label="Lượt gọi">${item.orders || 0}</td>
      <td data-label="Trạng thái">${badge(item.available ? 'active' : 'inactive')}</td>
      <td data-label="Thao tác">
        <button 
          type="button"
          class="link-button ${item.available ? 'danger-text' : ''}" 
          data-toggle-dish="${escapeHtml(item.id)}">
          ${item.available ? 'Tạm ẩn' : 'Mở bán'}
        </button>
      </td>
    </tr>
  `).join('');
}


/* ==========================================================================
   PHẦN 3: LOGIC BỘ LỌC ĐA TIÊU CHÍ, BỘ ĐẾM KẾT QUẢ & XỬ LÝ TRẠNG THÁI RỖNG
   Logic:
   - Thu thập đồng thời: Từ khóa tìm kiếm + Giá trị lọc Danh mục + Giá trị lọc Trạng thái
   - Lọc mảng dữ liệu theo các điều kiện kết hợp
   - Cập nhật số đếm kết quả thực tế
   - Nếu kết quả rỗng ([]): Hiển thị Empty State với nút CTA khôi phục
   - Nếu có kết quả: Hiển thị bảng dữ liệu hoàn chỉnh
   ========================================================================== */
function applyMenuFilters() {
  const query = (document.querySelector('#manager-menu-search')?.value || '').trim().toLowerCase();
// Lấy từ khóa tìm kiếm, cắt khoảng trắng và đưa về chữ thường để so khớp không phân biệt hoa thường.
  const categoryFilter = document.querySelector('#manager-menu-category-filter')?.value || 'all';
  const statusFilter = document.querySelector('#manager-menu-status-filter')?.value || 'all';

  const allItems = getMenuItems();

  // Lọc kết hợp đa tiêu chí trên danh sách món ăn
  const filtered = allItems.filter(item => {
    const name = String(item.name || '').toLowerCase();
    const category = String(item.category || '').toLowerCase();
    const matchesQuery = !query || name.includes(query) || category.includes(query);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'available' ? item.available : !item.available);
    return matchesQuery && matchesCategory && matchesStatus;
  });

  // Có thể bổ sung sắp xếp mảng tại đây (ví dụ: theo giá hoặc theo tên A-Z)
  // filtered.sort((a, b) => a.price - b.price);

  const tableEl = document.querySelector('#manager-menu-table');
  const countBadge = document.querySelector('#menu-count-badge');

  // Cập nhật bộ đếm hiển thị số lượng kết quả
  if (countBadge) {
    countBadge.textContent = `Hiển thị ${filtered.length}/${allItems.length} món ăn`;
  }

  if (!tableEl) return;

  // Xử lý trạng thái rỗng (Empty State) khi không có món nào khớp
  if (filtered.length === 0) {
    tableEl.innerHTML = `
      <div class="table-empty-state">
        <span class="empty-icon" aria-hidden="true">🔍</span>
        <h3>Không tìm thấy món ăn phù hợp</h3>
        <p>Không có món nào khớp với từ khóa tìm kiếm và bộ lọc hiện tại.</p>
        <button type="button" class="button quiet" id="btn-reset-menu-filters">Xóa bộ lọc</button>
      </div>
    `;
  } else {
    // Trạng thái bình thường: Render bảng danh sách dữ liệu
    tableEl.innerHTML = `
      <table>
        <thead>
          <tr>
            <th scope="col">Món</th>
            <th scope="col">Danh mục</th>
            <th scope="col">Giá</th>
            <th scope="col">Lượt gọi</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${renderMenuTableRows(filtered)}
        </tbody>
      </table>
    `;
  }
}

function managerMenuPage() {
  applyMenuFilters();
}


/* ==========================================================================
   PHẦN 4: LẮNG NGHE VÀ ĐIỀU HƯỚNG SỰ KIỆN TƯƠNG TÁC NGƯỜI DÙNG
   Logic:
   - Debounce tìm kiếm khi gõ
   - Thay đổi dropdown bộ lọc
   - Xóa bộ lọc về mặc định ban đầu
   - Bật / Tắt trạng thái kinh doanh của món ăn
   ========================================================================== */

// 1. Tìm kiếm với cơ chế Debounce 300ms
const debouncedMenuSearch = debounce(() => {
  applyMenuFilters();
}, 300);

document.addEventListener('input', e => {
  if (e.target.id === 'manager-menu-search') {
    debouncedMenuSearch();
  }

  // Tự động làm sạch thông báo lỗi khi người dùng gõ sửa lại vào ô nhập
  if (e.target.id === 'dish-name') {
    const err = document.querySelector('#err-dish-name');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
  if (e.target.id === 'dish-price') {
    const err = document.querySelector('#err-dish-price');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
  if (e.target.id === 'dish-description') {
    const err = document.querySelector('#err-dish-desc');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
});

// 2. Lắng nghe thay đổi giá trị của các thẻ select bộ lọc & Xem trước ảnh tải lên
document.addEventListener('change', e => {
  if (e.target.id === 'manager-menu-category-filter' || e.target.id === 'manager-menu-status-filter') {
    applyMenuFilters();
  }

  // Xử lý tạo URL xem trước ảnh (Image Preview)
  if (e.target.id === 'dish-image') {
    const preview = document.querySelector('#dish-image-preview');
    const image = preview?.querySelector('img');
    const file = e.target.files?.[0];
    if (!preview || !image || !file) {
      if (preview) preview.hidden = true;
      return;
    }
    try {
      if (image.dataset.objectUrl) URL.revokeObjectURL(image.dataset.objectUrl);
      const objectUrl = URL.createObjectURL(file);
      image.dataset.objectUrl = objectUrl;
      image.src = objectUrl;
      const caption = preview.querySelector('figcaption');
      if (caption) caption.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
      preview.hidden = false;
    } catch {
      e.target.value = '';
      preview.hidden = true;
    }
  }
});

// 3. Xử lý sự kiện click: Nút Đặt lại bộ lọc (Reset) & Nút Đổi trạng thái món
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  // Đặt lại toàn bộ ô tìm kiếm và các dropdown về trạng thái ban đầu
  if (b.id === 'btn-reset-menu-filters') {
    const searchInput = document.querySelector('#manager-menu-search');
    const catSelect = document.querySelector('#manager-menu-category-filter');
    const statusSelect = document.querySelector('#manager-menu-status-filter');
    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = 'all';
    if (statusSelect) statusSelect.value = 'all';
    applyMenuFilters();
    toast('Đã đặt lại bộ lọc thực đơn về mặc định');
    return;
  }

  // Chuyển đổi trạng thái Đang bán <-> Tạm ẩn
  if (b.dataset.toggleDish) {
    const items = getMenuItems();
    const item = items.find(x => x.id === b.dataset.toggleDish);
    if (!item) return;

    item.available = !item.available;
    setStore('menuItems', items);
    appData.menuItems = items;
    applyMenuFilters();

    const actionText = item.available ? 'Mở bán lại' : 'Tạm ẩn';
    toast(`Đã ${actionText.toLowerCase()} món "${item.name}"`);

    if (typeof updateMenuRemote === 'function') {
      updateMenuRemote(item).catch(console.warn);
    }
  }
});


/* ==========================================================================
   PHẦN 5: XỬ LÝ FORM THÊM MỚI MÓN ĂN & KIỂM SOÁT HỢP LỆ (FORM VALIDATION)
   Logic:
   - Kiểm tra tên món: Bắt buộc, tối thiểu 3 ký tự
   - Kiểm tra giá bán: Bắt buộc số nguyên, tối thiểu 10.000₫
   - Kiểm tra mô tả: Bắt buộc, tối thiểu 10 ký tự
   - Hiển thị thông báo lỗi màu đỏ ngay dưới ô nhập sai
   - Ngăn chặn gửi lặp (Anti double-submit)
   - Lưu bản ghi mới vào đầu danh sách LocalStorage và render lại
   ========================================================================== */
document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.id !== 'add-dish-form') return;
  e.preventDefault();

  const fd = new FormData(f);
  const name = String(fd.get('name') || '').trim();
  const category = String(fd.get('category') || 'Món chính');
  const price = parseInt(fd.get('price'), 10);
  const description = String(fd.get('description') || '').trim();
  const file = fd.get('image');

  const errName = document.querySelector('#err-dish-name');
  const errPrice = document.querySelector('#err-dish-price');
  const errDesc = document.querySelector('#err-dish-desc');

  let isValid = true;

  // 1. Kiểm tra tính hợp lệ của Tên món ăn
  if (!name || name.length < 3) {
    if (errName) {
      errName.textContent = 'Tên món ăn phải có ít nhất 3 ký tự.';
      errName.classList.add('active');
    }
    isValid = false;
  }

  // 2. Kiểm tra tính hợp lệ của Giá bán
  if (isNaN(price) || price < 10000) {
    if (errPrice) {
      errPrice.textContent = 'Giá bán phải tối thiểu 10.000₫.';
      errPrice.classList.add('active');
    }
    isValid = false;
  }

  // 3. Kiểm tra tính hợp lệ của Mô tả món
  if (!description || description.length < 10) {
    if (errDesc) {
      errDesc.textContent = 'Mô tả món ăn phải có ít nhất 10 ký tự.';
      errDesc.classList.add('active');
    }
    isValid = false;
  }

  if (!isValid) return;

  // Khóa nút submit để chống double-submit
  const submitButton = document.querySelector('#btn-save-dish');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Đang lưu món...';
  }

  try {
    const items = getMenuItems();
    const id = uid('m');

    let imagePath = 'assets/images/menu/m01.jpg';
    if (file && file.size > 0 && typeof uploadMenuImage === 'function') {
      const uploaded = await uploadMenuImage(file, id).catch(() => null);
      if (uploaded) imagePath = uploaded;
    }

    const newDish = {
      id,
      name,
      category,
      price,
      time: 15,
      spicy: 0,
      vegetarian: category === 'Món chay',
      available: true,
      rating: 5.0,
      orders: 0,
      emoji: '🍽️',
      image: imagePath,
      description,
      tags: ['mới', category.toLowerCase()]
    };

    items.unshift(newDish);
    setStore('menuItems', items);
    appData.menuItems = items;

    document.querySelector('#dish-dialog')?.close();
    f.reset();
    const preview = document.querySelector('#dish-image-preview');
    if (preview) preview.hidden = true;

    applyMenuFilters();
    toast(`Đã thêm món "${name}" vào thực đơn`);
  } catch (error) {
    toast(`Không thể thêm món: ${error.message}`, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Lưu món';
    }
  }
});

// Khởi chạy nạp dữ liệu ban đầu cho trang
bootPage(managerMenuPage);
