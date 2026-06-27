import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /tokens Token 管理页面
 */
app.get('/tokens', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Token 管理 - FreeDB</title>
  <style>
    :root{--primary:#667eea;--bg:#f5f7fa;--border:#e0e0e0;--text:#262626}
    *{margin:0;padding:0;box-sizing:border-box}
    body{display:flex;min-height:100vh}
    .sidebar{width:250px;background:#1a1a2e;color:#fff;position:fixed;height:100vh}
    .sidebar-header{padding:20px;border-bottom:1px solid rgba(255,255,255,0.1)}
    .sidebar-header h2{font-size:1.5em}
    .sidebar-header h2 span{color:var(--primary)}
    .sidebar-nav a{display:flex;align-items:center;gap:10px;padding:12px 20px;color:rgba(255,255,255,0.8);text-decoration:none}
    .sidebar-nav a:hover,.sidebar-nav a.active{background:rgba(255,255,255,0.1);color:#fff}
    .main-content{flex:1;margin-left:250px;padding:30px}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text)}
    .navbar{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:20px 40px;display:flex;justify-content:space-between;align-items:center}
    .navbar h1{font-size:1.8em}
    .navbar h1 span{color:var(--primary)}
    .navbar a{color:#fff;text-decoration:none;opacity:0.8}
    .navbar a:hover{opacity:1}
    .container{max-width:1400px;margin:0 auto;padding:30px}
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
    .status{display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px}
    .status-0{background:#ffeaea;color:#ff4d4f}
    .status-1{background:#e6f7ed;color:#2ecc71}
    .loading,.empty{text-align:center;padding:60px 20px;color:#8c8c8c}
    .token-code{font-family:monospace;background:#f0f0f0;padding:4px 8px;border-radius:4px;font-size:12px}
    .copy-btn{padding:4px 8px;font-size:11px;background:#667eea;color:#fff;border:none;border-radius:4px;cursor:pointer}
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header"><h2>Free<span>DB</span></h2></div>
    <nav class="sidebar-nav">
      <a href="/admin/dashboard"><span>🏠</span> 控制台</a>
      <a href="/admin/users"><span>👤</span> 用户管理</a>
      <a href="/admin/tokens" class="active"><span>🔑</span> Token 管理</a>
      <a href="/admin/visits"><span>📊</span> 访问统计</a>
      <a href="/"><span>📚</span> API 文档</a>
    </nav>
  </aside>
  <main class="main-content">
  <nav class="navbar">
    <h1>🔑 Free<span>DB</span> Token 管理</h1>
    <a href="/">← 返回 API 文档</a>
  </nav>
  <div class="container">
    <div class="toolbar">
      <button class="btn btn-primary" onclick="loadData()">🔄 刷新</button>
      <select id="filter-status" onchange="filterData()"><option value="">全部状态</option><option value="1">启用 (1)</option><option value="0">禁用 (0)</option></select>
      <input type="text" id="search" placeholder="搜索用户/Token..." style="flex:1" oninput="filterData()">
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>ID</th><th>用户</th><th>Token</th><th>状态</th><th>创建人</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody id="table-body"><tr><td colspan="7" class="loading">加载中...</td></tr></tbody>
      </table>
    </div>
  </div>
  <script>
    let allData=[],filteredData=[];
    async function loadData(){
      try{
        const res=await fetch('/admin/api/tokens');
        const data=await res.json();
        if(data.success){allData=data.data;filteredData=[...allData];renderTable();}
        else{document.getElementById('table-body').innerHTML='<tr><td colspan="7" class="empty">加载失败：'+data.error+'</td></tr>';}
      }catch(e){document.getElementById('table-body').innerHTML='<tr><td colspan="7" class="empty">加载失败：'+e.message+'</td></tr>';}
    }
    function filterData(){
      const status=document.getElementById('filter-status').value;
      const search=document.getElementById('search').value.toLowerCase();
      filteredData=allData.filter(d=>{
        if(status&&d.status!=status)return false;
        if(search&&!d.user.toLowerCase().includes(search)&&!d.token.toLowerCase().includes(search))return false;
        return true;
      });
      renderTable();
    }
    function renderTable(){
      const tbody=document.getElementById('table-body');
      if(filteredData.length===0){tbody.innerHTML='<tr><td colspan="7" class="empty">暂无数据</td></tr>';return;}
      tbody.innerHTML=filteredData.map(d=>\`<tr>
        <td>\${d.id}</td>
        <td>\${d.user}</td>
        <td><span class="token-code">\${d.token.substring(0,20)}...</span> <button class="copy-btn" onclick="copyToken('\${d.token}')">📋 复制</button></td>
        <td><span class="status status-\${d.status}">\${d.status===1?'启用':'禁用'}</span></td>
        <td>\${d.create_user||'-'}</td>
        <td>\${new Date(d.create_time).toLocaleString()}</td>
        <td><button class="btn btn-secondary" onclick="toggleStatus(\${d.id},\${d.status})" style="padding:6px 12px;font-size:12px;">\${d.status===1?'禁用':'启用'}</button></td>
      </tr>\`).join('');
    }
    function copyToken(token){navigator.clipboard.writeText(token);alert('Token 已复制到剪贴板');}
    async function toggleStatus(id,status){
      if(!confirm(\`确定要\${status===1?'禁用':'启用'}这个 Token 吗？\`))return;
      try{
        const res=await fetch('/admin/api/tokens/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:status===1?0:1})});
        const result=await res.json();
        if(result.success){alert('操作成功');loadData();}else{alert('操作失败：'+result.error);}
      }catch(e){alert('请求失败：'+e.message);}
    }
    loadData();
  </script>
</main></body>
</html>`);
});

/**
 * @api {get} /api/tokens 获取 Token 列表
 */
app.get('/api/tokens', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare(`
      SELECT * FROM tokens 
      ORDER BY create_time DESC
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

/**
 * @api {put} /api/tokens/:id 更新 Token 状态
 */
app.put('/api/tokens/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { status } = body;
    
    const db = c.env.DB;
    const now = new Date().toISOString();
    
    await db.prepare(`
      UPDATE tokens SET status = ?, update_time = ?, update_user = ?
      WHERE id = ?
    `).bind(status, now, 'admin', id).run();
    
    const updated = await db.prepare('SELECT * FROM tokens WHERE id = ?').bind(id).first();
    
    return c.json({
      success: true,
      data: updated
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;
