import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /admin/users 用户管理页面
 */
app.get('/users', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>用户管理 - FreeDB</title>
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
    input,select{padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px}
    .table-container{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:12px 15px;text-align:left;border-bottom:1px solid var(--border)}
    th{background:#f8f9fa;font-weight:600}
    tr:hover{background:#f8f9fa}
    .status{display:inline-block;padding:4px 10px;border-radius:6px;font-size:12px}
    .status-active{background:#e6f7ed;color:#2ecc71}
    .status-inactive{background:#ffeaea;color:#ff4d4f}
    .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:1000}
    .modal-overlay.active{display:flex}
    .modal{background:#fff;border-radius:12px;padding:30px;width:100%;max-width:500px}
    .modal h2{margin-bottom:20px}
    .form-group{margin-bottom:20px}
    .form-group label{display:block;margin-bottom:8px;color:#333;font-weight:500}
    .form-group input,.form-group select{width:100%;padding:10px;border:1px solid var(--border);border-radius:8px}
    .modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:30px}
    .loading,.empty{text-align:center;padding:60px 20px;color:#8c8c8c}
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header"><h2>Free<span>DB</span></h2></div>
    <nav class="sidebar-nav">
      <a href="/admin/dashboard"><span>🏠</span> 控制台</a>
      <a href="/admin/users" class="active"><span>👤</span> 用户管理</a>
      <a href="/admin/tokens"><span>🔑</span> Token 管理</a>
      <a href="/admin/visits"><span>📊</span> 访问统计</a>
      <a href="/"><span>📚</span> API 文档</a>
    </nav>
  </aside>
  <main class="main-content">
    <div class="header"><h1>👤 用户管理</h1><a href="/admin/dashboard" style="color:var(--primary);text-decoration:none">← 返回控制台</a></div>
    <div class="toolbar">
      <button class="btn btn-primary" onclick="openModal()">+ 新建用户</button>
      <button class="btn btn-secondary" onclick="loadData()">🔄 刷新</button>
      <select id="filter-status" onchange="filterData()"><option value="">全部状态</option><option value="active">活跃</option><option value="inactive">非活跃</option></select>
      <input type="text" id="search" placeholder="搜索用户名/邮箱..." style="flex:1" oninput="filterData()">
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>ID</th><th>用户名</th><th>邮箱</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody id="table-body"><tr><td colspan="6" class="loading">加载中...</td></tr></tbody>
      </table>
    </div>
  </main>
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <h2 id="modal-title">新建用户</h2>
      <form id="user-form" onsubmit="handleSubmit(event)">
        <input type="hidden" id="edit-id">
        <div class="form-group"><label>用户名 *</label><input type="text" id="name" required></div>
        <div class="form-group"><label>邮箱 *</label><input type="email" id="email" required></div>
        <div class="form-group"><label>密码</label><input type="password" id="pwd" placeholder="留空则不修改"></div>
        <div class="form-group"><label>状态</label><select id="status"><option value="active">活跃</option><option value="inactive">非活跃</option></select></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>
  <script src="/assets/js/md5.js"></script>
<script>
    let allData=[],filteredData=[];
    async function loadData(){
      try{
        const res=await fetch('/api/admin/users');
        const data=await res.json();
        if(data.success){allData=data.data;filteredData=[...allData];renderTable();}
        else{document.getElementById('table-body').innerHTML='<tr><td colspan="6" class="empty">加载失败</td></tr>';}
      }catch(e){document.getElementById('table-body').innerHTML='<tr><td colspan="6" class="empty">加载失败</td></tr>';}
    }
    function filterData(){
      const status=document.getElementById('filter-status').value;
      const search=document.getElementById('search').value.toLowerCase();
      filteredData=allData.filter(d=>{
        if(status&&d.status!==status)return false;
        if(search&&!d.name.toLowerCase().includes(search)&&!d.email.toLowerCase().includes(search))return false;
        return true;
      });
      renderTable();
    }
    function renderTable(){
      const tbody=document.getElementById('table-body');
      if(filteredData.length===0){tbody.innerHTML='<tr><td colspan="6" class="empty">暂无数据</td></tr>';return;}
      tbody.innerHTML=filteredData.map(d=>\`<tr>
        <td>\${d.id}</td><td>\${d.name}</td><td>\${d.email}</td>
        <td><span class="status status-\${d.status}">\${d.status==='active'?'活跃':'非活跃'}</span></td>
        <td>\${new Date(d.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-secondary" onclick="editUser(\${d.id})" style="padding:6px 12px;font-size:12px;">编辑</button>
          <button class="btn btn-secondary" onclick="resetPwd(\${d.id})" style="padding:6px 12px;font-size:12px;margin-left:8px;">重置密码</button>
        </td>
      </tr>\`).join('');
    }
    function openModal(){
      document.getElementById('modal-title').textContent='新建用户';
      document.getElementById('user-form').reset();
      document.getElementById('edit-id').value='';
      document.getElementById('modal-overlay').classList.add('active');
    }
    function closeModal(){document.getElementById('modal-overlay').classList.remove('active');}
    async function editUser(id){
      const user=allData.find(u=>u.id===id);if(!user)return;
      document.getElementById('modal-title').textContent='编辑用户';
      document.getElementById('edit-id').value=user.id;
      document.getElementById('name').value=user.name;
      document.getElementById('email').value=user.email;
      document.getElementById('pwd').value='';
      document.getElementById('status').value=user.status;
      document.getElementById('modal-overlay').classList.add('active');
    }
    async function handleSubmit(e){
      e.preventDefault();
      const id=document.getElementById('edit-id').value;
      const data={name:document.getElementById('name').value,email:document.getElementById('email').value,status:document.getElementById('status').value};
      const pwd=document.getElementById('pwd').value;
      if(pwd)data.pwd=md5(pwd);
      try{
        const url=id?'/api/admin/users/'+id:'/api/admin/users';
        const method=id?'PUT':'POST';
        const res=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        const result=await res.json();
        if(result.success){alert(id?'更新成功':'创建成功');closeModal();loadData();}else{alert('操作失败：'+result.error);}
      }catch(e){alert('请求失败：'+e.message);}
    }
    async function resetPwd(id){
      const newPwd=prompt('请输入新密码:');if(!newPwd)return;
      try{
        const res=await fetch('/api/admin/users/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({pwd:md5(newPwd)})});
        const result=await res.json();
        if(result.success){alert('密码重置成功');}else{alert('操作失败：'+result.error);}
      }catch(e){alert('请求失败：'+e.message);}
    }
    loadData();
  </script>
</body>
</html>`);
});

/**
 * @api {get} /api/admin/users 获取用户列表
 */
app.get('/api/admin/users', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare('SELECT id, name, email, status, created_at FROM users ORDER BY created_at DESC').all();
    return c.json({ success: true, data: result.results || [] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * @api {post} /api/admin/users 创建用户
 */
app.post('/api/admin/users', async (c) => {
  try {
    const { name, email, pwd, status } = await c.req.json();
    const db = c.env.DB;
    const now = new Date().toISOString();
    await db.prepare('INSERT INTO users (name, email, pwd, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(name, email, pwd || null, status || 'active', now, now).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * @api {put} /api/admin/users/:id 更新用户
 */
app.put('/api/admin/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { name, email, pwd, status } = await c.req.json();
    const db = c.env.DB;
    const now = new Date().toISOString();
    const fields = [], params = [];
    if (name) { fields.push('name = ?'); params.push(name); }
    if (email) { fields.push('email = ?'); params.push(email); }
    if (pwd) { fields.push('pwd = ?'); params.push(pwd); }
    if (status) { fields.push('status = ?'); params.push(status); }
    fields.push('updated_at = ?'); params.push(now);
    params.push(id);
    await db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
