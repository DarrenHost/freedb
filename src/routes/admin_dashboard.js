import { Hono } from 'hono';
import { dashboardPage } from '../templates/pages/dashboard.js';

const app = new Hono();

/**
 * @api {get} /admin/dashboard 后台首页
 */
app.get('/dashboard', async (c) => {
  return c.html(dashboardPage());
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
      return c.json({ success: false, error: '邮箱或密码错误' }, 401);
    }
    
    const sessionId = crypto.randomUUID();
    c.header('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; Max-Age=86400`);
    
    return c.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
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
  return c.json({ success: true, data: { name: 'admin' } });
});

export default app;
