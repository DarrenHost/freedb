import { adminLayout, loginModalComponent } from '../layouts/admin.js';

/**
 * 控制台页面模板
 * @returns {string} HTML 字符串
 */
export function dashboardPage() {
  const content = `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>总用户数</h3>
        <div class="value" id="stat-users">-</div>
        <div class="change">活跃用户：<span id="stat-active">-</span></div>
      </div>
      <div class="stat-card">
        <h3>Token 总数</h3>
        <div class="value" id="stat-tokens">-</div>
        <div class="change">启用：<span id="stat-tokens-active">-</span></div>
      </div>
      <div class="stat-card">
        <h3>今日访问</h3>
        <div class="value" id="stat-visits">-</div>
        <div class="change">平均响应：<span id="stat-avg">-</span></div>
      </div>
    </div>
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-grid">
        <button class="action-btn" onclick="location.href='/admin/users'">
          <div class="icon">👤</div>
          <h4>用户管理</h4>
          <p>管理系统用户</p>
        </button>
        <button class="action-btn" onclick="location.href='/admin/tokens'">
          <div class="icon">🔑</div>
          <h4>Token 管理</h4>
          <p>API 访问令牌</p>
        </button>
        <button class="action-btn" onclick="location.href='/admin/visits'">
          <div class="icon">📊</div>
          <h4>访问统计</h4>
          <p>查看访问日志</p>
        </button>
      </div>
    </div>
  `;
  
  const styles = `
    .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px}
    .stat-card{background:#fff;padding:25px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .stat-card h3{color:#8c8c8c;font-size:14px;margin-bottom:10px}
    .stat-card .value{font-size:32px;font-weight:700;color:var(--primary)}
    .stat-card .change{font-size:12px;color:#2ecc71;margin-top:5px}
    .quick-actions{background:#fff;padding:25px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .quick-actions h3{margin-bottom:20px}
    .action-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}
    .action-btn{padding:20px;border:1px solid #e0e0e0;border-radius:8px;background:#fff;cursor:pointer;text-align:left;transition:all 0.2s}
    .action-btn:hover{border-color:var(--primary);background:#f8f9ff}
    .action-btn .icon{font-size:2em;margin-bottom:10px}
    .action-btn h4{font-size:14px;margin-bottom:5px}
    .action-btn p{font-size:12px;color:#8c8c8c}
    .login-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:none;align-items:center;justify-content:center;z-index:1000}
    .login-overlay.active{display:flex}
    .login-box{background:#fff;padding:40px;border-radius:12px;width:100%;max-width:400px}
    .login-box h2{text-align:center;margin-bottom:30px;color:var(--primary)}
    .form-group{margin-bottom:20px}
    .form-group label{display:block;margin-bottom:8px;color:#333;font-weight:500}
    .form-group input{width:100%;padding:12px 15px;border:1px solid #ddd;border-radius:8px;font-size:14px}
    .form-group input:focus{outline:none;border-color:var(--primary)}
    .login-btn{width:100%;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}
    .login-btn:hover{background:var(--primary-dark)}
  `;
  
  return adminLayout({
    title: '控制台',
    content: content + loginModalComponent(),
    activeNav: 'dashboard',
    customStyles: styles,
    customScripts: '<script src="/assets/js/dashboard.js"></script>'
  });
}
