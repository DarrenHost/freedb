import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /admin/visits 访问统计页面
 */
app.get('/visits', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>访问统计 - FreeDB</title>
  <style>
    :root{--primary:#667eea;--bg:#f5f7fa;--border:#e0e0e0}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);display:flex;min-height:100vh}
    .sidebar{width:250px;background:#1a1a2e;color:#fff;position:fixed;height:100vh}
    .sidebar-header{padding:20px;border-bottom:1px solid rgba(255,255,255,0.1)}
    .sidebar-header h2{font-size:1.5em}
    .sidebar-header h2 span{color:var(--primary)}
    .sidebar-nav a{display:flex;align-items:center;gap:10px;padding:12px 20px;color:rgba(255,255,255,0.8);text-decoration:none}
    .sidebar-nav a:hover,.sidebar-nav a.active{background:rgba(255,255,255,0.1);color:#fff}
    .main-content{flex:1;margin-left:250px;padding:30px}
    .header{background:#fff;padding:20px 30px;border-radius:12px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .header h1{font-size:1.8em;color:var(--primary)}
    .toolbar{background:#fff;padding:20px;border-radius:12px;margin-bottom:20px;display:flex;gap:15px;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .btn{padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600}
    .btn-primary{background:var(--primary);color:#fff}
    .btn-secondary{background:#f0f0f0;color:#333}
    select,input{padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px}
    .table-container{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:12px 15px;text-align:left;border-bottom:1px solid var(--border)}
    th{background:#f8f9fa;font-weight:600}
    tr:hover{background:#f8f9fa}
    .method{display:inline-block;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px}
    .method-get{background:#e6f7ed;color:#2ecc71}
    .method-post{background:#e6f7ff;color:#667eea}
    .method-put{background:#fff3e0;color:#ff9800}
    .method-delete{background:#ffeaea;color:#ff4d4f}
    .status{display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px}
    .status-2xx{background:#e6f7ed;color:#2ecc71}
    .status-3xx{background:#e6f7ff;color:#667eea}
    .status-4xx{background:#fff3e0;color:#ff9800}
    .status-5xx{background:#ffeaea;color:#ff4d4f}
    .loading,.empty{text-align:center;padding:60px 20px;color:#8c8c8c}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:20px}
    .stat-card{background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .stat-card h4{color:#8c8c8c;font-size:13px;margin-bottom:10px}
    .stat-card .value{font-size:24px;font-weight:700;color:var(--primary)}
    .truncate{max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header"><h2>Free<span>DB</span></h2></div>
    <nav class="sidebar-nav">
      <a href="/admin/dashboard"><span>🏠</span> 控制台</a>
      <a href="/admin/users"><span>👤</span> 用户管理</a>
      <a href="/admin/tokens"><span>🔑</span> Token 管理</a>
      <a href="/admin/visits" class="active"><span>📊</span> 访问统计</a>
      <a href="/"><span>📚</span> API 文档</a>
    </nav>
  </aside>
  <main class="main-content">
    <div class="header"><h1>📊 访问统计</h1><a href="/admin/dashboard" style="color:var(--primary);text-decoration:none">← 返回控制台</a></div>
    <div class="stats-grid" id="stats">
      <div class="stat-card"><h4>总访问量</h4><div class="value" id="stat-total">-</div></div>
      <div class="stat-card"><h4>今日访问</h4><div class="value" id="stat-today">-</div></div>
      <div class="stat-card"><h4>平均响应</h4><div class="value" id="stat-avg">-</div></div>
      <div class="stat-card"><h4>错误率</h4><div class="value" id="stat-error">-</div></div>
    </div>
    <div class="toolbar">
      <button class="btn btn-primary" onclick="loadData()">🔄 刷新</button>
      <select id="filter-method" onchange="filterData()"><option value="">全部方法</option><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option></select>
      <select id="filter-status" onchange="filterData()"><option value="">全部状态</option><option value="2xx">2xx 成功</option><option value="3xx">3xx 重定向</option><option value="4xx">4xx 错误</option><option value="5xx">5xx 错误</option></select>
      <input type="text" id="search" placeholder="搜索路径/IP..." style="flex:1" oninput="filterData()">
      <input type="datetime-local" id="filter-time" onchange="filterData()">
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>时间</th><th>方法</th><th>路径</th><th>状态</th><th>响应时间</th><th>IP</th><th>User Agent</th></tr></thead>
        <tbody id="table-body"><tr><td colspan="7" class="loading">加载中...</td></tr></tbody>
      </table>
    </div>
  </main>
  <script>
let allData=[],filteredData=[],page=1,pageSize=50;
async function loadData(){try{const r=await fetch('/api/admin/visits');const d=await r.json();if(d.success){allData=d.data;filteredData=[...allData];renderTable();calcStats();}else{document.getElementById('table-body').innerHTML='<tr><td colspan="7" class="empty">加载失败</td></tr>';} }catch(e){document.getElementById('table-body').innerHTML='<tr><td colspan="7" class="empty">加载失败</td></tr>';} }
function calcStats(){const t=allData.length,h=allData.filter(d=>new Date(d.visit_time).toDateString()===new Date().toDateString()).length,a=t>0?Math.round(allData.reduce((s,d)=>s+(d.response_time_ms||0),0)/t):0,e=t>0?((allData.filter(d=>d.status_code>=400).length/t)*100).toFixed(1):0;const e1=document.getElementById('stat-total'),e2=document.getElementById('stat-today'),e3=document.getElementById('stat-avg'),e4=document.getElementById('stat-error');if(e1)e1.textContent=t;if(e2)e2.textContent=h;if(e3)e3.textContent=a+'ms';if(e4)e4.textContent=e+'%';}
function filterData(){const m=document.getElementById('filter-method').value,s=document.getElementById('filter-status').value,h=document.getElementById('search').value.toLowerCase(),t=document.getElementById('filter-time').value;filteredData=allData.filter(d=>{if(m&&d.method!==m)return false;if(s){const x=d.status_code,c=s.replace('x','');if(x<c*100||x>=(c+1)*100)return false;}if(h&&!d.request_path.toLowerCase().includes(h)&&!d.remote_ip?.includes(h))return false;if(t&&new Date(d.visit_time)<new Date(t))return false;return true;});page=1;renderTable();}
function renderTable(){const t=document.getElementById('table-body'),h=(page-1)*pageSize,a=h+pageSize,x=filteredData.slice(h,a);if(x.length===0){t.innerHTML='<tr><td colspan="7" class="empty">暂无数据</td></tr>';return;}t.innerHTML=x.map(d=>\`<tr><td>\${new Date(d.visit_time).toLocaleString()}</td><td><span class="method method-\${d.method.toLowerCase()}">\${d.method}</span></td><td class="truncate">\${d.request_path}\${d.query_string?'?'+d.query_string.substring(0,50):''}</td><td><span class="status status-\${Math.floor(d.status_code/100)}xx">\${d.status_code}</span></td><td>\${d.response_time_ms||0}ms</td><td>\${d.remote_ip||'-'}</td><td class="truncate">\${d.user_agent||'-'}</td></tr>\`).join('');renderPagination();}
function renderPagination(){const t=Math.ceil(filteredData.length/pageSize),p=document.getElementById('pagination');if(!p||t<=1){if(p)p.innerHTML='';return;}p.innerHTML=Array.from({length:t},(_,i)=>\`<button class="page-btn \${i+1===page?'active':''}" onclick="page=\${i+1};renderTable()">\${i+1}</button>\`).join('');}
loadData();
  </script>
</body>
</html>`);
});

/**
 * @api {get} /api/admin/visits 获取访问记录
 */
app.get('/api/admin/visits', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM visit_log ORDER BY visit_time DESC LIMIT 1000').all();
    return c.json({ success: true, data: result.results || [] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
