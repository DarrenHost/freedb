import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /admin/dashboard 后台首页
 */
app.get('/dashboard', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreeDB 后台管理系统</title>
  <style>
    :root{--primary:#667eea;--primary-dark:#5568d3;--bg:#f5f7fa;--sidebar:#1a1a2e;--text:#262626}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}
    .sidebar{width:250px;background:var(--sidebar);color:#fff;position:fixed;height:100vh;overflow-y:auto}
    .sidebar-header{padding:20px;border-bottom:1px solid rgba(255,255,255,0.1)}
    .sidebar-header h2{font-size:1.5em}
    .sidebar-header h2 span{color:var(--primary)}
    .sidebar-nav{padding:20px 0}
    .sidebar-nav a{display:flex;align-items:center;gap:10px;padding:12px 20px;color:rgba(255,255,255,0.8);text-decoration:none;transition:all 0.2s}
    .sidebar-nav a:hover,.sidebar-nav a.active{background:rgba(255,255,255,0.1);color:#fff}
    .sidebar-nav a .icon{font-size:1.2em}
    .main-content{flex:1;margin-left:250px;padding:30px}
    .header{background:#fff;padding:20px 30px;border-radius:12px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .header h1{font-size:1.8em;color:var(--primary)}
    .user-info{display:flex;align-items:center;gap:15px}
    .user-info span{color:#8c8c8c}
    .logout-btn{padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:6px;cursor:pointer}
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
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Free<span>DB</span></h2>
    </div>
    <nav class="sidebar-nav">
      <a href="/admin/dashboard" class="active"><span class="icon">🏠</span> 控制台</a>
      <a href="/admin/users"><span class="icon">👤</span> 用户管理</a>
      <a href="/admin/tokens"><span class="icon">🔑</span> Token 管理</a>
      <a href="/admin/visits"><span class="icon">📊</span> 访问统计</a>
      <a href="/"><span class="icon">📚</span> API 文档</a>
    </nav>
  </aside>
  <main class="main-content">
    <div class="header">
      <h1>📊 控制台</h1>
      <div class="user-info">
        <span id="username">管理员</span>
        <button class="logout-btn" onclick="logout()">退出登录</button>
      </div>
    </div>
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
  </main>
  <div class="login-overlay" id="login-overlay">
    <div class="login-box">
      <h2>🔐 后台登录</h2>
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>邮箱</label>
          <input type="email" id="email" required placeholder="admin@example.com">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" id="password" required placeholder="请输入密码">
        </div>
        <button type="submit" class="login-btn">登录</button>
      </form>
    </div>
  </div>
  <script>
    let isLoggedIn=false;
    async function checkAuth(){
      try{
        const res=await fetch('/api/admin/check');
        const data=await res.json();
        if(data.success){isLoggedIn=true;document.getElementById('username').textContent=data.data.name||'管理员';}
        else{document.getElementById('login-overlay').classList.add('active');}
      }catch(e){document.getElementById('login-overlay').classList.add('active');}
    }
    async function handleLogin(e){
      e.preventDefault();
      const email=document.getElementById('email').value;
      const password=document.getElementById('password').value;
      try{
        const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pwd:md5(password)})});
        const data=await res.json();
        if(data.success){isLoggedIn=true;document.getElementById('username').textContent=data.data.name||'管理员';document.getElementById('login-overlay').classList.remove('active');loadStats();}
        else{alert('登录失败：'+data.error);}
      }catch(e){alert('登录失败：'+e.message);}
    }
    function logout(){
      fetch('/api/admin/logout',{method:'POST'});
      isLoggedIn=false;
      location.reload();
    }
    async function loadStats(){
      try{
        const [usersRes,tokensRes,visitsRes]=await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/tokens'),
          fetch('/api/admin/visits')
        ]);
        const users=await usersRes.json();
        const tokens=await tokensRes.json();
        const visits=await visitsRes.json();
        if(users.success){
          const total=users.data.length;
          const active=users.data.filter(u=>u.status==='active').length;
          document.getElementById('stat-users').textContent=total;
          document.getElementById('stat-active').textContent=active;
        }
        if(tokens.success){
          const total=tokens.data.length;
          const active=tokens.data.filter(t=>t.status===1).length;
          document.getElementById('stat-tokens').textContent=total;
          document.getElementById('stat-tokens-active').textContent=active;
        }
        if(visits.success){
          const today=visits.data.filter(v=>new Date(v.visit_time).toDateString()===new Date().toDateString()).length;
          const avg=visits.data.length>0?Math.round(visits.data.reduce((s,v)=>s+(v.response_time_ms||0),0)/visits.data.length):0;
          document.getElementById('stat-visits').textContent=today;
          document.getElementById('stat-avg').textContent=avg+'ms';
        }
      }catch(e){console.error('加载统计失败',e);}
    }
    function md5(e){function t(e){var t=(e>>>0).toString(16);return"00000000".substr(0,8-t.length)+t}function r(e){for(var t=[],r=0;r<e.length;r++)t.push(e.charCodeAt(r));return t}function n(e){for(var t="",r=0;r<e.length;r++)t+=t(e[r]);return t}var o=function(e){var t,r,n,o,i,a,s,c;for(n=e.length,o=1732584193,i=4023233417,a=2562383102,s=271733878,c=3285377520,t=0;t<n;t+=16){var l=[o,i,a,s];l=u(l,e.slice(t,t+16)),o=l[0],i=l[1],a=l[2],s=l[3]}return[o,i,a,s]}(r(e));return n(o).toUpperCase()}function u(e,t){var r,n,o,i,a,s,c,u,l,p,f,h,d,g,m,v,y,x;for(r=e[0],n=e[1],o=e[2],i=e[3],a=t[0],s=t[1],c=t[2],u=t[3],l=t[4],p=t[5],f=t[6],h=t[7],d=t[8],g=t[9],m=t[10],v=t[11],y=t[12],x=t[13],r=(r+(n&o|~n&i)+(r>>>-7|r<<7)+a)>>>0,n=(n+(o&i|~o&r)+(n>>>-12|n<<20)+s)>>>0,o=(o+(i&r|~i&n)+(o>>>-17|o<<15)+c)>>>0,i=(i+(r&n|~r&o)+(i>>>-22|i<<10)+u)>>>0,r=(r+(n&i|o&~i)+(r>>>-7|r<<7)+l)>>>0,n=(n+(o&r|~r&i)+(n>>>-12|n<<20)+p)>>>0,o=(o+(i&n|~n&r)+(o>>>-17|o<<15)+f)>>>0,i=(i+(r&o|~o&n)+(i>>>-22|i<<10)+h)>>>0,r=(r+(n^o^i)+(r>>>-7|r<<7)+d)>>>0,n=(n+(o^r^i)+(n>>>-12|n<<20)+g)>>>0,o=(o+(i^n^r)+(o>>>-17|o<<15)+m)>>>0,i=(i+(r^o^n)+(i>>>-22|i<<10)+v)>>>0,r=(r+(o|~i)+(r>>>-7|r<<7)+y)>>>0,n=(n+(r|~i)+(n>>>-12|n<<20)+x)>>>0,o=(o+(n|~r)+(o>>>-17|o<<15)+a)>>>0,i=(i+(o|~n)+(i>>>-22|i<<10)+s)>>>0;return[r,n,o,i]}
    checkAuth();
  </script>
</body>
</html>`);
});

/**
 * @api {post} /api/admin/login 登录
 */
app.post('/api/admin/login', async (c) => {
  try {
    const { email, pwd } = await c.req.json();
    const db = c.env.DB;
    
    const user = await db.prepare('SELECT * FROM users WHERE email = ? AND pwd = ?')
      .bind(email, pwd)
      .first();
    
    if (!user) {
      return c.json({
        success: false,
        error: '邮箱或密码错误'
      }, 401);
    }
    
    // 设置 session cookie
    const sessionId = crypto.randomUUID();
    c.header('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; Max-Age=86400`);
    
    // 保存 session 到 KV（如果有）或内存
    // 简化版本：不存储，仅验证
    
    return c.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {post} /api/admin/logout 登出
 */
app.post('/api/admin/logout', async (c) => {
  c.header('Set-Cookie', 'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return c.json({ success: true });
});

/**
 * @api {get} /api/admin/check 检查登录状态
 */
app.get('/api/admin/check', async (c) => {
  // 简化版本：总是返回成功
  // 实际项目应该验证 session
  return c.json({
    success: true,
    data: { name: 'admin' }
  });
});

export default app;
