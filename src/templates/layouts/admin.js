/**
 * 后台管理系统布局模板
 * @param {Object} params - 模板参数
 * @returns {string} HTML 字符串
 */
export function adminLayout(params) {
  const { title, content, activeNav = 'dashboard', customStyles = '', customScripts = '' } = params;
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - FreeDB</title>
  <style>
    :root{--primary:#667eea;--primary-dark:#5568d3;--bg:#f5f7fa;--sidebar:#1a1a2e;--text:#262626}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}
    .sidebar{width:250px;background:var(--sidebar);color:#fff;position:fixed;height:100vh;overflow-y:auto}
    .sidebar-header{padding:20px;border-bottom:1px solid rgba(255,255,255,0.1)}
    .sidebar-header h2{font-size:1.5em}
    .sidebar-header h2 span{color:var(--primary)}
    .sidebar-nav{padding:20px 0}
    .sidebar-nav a{display:flex;align-items:center;gap:10px;padding:12px 20px;color:rgba(255,255,255,0.8);text-decoration:none;transition:all 0.2s}
    .sidebar-nav a:hover,.sidebar-nav a.active{background:rgba(255,255,255,0.1);color:#fff}
    .sidebar-nav a .icon{font-size:1.2em}
    .main-content{flex:1;margin-left:250px;padding:30px}
    .header{background:#fff;padding:20px 30px;border-radius:12px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .header h1{font-size:1.8em;color:var(--primary)}
    .user-info{display:flex;align-items:center;gap:15px}
    .user-info span{color:#8c8c8c}
    .logout-btn{padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer}
    ${customStyles}
  </style>
</head>
<body>
  ${sidebarComponent(activeNav)}
  <main class="main-content">
    <div class="header">
      <h1>${title}</h1>
      <div class="user-info">
        <span id="username">管理员</span>
        <button class="logout-btn" onclick="logout()">退出登录</button>
      </div>
    </div>
    ${content}
  </main>
  <script src="/assets/js/md5.js"></script>
  <script src="/assets/js/admin.js"></script>
  ${customScripts}
</body>
</html>`;
}

/**
 * 侧边栏组件
 * @param {string} activeNav - 当前激活的导航项
 * @returns {string} HTML 字符串
 */
function sidebarComponent(activeNav) {
  const navItems = [
    { id: 'dashboard', icon: '🏠', text: '控制台', href: '/admin/dashboard' },
    { id: 'users', icon: '👤', text: '用户管理', href: '/admin/users' },
    { id: 'tokens', icon: '🔑', text: 'Token 管理', href: '/admin/tokens' },
    { id: 'visits', icon: '📊', text: '访问统计', href: '/admin/visits' },
    { id: 'docs', icon: '📚', text: 'API 文档', href: '/' }
  ];
  
  return `<aside class="sidebar">
    <div class="sidebar-header">
      <h2>Free<span>DB</span></h2>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <a href="${item.href}" class="${item.id === activeNav ? 'active' : ''}">
          <span class="icon">${item.icon}</span> ${item.text}
        </a>
      `).join('')}
    </nav>
  </aside>`;
}

/**
 * 登录弹窗组件
 * @returns {string} HTML 字符串
 */
export function loginModalComponent() {
  return `<div class="login-overlay" id="login-overlay">
    <div class="login-box">
      <h2>🔐 后台登录</h2>
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>邮箱</label>
          <input type="email" id="email" required placeholder="admin@example.com">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" id="password" required placeholder="请输入密码">
        </div>
        <button type="submit" class="login-btn">登录</button>
      </form>
    </div>
  </div>`;
}
