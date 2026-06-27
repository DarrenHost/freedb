/**
 * 控制台页面 JS
 */
async function loadStats() {
  try {
    const [usersRes, tokensRes, visitsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/tokens'),
      fetch('/api/admin/visits')
    ]);
    const users = await usersRes.json();
    const tokens = await tokensRes.json();
    const visits = await visitsRes.json();
    
    if (users.success) {
      const total = users.data.length;
      const active = users.data.filter(u => u.status === 'active').length;
      document.getElementById('stat-users').textContent = total;
      document.getElementById('stat-active').textContent = active;
    }
    if (tokens.success) {
      const total = tokens.data.length;
      const active = tokens.data.filter(t => t.status === 1).length;
      document.getElementById('stat-tokens').textContent = total;
      document.getElementById('stat-tokens-active').textContent = active;
    }
    if (visits.success) {
      const today = visits.data.filter(v => new Date(v.visit_time).toDateString() === new Date().toDateString()).length;
      const avg = visits.data.length > 0 ? Math.round(visits.data.reduce((s, v) => s + (v.response_time_ms || 0), 0) / visits.data.length) : 0;
      document.getElementById('stat-visits').textContent = today;
      document.getElementById('stat-avg').textContent = avg + 'ms';
    }
  } catch (e) {
    console.error('加载统计失败', e);
  }
}

// 页面加载时执行
loadStats();
