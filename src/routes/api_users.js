import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /api/users 获取用户列表
 */
app.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    
    return c.json({
      success: true,
      data: result.results || [],
      count: result.results?.length || 0
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {get} /api/users/:id 获取单个用户
 */
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {post} /api/users 创建用户
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email } = body;
    
    if (!name || !email) {
      return c.json({
        success: false,
        error: 'Name and email are required'
      }, 400);
    }
    
    const db = c.env.DB;
    const now = new Date().toISOString();
    const result = await db.prepare(
      'INSERT INTO users (name, email, created_at, updated_at) VALUES (?, ?, ?, ?)'
    ).bind(name, email, now, now).run();
    
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(result.meta?.last_row_id).first();
    
    return c.json({
      success: true,
      data: user
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {put} /api/users/:id 更新用户
 */
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const db = c.env.DB;
    const existing = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
    const { name, email, status } = body;
    const now = new Date().toISOString();
    
    await db.prepare(
      'UPDATE users SET name = ?, email = ?, status = ?, updated_at = ? WHERE id = ?'
    ).bind(
      name || existing.name,
      email || existing.email,
      status || existing.status,
      now,
      id
    ).run();
    
    const updated = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    
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

/**
 * @api {delete} /api/users/:id 删除用户
 */
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = c.env.DB;
    
    const existing = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
    await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    
    return c.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;
