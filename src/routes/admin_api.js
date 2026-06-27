import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /api/admin/check 检查登录状态
 */
app.get('/check', async (c) => {
  return c.json({
    success: true,
    data: { name: 'admin' }
  });
});

/**
 * @api {post} /api/admin/login 登录
 */
app.post('/login', async (c) => {
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
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * @api {post} /api/admin/logout 登出
 */
app.post('/logout', async (c) => {
  c.header('Set-Cookie', 'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return c.json({ success: true });
});

/**
 * @api {get} /api/admin/users 获取用户列表
 */
app.get('/users', async (c) => {
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
app.post('/users', async (c) => {
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
app.put('/users/:id', async (c) => {
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

/**
 * @api {get} /api/admin/tokens 获取 Token 列表
 */
app.get('/tokens', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM tokens ORDER BY create_time DESC').all();
    return c.json({ success: true, data: result.results || [] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * @api {put} /api/admin/tokens/:id 更新 Token 状态
 */
app.put('/tokens/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    const db = c.env.DB;
    const now = new Date().toISOString();
    await db.prepare('UPDATE tokens SET status = ?, update_time = ?, update_user = ? WHERE id = ?')
      .bind(status, now, 'admin', id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * @api {get} /api/admin/visits 获取访问记录
 */
app.get('/visits', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM visit_log ORDER BY visit_time DESC LIMIT 1000').all();
    return c.json({ success: true, data: result.results || [] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;
