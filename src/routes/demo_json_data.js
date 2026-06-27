import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /demo/json-data JSON 数据管理 Demo 页面
 */
app.get('/json-data', async (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON 数据管理 - FreeDB</title>
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
    .btn-primary { background: #667eea; color: #fff; }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .btn-secondary:hover { background: #e0e0e0; }
    .btn-danger { background: #ff4d4f; color: #fff; }
    .btn-danger:hover { background: #ff3739; }
    .table-container {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    table { width: 100%; border-collapse: collapse; }
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
    .status-0 { background: #ffeaea; color: #ff4d4f; }
    .status-1 { background: #e6f7ed; color: #2ecc71; }
    .status-2 { background: #fff3e0; color: #ff9800; }
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
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
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal h2 { margin-bottom: 20px; color: #333; }
    .form-group { margin-bottom: 20px; }
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
      font-family: monospace;
    }
    .form-group textarea {
      min-height: 200px;
      resize: vertical;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
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
    .loading, .empty {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    .json-preview {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      max-height: 150px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .view-json-btn {
      padding: 4px 12px;
      font-size: 12px;
      background: #667eea;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .view-json-btn:hover { background: #5568d3; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 JSON 数据管理</h1>
    <a href="/">← 返回首页</a>
  </div>
  
  <div class="container">
    <div class="toolbar">
      <button class="btn btn-primary" onclick="openCreateModal()">+ 新建数据</button>
      <button class="btn btn-secondary" onclick="loadData()">🔄 刷新</button>
      <select id="filter-status" onchange="filterData()" style="padding:10px;border:1px solid #ddd;border-radius:8px;">
        <option value="">全部状态</option>
        <option value="0">禁用 (0)</option>
        <option value="1">启用 (1)</option>
        <option value="2">归档 (2)</option>
      </select>
      <input type="text" id="search" placeholder="搜索名称..." 
             style="flex:1;padding:10px 15px;border:1px solid #ddd;border-radius:8px;"
             oninput="filterData()">
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>父级名称</th>
            <th>状态</th>
            <th>创建人</th>
            <th>创建时间</th>
            <th>Content 预览</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="table-body">
          <tr><td colspan="8" class="loading">加载中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- 新建/编辑模态框 -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <h2 id="modal-title">新建 JSON 数据</h2>
      <form id="json-form" onsubmit="handleSubmit(event)">
        <input type="hidden" id="edit-id">
        <div class="form-row">
          <div class="form-group">
            <label>名称 *</label>
            <input type="text" id="name" required placeholder="如：首页配置">
          </div>
          <div class="form-group">
            <label>父级名称</label>
            <input type="text" id="parent_name" placeholder="可选，用于层级关系">
          </div>
        </div>
        <div class="form-group">
          <label>JSON 内容</label>
          <textarea id="content" placeholder='{"key": "value"}'></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>状态</label>
            <select id="status">
              <option value="1">启用 (1)</option>
              <option value="0">禁用 (0)</option>
              <option value="2">归档 (2)</option>
            </select>
          </div>
          <div class="form-group">
            <label>创建人</label>
            <input type="text" id="create_user" value="system">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- JSON 查看模态框 -->
  <div class="modal-overlay" id="json-view-overlay">
    <div class="modal">
      <h2>JSON 内容</h2>
      <div class="json-preview" id="json-content"></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="document.getElementById('json-view-overlay').classList.remove('active')">关闭</button>
      </div>
    </div>
  </div>
  
  <script>
    let allData = [];
    
    async function loadData() {
      try {
        const res = await fetch('/api/json-data');
        const data = await res.json();
        if (data.success) {
          allData = data.data;
          renderTable(allData);
        } else {
          document.getElementById('table-body').innerHTML = 
            '<tr><td colspan="8" class="empty">加载失败：' + data.error + '</td></tr>';
        }
      } catch (error) {
        document.getElementById('table-body').innerHTML = 
          '<tr><td colspan="8" class="empty">加载失败：' + error.message + '</td></tr>';
      }
    }
    
    function renderTable(data) {
      const tbody = document.getElementById('table-body');
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty">暂无数据</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(item => {
        let preview = '无内容';
        if (item.content) {
          try {
            const json = JSON.parse(item.content);
            preview = JSON.stringify(json).substring(0, 50) + '...';
          } catch (e) {
            preview = item.content.substring(0, 50) + '...';
          }
        }
        return \`
        <tr>
          <td>\${item.id}</td>
          <td>\${item.name}</td>
          <td>\${item.parent_name || '-'}</td>
          <td>
            <span class="status-badge status-\${item.status}">
              \${item.status === 0 ? '禁用' : item.status === 1 ? '启用' : '归档'}
            </span>
          </td>
          <td>\${item.create_user || '-'}</td>
          <td>\${formatDate(item.create_time)}</td>
          <td>
            <button class="view-json-btn" onclick="viewJson('\${(item.content || '').replace(/'/g, "\\'")}')">
              👁 查看
            </button>
            <span style="margin-left:8px;color:#999;font-size:12px;">\${preview}</span>
          </td>
          <td>
            <button class="btn btn-secondary" onclick="editItem(\${item.id})" style="padding:6px 12px;font-size:12px;">编辑</button>
            <button class="btn btn-danger" onclick="deleteItem(\${item.id})" style="padding:6px 12px;font-size:12px;margin-left:8px;">删除</button>
          </td>
        </tr>
        \`;
      }).join('');
    }
    
    function formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    }
    
    function filterData() {
      const keyword = document.getElementById('search').value.toLowerCase();
      const status = document.getElementById('filter-status').value;
      
      let filtered = allData;
      
      if (keyword) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          (item.parent_name && item.parent_name.toLowerCase().includes(keyword))
        );
      }
      
      if (status !== '') {
        filtered = filtered.filter(item => item.status == status);
      }
      
      renderTable(filtered);
    }
    
    function openCreateModal() {
      document.getElementById('modal-title').textContent = '新建 JSON 数据';
      document.getElementById('json-form').reset();
      document.getElementById('edit-id').value = '';
      document.getElementById('create_user').value = 'system';
      document.getElementById('modal-overlay').classList.add('active');
    }
    
    async function editItem(id) {
      const item = allData.find(i => i.id === id);
      if (!item) return;
      
      document.getElementById('modal-title').textContent = '编辑 JSON 数据';
      document.getElementById('edit-id').value = item.id;
      document.getElementById('name').value = item.name;
      document.getElementById('parent_name').value = item.parent_name || '';
      document.getElementById('content').value = item.content || '';
      document.getElementById('status').value = item.status;
      document.getElementById('create_user').value = item.create_user || '';
      
      document.getElementById('modal-overlay').classList.add('active');
    }
    
    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('active');
    }
    
    function viewJson(content) {
      try {
        const json = JSON.parse(content);
        document.getElementById('json-content').textContent = JSON.stringify(json, null, 2);
      } catch (e) {
        document.getElementById('json-content').textContent = content || '无内容';
      }
      document.getElementById('json-view-overlay').classList.add('active');
    }
    
    async function handleSubmit(event) {
      event.preventDefault();
      
      const id = document.getElementById('edit-id').value;
      
      // 验证 JSON 格式
      const content = document.getElementById('content').value;
      if (content) {
        try {
          JSON.parse(content);
        } catch (e) {
          alert('JSON 格式无效：' + e.message);
          return;
        }
      }
      
      const data = {
        name: document.getElementById('name').value,
        parent_name: document.getElementById('parent_name').value || null,
        content: content || null,
        status: parseInt(document.getElementById('status').value),
        create_user: document.getElementById('create_user').value
      };
      
      try {
        const url = id ? \`/api/json-data/\${id}\` : '/api/json-data';
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
    
    async function deleteItem(id) {
      if (!confirm('确定要删除这条数据吗？')) return;
      
      try {
        const res = await fetch(\`/api/json-data/\${id}\`, { method: 'DELETE' });
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
