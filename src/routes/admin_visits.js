import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /admin/visits 访问记录查询页面
 */
app.get('/visits', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>访问记录 - FreeDB</title>
  <style>
    :root{--primary:#667eea;--bg:#f5f7fa;--border:#e0e0e0;--text:#262626}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text)}
    .navbar{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:20px 40px;display:flex;justify-content:space-between;align-items:center}
    .navbar h1{font-size:1.8em}
    .navbar h1 span{color:var(--primary)}
    .navbar a{color:#fff;text-decoration:none;opacity:0.8}
    .navbar a:hover{opacity:1}
    .container{max-width:1600px;margin:0 auto;padding:30px}
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
    .method-post{background:#e6f7ff;color:#var(--primary)}
    .method-put{background:#fff3e0;color:#ff9800}
    .method-delete{background:#ffeaea;color:#ff4d4f}
    .status{display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px}
    .status-2xx{background:#e6f7ed;color:#2ecc71}
    .status-3xx{background:#e6f7ff;color:#667eea}
    .status-4xx{background:#fff3e0;color:#ff9800}
    .status-5xx{background:#ffeaea;color:#ff4d4f}
    .loading,.empty{text-align:center;padding:60px 20px;color:#8c8c8c}
    .pagination{display:flex;justify-content:center;gap:10px;margin-top:20px}
    .page-btn{padding:8px 16px;border:1px solid var(--border);background:#fff;border-radius:6px;cursor:pointer}
    .page-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:20px}
    .stat-card{background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .stat-card h4{color:#8c8c8c;font-size:13px;margin-bottom:10px}
    .stat-card .value{font-size:24px;font-weight:700;color:var(--primary)}
    .truncate{max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style>
</head>
<body>
  <nav class="navbar">
    <h1>📊 Free<span>DB</span> 访问统计</h1>
    <a href="/">← 返回 API 文档</a>
  </nav>
  <div class="container">
    <div class="stats" id="stats">
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
    <div class="pagination" id="pagination"></div>
  </div>
  <script>
    let allData=[],filteredData=[],page=1,pageSize=50;
    async function loadData(){
      try{
        const res=await fetch('/api/admin/visits');
        const data=await res.json();
        if(data.success){allData=data.data;filteredData=[...allData];renderTable();calcStats();}
        else{document.getElementById('table-body').innerHTML='<tr><td colspan="7" class="empty">加载失败：'+data.error+'</td></tr>';}
      }catch(e){document.getElementById('table-body').innerHTML='<tr><td colspan="7" class="empty">加载失败：'+e.message+'</td></tr>';}
    }
    function calcStats(){
      const total=allData.length;
      const today=allData.filter(d=>new Date(d.visit_time).toDateString()===new Date().toDateString()).length;
      const avg=total>0?Math.round(allData.reduce((s,d)=>s+(d.response_time_ms||0),0)/total):0;
      const error=total>0?((allData.filter(d=>d.status_code>=400).length/total)*100).toFixed(1):0;
      document.getElementById('stat-total').textContent=total;
      document.getElementById('stat-today').textContent=today;
      document.getElementById('stat-avg').textContent=avg+'ms';
      document.getElementById('stat-error').textContent=error+'%';
    }
    function filterData(){
      const method=document.getElementById('filter-method').value;
      const status=document.getElementById('filter-status').value;
      const search=document.getElementById('search').value.toLowerCase();
      const time=document.getElementById('filter-time').value;
      filteredData=allData.filter(d=>{
        if(method&&d.method!==method)return false;
        if(status){const s=d.status_code;const cat=status.replace('x','');if(s<cat*100||s>=(cat+1)*100)return false;}
        if(search&&!d.request_path.toLowerCase().includes(search)&&!d.remote_ip?.includes(search))return false;
        if(time&&new Date(d.visit_time)<new Date(time))return false;
        return true;
      });
      page=1;renderTable();
    }
    function renderTable(){
      const tbody=document.getElementById('table-body');
      const start=(page-1)*pageSize,end=start+pageSize;
      const data=filteredData.slice(start,end);
      if(data.length===0){tbody.innerHTML='<tr><td colspan="7" class="empty">暂无数据</td></tr>';return;}
      tbody.innerHTML=data.map(d=>\`<tr>
        <td>\${new Date(d.visit_time).toLocaleString()}</td>
        <td><span class="method method-\${d.method.toLowerCase()}">\${d.method}</span></td>
        <td class="truncate">\${d.request_path}\${d.query_string?'?'+d.query_string.substring(0,50):''}</td>
        <td><span class="status status-\${Math.floor(d.status_code/100)}xx">\${d.status_code}</span></td>
        <td>\${d.response_time_ms||0}ms</td>
        <td>\${d.remote_ip||'-'}</td>
        <td class="truncate">\${d.user_agent||'-'}</td>
      </tr>\`).join('');
      renderPagination();
    }
    function renderPagination(){
      const total=Math.ceil(filteredData.length/pageSize);
      const div=document.getElementById('pagination');
      if(total<=1){div.innerHTML='';return;}
      div.innerHTML=Array.from({length:total},(_,i)=>\`<button class="page-btn \${i+1===page?'active':''}" onclick="page=\${i+1};renderTable()">\${i+1}</button>\`).join('');
    }
    loadData();
  </script>
</body>
</html>`);
});

/**
 * @api {get} /api/admin/visits 获取访问记录（内部 API）
 */
app.get('/api/admin/visits', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare(`
      SELECT * FROM visit_log 
      ORDER BY visit_time DESC 
      LIMIT 1000
    `).all();
    
    return c.json({
      success: true,
      data: result.results || []
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;
