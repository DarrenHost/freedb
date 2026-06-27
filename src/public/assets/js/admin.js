/**
 * 后台管理公共 JS
 */
let isLoggedIn = false;

async function checkAuth() {
  try {
    const res = await fetch('/api/admin/check');
    const data = await res.json();
    if (data.success) {
      isLoggedIn = true;
      document.getElementById('username').textContent = data.data.name || '管理员';
    } else {
      const overlay = document.getElementById('login-overlay');
      if (overlay) overlay.classList.add('active');
    }
  } catch (e) {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('active');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pwd: md5(password) })
    });
    const data = await res.json();
    if (data.success) {
      isLoggedIn = true;
      document.getElementById('username').textContent = data.data.name || '管理员';
      document.getElementById('login-overlay').classList.remove('active');
      if (typeof loadStats === 'function') loadStats();
    } else {
      alert('登录失败：' + data.error);
    }
  } catch (e) {
    alert('登录失败：' + e.message);
  }
}

function logout() {
  fetch('/api/admin/logout', { method: 'POST' });
  isLoggedIn = false;
  location.reload();
}

// 初始化
if (typeof checkAuth === 'function') {
  checkAuth();
}
