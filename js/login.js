function loginPage() {
  // Static HTML is already present in login.html
}

document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.id !== 'login-form') return;
  e.preventDefault();
  if (!f.reportValidity()) return;

  const feedback = document.querySelector('#login-feedback');
  const button = f.querySelector('button[type="submit"]');
  const fd = new FormData(f);
  button.disabled = true;
  button.textContent = 'Đang xác thực...';
  feedback.className = 'form-feedback';
  feedback.textContent = '';

  try {
    const email = String(fd.get('email')).trim().toLowerCase();
    const password = String(fd.get('password'));
    const session = await signIn(email, password);
    const staff = await getStaffRole(session.user.email, session.access_token);
    sessionStorage.setItem('menumind:session', JSON.stringify({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: session.user,
      staff
    }));
    location.href = roleHome(staff.role);
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Đang nhập';
    feedback.className = 'form-feedback error';
    feedback.textContent = error.message || 'Không thể đăng nhập lúc này.';
  }
});

bootPage(loginPage);
