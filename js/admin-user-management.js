/**
 * ============================================================================
 * MENUMIND - MODULE QUẢN LÝ TÀI KHOẢN NHÂN SỰ & PHÂN QUYỀN (S15)
 * Nguyễn Hoàng Hải (SV3 - Leader)
 * 
 * 🗺️ CẤU TRÚC PHÂN ĐOẠN LOGIC (JS ARCHITECTURE):
 * ----------------------------------------------------------------------------
 * 1. QUẢN LÝ DỮ LIỆU NHÂN SỰ: staffDirectory(), roleDisplayName()
 * 2. RENDER BẢNG TÀI KHOẢN: renderUserTableRows()
 * 3. BỘ LỌC ĐA TIÊU CHÍ & SỐ ĐẾM: applyFilters()
 * 4. LẮNG NGHE SỰ KIỆN: Debounce tìm kiếm, Kích hoạt / Vô hiệu hóa tài khoản
 * 5. XỬ LÝ FORM TẠO MỚI & KIỂM TRA CHỐNG TRÙNG LẶP: #add-user-form
 * ============================================================================
 */

/* ==========================================================================
   PHẦN 1: TIỆN ÍCH & TRUY XUẤT DANH SÁCH NHÂN SỰ TỪ LOCALSTORAGE
   ========================================================================== */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function staffDirectory() {
  const remoteStaff = getStore('staff', appData.staff || []);
  const currentStaff = getAuthSession()?.staff;
  const directory = Array.isArray(remoteStaff) ? [...remoteStaff] : [];
  if (currentStaff?.email && !directory.some(item => String(item.email).toLowerCase() === String(currentStaff.email).toLowerCase())) {
    directory.unshift({ ...currentStaff, shift: currentStaff.shift || 'Chưa thiết lập', currentSession: true });
  }
  return directory;
}

function roleDisplayName(role) {
  const roles = {
    kitchen: 'Nhân viên bếp',
    manager: 'Quản lý',
    admin: 'Quản trị viên',
    service: 'Phục vụ'
  };
  return roles[role] || role || 'Chưa gán';
}


/* ==========================================================================
   PHẦN 2: RENDER CÁC HÀNG CỦA BẢNG TÀI KHOẢN (TABLE ROWS TEMPLATE)
   Logic: Sinh avatar viết tắt, tên, email, nhãn vai trò, ca làm, trạng thái
   ========================================================================== */
function renderUserTableRows(staffList) {
  const currentEmail = String(getAuthSession()?.staff?.email || '').toLowerCase();

  return staffList.map(user => {
    const name = String(user.name || user.email || 'Tài khoản');
    const email = String(user.email || 'Chưa có email');
    const isCurrent = email.toLowerCase() === currentEmail;
    const initial = escapeHtml((name.split(' ').slice(-1)[0] || '?')[0].toUpperCase());

    return `
      <tr>
        <td data-label="Nhân viên">
          <div class="table-title">
            <span class="avatar" aria-hidden="true">${initial}</span>
            <div>
              <strong>${escapeHtml(name)}${isCurrent ? ' <small class="current-account">Bạn</small>' : ''}</strong>
              <small>${escapeHtml(email)}</small>
            </div>
          </div>
        </td>
        <td data-label="Vai trò">${escapeHtml(roleDisplayName(user.role))}</td>
        <td data-label="Ca làm">${escapeHtml(user.shift || 'Linh hoạt')}</td>
        <td data-label="Trạng thái">${badge(user.status || 'active')}</td>
        <td data-label="Thao tác">
          <button 
            type="button"
            class="link-button ${user.status === 'active' ? 'danger-text' : ''}" 
            data-toggle-user="${escapeHtml(user.id)}" 
            ${isCurrent ? 'disabled title="Không thể vô hiệu hóa tài khoản đang đăng nhập"' : ''}>
            ${isCurrent ? 'Đang đăng nhập' : user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}


/* ==========================================================================
   PHẦN 3: BỘ LỌC ĐA TIÊU CHÍ, SỐ ĐẾM KẾT QUẢ & XỬ LÝ TRẠNG THÁI RỖNG
   Logic:
   - Lọc kết hợp: Từ khóa (Tên / Email) + Phân quyền vai trò + Trạng thái hoạt động
   - Cập nhật số lượng nhân sự hiển thị
   - Hiển thị Empty State khi không tìm thấy ai phù hợp
   ========================================================================== */
function applyFilters() {
  const query = (document.querySelector('#user-search')?.value || '').trim().toLowerCase();
  const roleFilter = document.querySelector('#user-role-filter')?.value || 'all';
  const statusFilter = document.querySelector('#user-status-filter')?.value || 'all';

  const allStaff = staffDirectory();

  // Lọc kết hợp 3 điều kiện đồng thời
  const filtered = allStaff.filter(user => {
    const name = String(user.name || '').toLowerCase();
    const email = String(user.email || '').toLowerCase();
    const matchesQuery = !query || name.includes(query) || email.includes(query);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const tableEl = document.querySelector('#user-table');
  const countBadge = document.querySelector('#user-count-badge');

  // Cập nhật bộ đếm hiển thị
  if (countBadge) {
    countBadge.textContent = `Hiển thị ${filtered.length}/${allStaff.length} nhân sự`;
  }

  if (!tableEl) return;

  // Xử lý Empty State khi mảng rỗng
  if (filtered.length === 0) {
    tableEl.innerHTML = `
      <div class="table-empty-state">
        <span class="empty-icon" aria-hidden="true">👥</span>
        <h3>Không tìm thấy nhân viên phù hợp</h3>
        <p>Thử điều chỉnh lại từ khóa tìm kiếm hoặc đặt lại các bộ lọc vai trò, trạng thái.</p>
        <button type="button" class="button quiet" id="btn-reset-filters">Xóa bộ lọc</button>
      </div>
    `;
  } else {
    tableEl.innerHTML = `
      <table>
        <thead>
          <tr>
            <th scope="col">Nhân viên</th>
            <th scope="col">Vai trò</th>
            <th scope="col">Ca làm việc</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${renderUserTableRows(filtered)}
        </tbody>
      </table>
    `;
  }
}

function adminUsersPage() {
  applyFilters();
}


/* ==========================================================================
   PHẦN 4: LẮNG NGHE SỰ KIỆN TƯƠNG TÁC (DEBOUNCE SEARCH & ĐỔI TRẠNG THÁI)
   Logic:
   - Debounce tìm kiếm khi nhập liệu
   - Reset toàn bộ bộ lọc
   - Đổi trạng thái tài khoản giữa Hoạt động <-> Vô hiệu hóa
   ========================================================================== */
const debouncedSearch = debounce(() => {
  applyFilters();
}, 300);

document.addEventListener('input', e => {
  if (e.target.id === 'user-search') {
    debouncedSearch();
  }

  // Xóa cảnh báo lỗi khi người dùng gõ sửa
  if (e.target.id === 'add-user-name') {
    const err = document.querySelector('#err-name');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
  if (e.target.id === 'add-user-email') {
    const err = document.querySelector('#err-email');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'user-role-filter' || e.target.id === 'user-status-filter') {
    applyFilters();
  }
});

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  // Nút đặt lại tất cả bộ lọc về mặc định
  if (b.id === 'btn-reset-filters') {
    const searchInput = document.querySelector('#user-search');
    const roleSelect = document.querySelector('#user-role-filter');
    const statusSelect = document.querySelector('#user-status-filter');
    if (searchInput) searchInput.value = '';
    if (roleSelect) roleSelect.value = 'all';
    if (statusSelect) statusSelect.value = 'all';
    applyFilters();
    toast('Đã đặt lại tất cả bộ lọc');
    return;
  }

  // Vô hiệu hóa hoặc Kích hoạt tài khoản nhân sự
  if (b.dataset.toggleUser) {
    const allStaff = staffDirectory();
    const user = allStaff.find(u => u.id === b.dataset.toggleUser);
    if (!user) return;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    setStore('staff', allStaff);
    applyFilters();
    toast(`Đã ${user.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản ${user.name}`);
  }
});


/* ==========================================================================
   PHẦN 5: XỬ LÝ BIỂU MẪU TẠO TÀI KHOẢN & KIỂM TRA CHỐNG TRÙNG LẶP
   Logic:
   - Validate Họ tên: Bắt buộc, tối thiểu 3 ký tự
   - Validate Email: Bắt buộc, đúng định dạng Regex
   - Kiểm tra chống trùng lặp: Duyệt mảng đảm bảo email chưa từng tồn tại
   - Lưu tài khoản mới vào LocalStorage
   ========================================================================== */
document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.id !== 'add-user-form') return;
  e.preventDefault();

  const fd = new FormData(f);
  const name = String(fd.get('name') || '').trim();
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const role = String(fd.get('role') || 'service');
  const shift = String(fd.get('shift') || 'Linh hoạt');

  const errName = document.querySelector('#err-name');
  const errEmail = document.querySelector('#err-email');

  let isValid = true;

  // 1. Kiểm tra Họ và tên
  if (!name || name.length < 3) {
    if (errName) {
      errName.textContent = 'Họ và tên phải có ít nhất 3 ký tự.';
      errName.classList.add('active');
    }
    isValid = false;
  }

  // 2. Kiểm tra định dạng Email chuẩn
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    if (errEmail) {
      errEmail.textContent = 'Vui lòng nhập định dạng email hợp lệ (ví dụ: user@menumind.vn).';
      errEmail.classList.add('active');
    }
    isValid = false;
  }

  // 3. Cơ chế kiểm tra chống trùng lặp dữ liệu Email
  const allStaff = staffDirectory();
  const isDuplicate = allStaff.some(u => String(u.email || '').toLowerCase() === email);
  if (isDuplicate) {
    if (errEmail) {
      errEmail.textContent = 'Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác!';
      errEmail.classList.add('active');
    }
    isValid = false;
  }

  if (!isValid) return;

  const submitButton = document.querySelector('#btn-save-user');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Đang tạo tài khoản...';
  }

  try {
    const newUser = {
      id: uid('u'),
      name,
      email,
      role,
      shift,
      status: 'active'
    };

    allStaff.unshift(newUser);
    setStore('staff', allStaff);

    document.querySelector('#user-dialog')?.close();
    f.reset();
    applyFilters();
    toast(`Đã thêm nhân viên ${name} (${roleDisplayName(role)})`);
  } catch (error) {
    toast(`Không thể tạo tài khoản: ${error.message}`, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Lưu tài khoản';
    }
  }
});

// Khởi chạy nạp dữ liệu ban đầu
bootPage(adminUsersPage);
