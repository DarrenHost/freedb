import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} / 首页
 */
app.get('/', async (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreeDB - 首页</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    h1 { font-size: 3em; margin-bottom: 20px; }
    p { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
    .links { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
    .links a {
      padding: 12px 24px;
      background: #fff;
      color: #667eea;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .links a:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 FreeDB</h1>
    <p>基于 Cloudflare D1 的轻量级数据库解决方案</p>
    <div class="links">
      <a href="/demo/app-versions">应用版本 Demo</a>
      <a href="/api/users">API: Users</a>
      <a href="/api/app-versions">API: App Versions</a>
      <a href="/health">健康检查</a>
    </div>
  </div>
</body>
</html>
  `);
});

/**
 * @api {get} /health 健康检查页面
 */
app.get('/health', async (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>健康检查 - FreeDB</title>
  <style>
    body {
      font-family: monospace;
      background: #1a1a2e;
      color: #4ecca3;
      padding: 40px;
    }
    .status { 
      font-size: 2em; 
      margin-bottom: 20px;
    }
    .info { 
      background: rgba(255,255,255,0.05);
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
    }
    .info p { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="status">✅ 系统运行正常</div>
  <div class="info" id="info">
    <p>正在加载系统信息...</p>
  </div>
  <script>
    fetch('/health')
      .then(r => r.json())
      .then(data => {
        document.getElementById('info').innerHTML = \`
          <p><strong>状态:</strong> \${data.status}</p>
          <p><strong>时间:</strong> \${data.timestamp}</p>
          <p><strong>环境:</strong> \${data.environment}</p>
        \`;
      });
  </script>
</body>
</html>
  `);
});

export default app;
