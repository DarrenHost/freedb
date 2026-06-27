import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /demo/app-versions 应用版本管理 Demo 页面
 */
app.get('/app-versions', async (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>应用版本管理 - FreeDB</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 1.8em; }
    .header a {
      color: #fff;
      text-decoration: none;
      opacity: 0.8;
    }
    .header a:hover { opacity: 1; }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px;
    }
    .toolbar {
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 15px;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #667eea;
      color: #fff;
    }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }
    .btn-secondary:hover { background: #e0e0e0; }
    .btn-danger {
      background: #ff4d4f;
      color: #fff;
    }
    .table-container {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 15px 20px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }
    tr:hover { background: #f8f9fa; }
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-active {
      background: #e6f7ed;
      color: #2ecc71;
    }
    .status-inactive {
      background: #ffeaea;
      color: #ff4d4f;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: #fff;
      border-radius: 12px;
      padding: 30px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal h2 {
      margin-bottom: 20px;
      color: #333;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 30px;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .empty {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 应用版本管理</h1>
    <a href="/">← 返回首页</a>
  </div>
  
  <div class="container">
    <div class="toolbar">
      <button class="btn btn-primary" onclick="openCreateModal()">+ 新建版本</button>
      <button class="btn btn-secondary" onclick="loadData()">🔄 刷新</button>
      <input type="text" id="search" placeholder="搜索应用名称或编码..." 
             style="flex:1; padding:10px 15px; border:1px solid #ddd; border-radius:8px;"
             oninput="filterData()">
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>应用名称</th>
            <th>编码</th>
            <th>包名</th>
            <th>版本号</th>
            <th>状态</th>
            <th>创建人</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="table-body">
          <tr><td colspan="9" class="loading">加载中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- 新建/编辑模态框 -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <h2 id="modal-title">新建应用版本</h2>
      <form id="app-form" onsubmit="handleSubmit(event)">
        <input type="hidden" id="edit-id">
        <div class="form-row">
          <div class="form-group">
            <label>应用名称 *</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label>应用编码 *</label>
            <input type="text" id="code" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>父级编码</label>
            <input type="text" id="parent_code" placeholder="可选">
          </div>
          <div class="form-group">
            <label>包名 *</label>
            <input type="text" id="package" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>版本号 *</label>
            <input type="text" id="version" required placeholder="如：1.0.0">
          </div>
          <div class="form-group">
            <label>状态</label>
            <select id="status">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>URL</label>
          <input type="url" id="url" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>创建人</label>
          <input type="text" id="create_user" value="system">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>
  
  <script>
    let allData = [];
    
    // 加载数据
    async function loadData() {
      try {
        const res = await fetch('/api/app-versions');
        const data = await res.json();
        if (data.success) {
          allData = data.data;
          renderTable(allData);
        }
      } catch (error) {
        console.error('加载失败:', error);
      }
    }
    
    // 渲染表格
    function renderTable(data) {
      const tbody = document.getElementById('table-body');
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty">暂无数据</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(item => \`
        <tr>
          <td>\${item.id}</td>
          <td>\${item.name}</td>
          <td>\${item.code}</td>
          <td>\${item.package}</td>
          <td>\${item.version}</td>
          <td>
            <span class="status-badge \${item.status === 'active' ? 'status-active' : 'status-inactive'}">
              \${item.status}
            </span>
          </td>
          <td>\${item.create_user || '-'}</td>
          <td>\${formatDate(item.create_time)}</td>
          <td>
            <button class="btn btn-secondary" onclick="editItem(\${item.id})" style="padding:6px 12px;font-size:12px;">编辑</button>
            <button class="btn btn-danger" onclick="deleteItem(\${item.id})" style="padding:6px 12px;font-size:12px;margin-left:8px;">删除</button>
          </td>
        </tr>
      \`).join('');
    }
    
    // 格式化日期
    function formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    }
    
    // 筛选数据
    function filterData() {
      const keyword = document.getElementById('search').value.toLowerCase();
      const filtered = allData.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.package.toLowerCase().includes(keyword)
      );
      renderTable(filtered);
    }
    
    // 打开新建模态框
    function openCreateModal() {
      document.getElementById('modal-title').textContent = '新建应用版本';
      document.getElementById('app-form').reset();
      document.getElementById('edit-id').value = '';
      document.getElementById('create_user').value = 'system';
      document.getElementById('modal-overlay').classList.add('active');
    }
    
    // 编辑
    async function editItem(id) {
      const item = allData.find(i => i.id === id);
      if (!item) return;
      
      document.getElementById('modal-title').textContent = '编辑应用版本';
      document.getElementById('edit-id').value = item.id;
      document.getElementById('name').value = item.name;
      document.getElementById('code').value = item.code;
      document.getElementById('parent_code').value = item.parent_code || '';
      document.getElementById('package').value = item.package;
      document.getElementById('version').value = item.version;
      document.getElementById('url').value = item.url || '';
      document.getElementById('status').value = item.status;
      document.getElementById('create_user').value = item.create_user || '';
      
      document.getElementById('modal-overlay').classList.add('active');
    }
    
    // 关闭模态框
    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('active');
    }
    
    // 提交表单
    async function handleSubmit(event) {
      event.preventDefault();
      
      const id = document.getElementById('edit-id').value;
      const data = {
        name: document.getElementById('name').value,
        code: document.getElementById('code').value,
        parent_code: document.getElementById('parent_code').value || null,
        package: document.getElementById('package').value,
        version: document.getElementById('version').value,
        url: document.getElementById('url').value || null,
        status: document.getElementById('status').value,
        create_user: document.getElementById('create_user').value
      };
      
      try {
        const url = id ? \`/api/app-versions/\${id}\` : '/api/app-versions';
        const method = id ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await res.json();
        if (result.success) {
          alert(id ? '更新成功' : '创建成功');
          closeModal();
          loadData();
        } else {
          alert('操作失败：' + result.error);
        }
      } catch (error) {
        alert('请求失败：' + error.message);
      }
    }
    
    // 删除
    async function deleteItem(id) {
      if (!confirm('确定要删除这个应用版本吗？')) return;
      
      try {
        const res = await fetch(\`/api/app-versions/\${id}\`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          alert('删除成功');
          loadData();
        } else {
          alert('删除失败：' + result.error);
        }
      } catch (error) {
        alert('请求失败：' + error.message);
      }
    }
    
    // 初始化
    loadData();
  </script>
</body>
</html>
  `);
});

export default app;
