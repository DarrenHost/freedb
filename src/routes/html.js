import { Hono } from 'hono';

const app = new Hono();

app.get('/', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>FreeDB API</title>
  <style>
    :root{--primary:#667eea;--bg:#f8f9fa;--border:#e0e0e0}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);line-height:1.6}
    .navbar{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:20px 40px;display:flex;justify-content:space-between;align-items:center}
    .navbar h1{font-size:1.8em}
    .navbar h1 span{color:var(--primary)}
    .navbar-links a{color:#fff;text-decoration:none;margin-left:20px}
    .container{max-width:1400px;margin:0 auto;padding:40px}
    .intro{background:#fff;border-radius:12px;padding:30px;margin-bottom:30px;border:1px solid var(--border)}
    .intro h2{color:var(--primary);margin-bottom:15px}
    .api-group{background:#fff;border-radius:12px;margin-bottom:30px;border:1px solid var(--border);overflow:hidden}
    .api-group-header{background:linear-gradient(135deg,var(--primary),#5568d3);color:#fff;padding:20px 30px}
    .api-group-header h3{font-size:1.5em;margin-bottom:5px}
    .endpoint{padding:20px 30px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:100px 1fr 150px;gap:20px;align-items:center}
    .endpoint:last-child{border-bottom:none}
    .method{display:inline-block;padding:6px 12px;border-radius:6px;font-weight:700;font-size:13px}
    .get{background:#e6f7ed;color:#2ecc71}
    .post{background:#e6f7ff;color:#667eea}
    .put{background:#fff3e0;color:#ff9800}
    .delete{background:#ffeaea;color:#ff4d4f}
    .path{font-family:'Courier New',monospace;font-size:14px}
    .desc{color:#8c8c8c;font-size:14px}
    .btn{padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer;text-decoration:none;display:inline-block}
    .quickstart{background:#1a1a2e;color:#fff;border-radius:12px;padding:30px;margin-bottom:30px}
    .quickstart h3{color:var(--primary);margin-bottom:15px}
    .quickstart code{background:rgba(255,255,255,0.05);padding:20px;border-radius:8px;display:block;font-family:'Courier New',monospace}
    .footer{text-align:center;padding:40px;color:#8c8c8c;border-top:1px solid var(--border)}
  </style>
</head>
<body>
  <nav class="navbar">
    <h1>⚡ Free<span>DB</span></h1>
    <div class="navbar-links">
      <a href="/demo/app-versions">📦 Demo</a>
      <a href="/demo/json-data">📄 JSON Demo</a>
      <a href="/health">💚 Health</a>
      <a href="https://github.com/DarrenHost/freedb" target="_blank">GitHub</a>
    </div>
  </nav>
  <div class="container">
    <div class="intro">
      <h2>📚 API 文档</h2>
      <p>基于 Cloudflare D1 的轻量级数据库解决方案</p>
      <p><strong>Base URL:</strong> <code id="base"></code></p>
    </div>
    <div class="quickstart">
      <h3>🚀 快速开始</h3>
      <code>curl <span id="curl1"></span>/api/app-versions<br><br>curl <span id="curl2"></span>/api/json-data</code>
    </div>
    <div class="api-group">
      <div class="api-group-header"><h3>👤 Users</h3></div>
      <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/users</div><div class="desc">获取用户列表</div></div><a href="/api/users" class="btn" target="_blank">Try</a></div>
      <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/users/:id</div><div class="desc">获取单个用户</div></div><a href="/api/users/1" class="btn" target="_blank">Try</a></div>
      <div class="endpoint"><span class="method post">POST</span><div><div class="path">/api/users</div><div class="desc">创建用户</div></div><a href="/demo/app-versions" class="btn">Demo</a></div>
      <div class="endpoint"><span class="method put">PUT</span><div><div class="path">/api/users/:id</div><div class="desc">更新用户</div></div><a href="/demo/app-versions" class="btn">Demo</a></div>
      <div class="endpoint"><span class="method delete">DELETE</span><div><div class="path">/api/users/:id</div><div class="desc">删除用户</div></div><a href="/demo/app-versions" class="btn">Demo</a></div>
    </div>
    <div class="api-group">
      <div class="api-group-header"><h3>📦 App Versions</h3></div>
      <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/app-versions</div><div class="desc">获取应用版本列表</div></div><a href="/api/app-versions" class="btn" target="_blank">Try</a></div>
      <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/app-versions/:id</div><div class="desc">获取单个版本</div></div><a href="/api/app-versions/1" class="btn" target="_blank">Try</a></div>
      <div class="endpoint"><span class="method post">POST</span><div><div class="path">/api/app-versions</div><div class="desc">创建版本</div></div><a href="/demo/app-versions" class="btn">Demo</a></div>
      <div class="endpoint"><span class="method put">PUT</span><div><div class="path">/api/app-versions/:id</div><div class="desc">更新版本</div></div><a href="/demo/app-versions" class="btn">Demo</a></div>
      <div class="endpoint"><span class="method delete">DELETE</span><div><div class="path">/api/app-versions/:id</div><div class="desc">删除版本</div></div><a href="/demo/app-versions" class="btn">Demo</a></div>
    </div>
    <div class="api-group">
      <div class="api-group-header"><h3>📄 JSON Data</h3></div>
      <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/json-data</div><div class="desc">获取 JSON 数据列表</div></div><a href="/api/json-data" class="btn" target="_blank">Try</a></div>
      <div class="endpoint"><span class="method get">GET</span><div><div class="path">/api/json-data/:id</div><div class="desc">获取单条数据</div></div><a href="/api/json-data/1" class="btn" target="_blank">Try</a></div>
      <div class="endpoint"><span class="method post">POST</span><div><div class="path">/api/json-data</div><div class="desc">创建 JSON 数据</div></div><a href="/demo/json-data" class="btn">Demo</a></div>
      <div class="endpoint"><span class="method put">PUT</span><div><div class="path">/api/json-data/:id</div><div class="desc">更新 JSON 数据</div></div><a href="/demo/json-data" class="btn">Demo</a></div>
      <div class="endpoint"><span class="method delete">DELETE</span><div><div class="path">/api/json-data/:id</div><div class="desc">删除 JSON 数据</div></div><a href="/demo/json-data" class="btn">Demo</a></div>
    </div>
    <footer class="footer"><p>FreeDB v0.2.0 | MIT License</p></footer>
  </div>
  <script>
    const b=window.location.origin;
    document.getElementById('base').textContent=b;
    document.getElementById('curl1').textContent=b;
    document.getElementById('curl2').textContent=b;
  </script>
</body>
</html>`);
});

app.get('/health', async (c) => {
  return c.html(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Health</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#4ecca3;padding:40px}.status{font-size:2em;margin-bottom:20px}.info{background:rgba(255,255,255,0.05);padding:20px;border-radius:8px;max-width:600px}</style>
</head><body><div class="status">✅ OK</div><div class="info" id="i"><p>Loading...</p></div>
<script>fetch('/health').then(r=>r.json()).then(d=>{document.getElementById('i').innerHTML='<p>Status: '+d.status+'</p><p>Time: '+d.timestamp+'</p><p>Env: '+d.environment+'</p>'});</script>
</body></html>`);
});

export default app;
