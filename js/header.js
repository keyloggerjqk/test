// ==========================================================================
// Quản lý Dark / Light Theme & Điều hướng Header
// ==========================================================================

const THEME_STORAGE_KEY = 'menumind:theme';

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối');
    btn.setAttribute('title', isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_STORAGE_KEY, next);
  applyTheme(next);
}

// Khởi tạo ngay lập tức khi load để tránh chớp màn hình
applyTheme(getPreferredTheme());

function mountThemeButton() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let headerActions = header.querySelector('.header-actions');
  const rolePill = header.querySelector('.role-pill');

  if (!headerActions) {
    headerActions = document.createElement('div');
    headerActions.className = 'header-actions';
    if (rolePill) {
      rolePill.parentNode.insertBefore(headerActions, rolePill);
      headerActions.appendChild(rolePill);
    } else {
      header.appendChild(headerActions);
    }
  }

  if (!headerActions.querySelector('.theme-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Chuyển đổi giao diện Sáng/Tối');
    btn.setAttribute('title', 'Chuyển đổi giao diện Sáng / Tối');
    btn.innerHTML = `
      <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      <span class="sr-only">Chế độ sáng/tối</span>
    `;
    headerActions.insertBefore(btn, headerActions.firstChild);
    applyTheme(getPreferredTheme());
  }
}

// Lắng nghe thay đổi theme từ các tab khác
window.addEventListener('storage', e => {
  if (e.key === THEME_STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
    applyTheme(e.newValue);
  }
});

// Điều hướng trên mobile (hamburger menu) & sự kiện click đổi theme
document.addEventListener('click', e => {
  const toggle = e.target.closest('.nav-toggle');
  if (toggle) {
    const nav = document.querySelector('#global-nav');
    if (!nav) return;
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('open', !isOpen);
    return;
  }

  const themeBtn = e.target.closest('.theme-toggle');
  if (themeBtn) {
    toggleTheme();
    return;
  }
});

// Tự động gắn nút theme vào header khi DOM sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountThemeButton);
} else {
  mountThemeButton();
}
