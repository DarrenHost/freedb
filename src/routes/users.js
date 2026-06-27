import { Hono } from 'hono';
import { DB } from '../db/index.js';

const app = new Hono();

/**
 * @api {get} /users 获取用户列表
 */
app.get('/', async (c) => {
  try {
    const users = await DB.query('users').all();
    return c.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {get} /users/:id 获取单个用户
 */
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = await DB.query('users').where({ id }).first();
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: user
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {post} /users 创建用户
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
    
    const user = await DB.insert('users', {
      name,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
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
 * @api {put} /users/:id 更新用户
 */
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    // 检查用户是否存在
    const existing = await DB.query('users').where({ id }).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
    // 更新
    await new (await import('../db/index.js')).UpdateBuilder(
      new (await import('../db/index.js')).Database(c.env),
      'users',
      {
        ...body,
        updated_at: new Date().toISOString()
      }
    ).where({ id }).execute();
    
    const updated = await DB.query('users').where({ id }).first();
    
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
 * @api {delete} /users/:id 删除用户
 */
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    // 检查用户是否存在
    const existing = await DB.query('users').where({ id }).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
    await new (await import('../db/index.js')).DeleteBuilder(
      new (await import('../db/index.js')).Database(c.env),
      'users'
    ).where({ id }).execute();
    
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
