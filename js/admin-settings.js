/**
 * ============================================================================
 * MENUMIND - MODULE CÀI ĐẶT HỆ THỐNG NHÀ HÀNG (S16)
 * Nguyễn Hoàng Hải (SV3 - Leader)
 * 
 * 🗺️ CẤU TRÚC PHÂN ĐOẠN LOGIC (JS ARCHITECTURE):
 * ----------------------------------------------------------------------------
 * 1. CẤU HÌNH MẶC ĐỊNH: DEFAULT_SETTINGS, getSystemSettings()
 * 2. ĐỔ DỮ LIỆU LÊN FORM: populateSettingsForm() (Đồng bộ CSS class theme)
 * 3. XỬ LÝ LỖI FORM & XEM TRƯỚC GIAO DIỆN: Event input, change #setting-dark
 * 4. LƯU CẤU HÌNH & KIỂM TRA HỢP LỆ: Submit #settings-form
 * 5. KHÔI PHỤC MẶC ĐỊNH (DANGER RESET): Click #btn-reset-defaults kèm xác nhận
 * ============================================================================
 */

/* ==========================================================================
   PHẦN 1: CẤU HÌNH MẶC ĐỊNH & TRUY XUẤT TỪ LOCALSTORAGE
   ========================================================================== */
const DEFAULT_SETTINGS = {
  name: 'MenuMind Bistro',
  phone: '024 7300 1220',
  currency: 'VND',
  alerts: true,
  alertTime: 15,
  dark: false,
  language: 'vi'
};

function getSystemSettings() {
  return getStore('settings', DEFAULT_SETTINGS);
}


/* ==========================================================================
   PHẦN 2: ĐIỀN DỮ LIỆU VÀO CÁC Ô NHẬP & KÍCH HOẠT CHẾ ĐỘ HIỂN THỊ
   Logic: Lấy cấu hình đã lưu và điền vào form, đồng thời áp dụng class giao diện
   ========================================================================== */
function populateSettingsForm(cfg) {
  const nameInput = document.querySelector('#setting-name');
  const phoneInput = document.querySelector('#setting-phone');
  const currencySelect = document.querySelector('#setting-currency');
  const alertsInput = document.querySelector('#setting-alerts');
  const alertTimeInput = document.querySelector('#setting-alert-time');
  const darkInput = document.querySelector('#setting-dark');
  const langSelect = document.querySelector('#setting-lang');

  if (nameInput) nameInput.value = cfg.name || DEFAULT_SETTINGS.name;
  if (phoneInput) phoneInput.value = cfg.phone || DEFAULT_SETTINGS.phone;
  if (currencySelect) currencySelect.value = cfg.currency || DEFAULT_SETTINGS.currency;
  if (alertsInput) alertsInput.checked = Boolean(cfg.alerts);
  if (alertTimeInput) alertTimeInput.value = cfg.alertTime || DEFAULT_SETTINGS.alertTime;
  if (darkInput) darkInput.checked = Boolean(cfg.dark);
  if (langSelect) langSelect.value = cfg.language || DEFAULT_SETTINGS.language;

  // Cập nhật chế độ hiển thị tương phản cao
  document.documentElement.classList.toggle('high-contrast', Boolean(cfg.dark));
}

function settingsPage() {
  const cfg = getSystemSettings();
  populateSettingsForm(cfg);
}


/* ==========================================================================
   PHẦN 3: LẮNG NGHE SỰ KIỆN GÕ PHÍM & XEM TRƯỚC TƯƠNG PHẢN (LIVE PREVIEW)
   Logic:
   - Xóa cảnh báo lỗi khi người dùng gõ sửa lại vào ô nhập
   - Xem trước thay đổi màu nền tương phản cao ngay lập tức khi tích chọn
   ========================================================================== */
document.addEventListener('input', e => {
  const target = e.target;
  if (target.id === 'setting-name') {
    const err = document.querySelector('#err-setting-name');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
  if (target.id === 'setting-phone') {
    const err = document.querySelector('#err-setting-phone');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
  if (target.id === 'setting-alert-time') {
    const err = document.querySelector('#err-setting-alert-time');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
  }
});

// Xem trước thay đổi chế độ tương phản cao ngay lập tức khi bật/tắt checkbox
document.addEventListener('change', e => {
  if (e.target.id === 'setting-dark') {
    document.documentElement.classList.toggle('high-contrast', e.target.checked);
  }
});


/* ==========================================================================
   PHẦN 4: BIỂU MẪU (FORM) VALIDATION & LƯU CẤU HÌNH VÀO LOCALSTORAGE
   Logic:
   - Kiểm tra Tên nhà hàng: Bắt buộc, tối thiểu 3 ký tự
   - Kiểm tra Số điện thoại: Bắt buộc, đúng chuẩn regex từ 9 đến 15 số
   - Kiểm tra Thời gian chờ cảnh báo: Bắt buộc từ 5 đến 60 phút
   - Lưu đối tượng cấu hình mới vào LocalStorage và cập nhật trạng thái theme
   ========================================================================== */
document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.id !== 'settings-form') return;
  e.preventDefault();

  const fd = new FormData(f);
  const name = String(fd.get('name') || '').trim();
  const phone = String(fd.get('phone') || '').trim();
  const alertTime = parseInt(fd.get('alertTime'), 10);
  const currency = String(fd.get('currency') || 'VND');
  const alerts = fd.has('alerts');
  const dark = fd.has('dark');
  const language = String(fd.get('language') || 'vi');

  const errName = document.querySelector('#err-setting-name');
  const errPhone = document.querySelector('#err-setting-phone');
  const errAlertTime = document.querySelector('#err-setting-alert-time');

  let isValid = true;

  // 1. Validate Tên nhà hàng
  if (!name || name.length < 3) {
    if (errName) {
      errName.textContent = 'Tên nhà hàng phải có ít nhất 3 ký tự.';
      errName.classList.add('active');
    }
    isValid = false;
  }

  // 2. Validate Số điện thoại
  const phoneRegex = /^[0-9\s+()-]{9,15}$/;
  if (!phone || !phoneRegex.test(phone)) {
    if (errPhone) {
      errPhone.textContent = 'Vui lòng nhập số điện thoại hợp lệ (9 đến 15 số).';
      errPhone.classList.add('active');
    }
    isValid = false;
  }

  // 3. Validate Thời gian chờ cảnh báo
  if (isNaN(alertTime) || alertTime < 5 || alertTime > 60) {
    if (errAlertTime) {
      errAlertTime.textContent = 'Thời gian cảnh báo phải từ 5 đến 60 phút.';
      errAlertTime.classList.add('active');
    }
    isValid = false;
  }

  if (!isValid) return;

  const submitButton = document.querySelector('#btn-save-settings');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Đang lưu cài đặt...';
  }

  try {
    const updatedSettings = {
      name,
      phone,
      currency,
      alerts,
      alertTime,
      dark,
      language,
      updatedAt: new Date().toISOString()
    };

    setStore('settings', updatedSettings);

    // Kích hoạt theme tương phản cao nếu được chọn
    document.documentElement.classList.toggle('high-contrast', dark);

    toast('Đã lưu cấu hình hệ thống thành công');
  } catch (error) {
    toast(`Không thể lưu cấu hình: ${error.message}`, 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Lưu cài đặt';
    }
  }
});


/* ==========================================================================
   PHẦN 5: VÙNG NGUY HIỂM (DANGER ZONE) - KHÔI PHỤC CẤU HÌNH VỀ MẶC ĐỊNH
   Logic:
   - Hiển thị hộp thoại xác nhận window.confirm() để phòng tránh bấm nhầm
   - Ghi đè LocalStorage bằng cấu hình mặc định DEFAULT_SETTINGS
   - Xóa bỏ toàn bộ thông báo lỗi đang hiển thị
   ========================================================================== */
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.id === 'btn-reset-defaults') {
    // Bước xác nhận trước khi thực hiện hành động nguy hiểm
    const confirmed = window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình về mặc định ban đầu không?');
    if (!confirmed) return;

    setStore('settings', DEFAULT_SETTINGS);
    populateSettingsForm(DEFAULT_SETTINGS);

    // Xóa tất cả các thông báo lỗi nếu có
    document.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('active');
    });

    toast('Đã khôi phục cấu hình hệ thống về mặc định', 'info');
  }
});

// Khởi chạy nạp dữ liệu ban đầu
bootPage(settingsPage);
