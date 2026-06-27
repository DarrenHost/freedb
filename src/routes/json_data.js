import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /api/json-data 获取 JSON 数据列表
 */
app.get('/', async (c) => {
  try {
    const db = c.env.DB;
    let sql = 'SELECT * FROM json_data';
    const conditions = [];
    const params = [];
    
    // 支持筛选
    const status = c.req.query('status');
    const parent_name = c.req.query('parent_name');
    
    if (status !== undefined) {
      conditions.push('status = ?');
      params.push(parseInt(status));
    }
    if (parent_name) {
      if (parent_name === 'null') {
        conditions.push('parent_name IS NULL');
      } else {
        conditions.push('parent_name = ?');
        params.push(parent_name);
      }
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY create_time DESC';
    
    let query = db.prepare(sql);
    if (params.length > 0) {
      query = query.bind(...params);
    }
    
    const result = await query.all();
    
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
 * @api {get} /api/json-data/:id 获取单条 JSON 数据
 */
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM json_data WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json({
        success: false,
        error: 'JSON data not found'
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
 * @api {post} /api/json-data 创建 JSON 数据
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, parent_name, content, status, create_user } = body;
    
    // 验证必填字段
    if (!name) {
      return c.json({
        success: false,
        error: 'Name is required'
      }, 400);
    }
    
    const db = c.env.DB;
    const now = new Date().toISOString();
    const result = await db.prepare(`
      INSERT INTO json_data 
      (name, parent_name, content, status, create_user, create_time, update_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      parent_name || null,
      content || null,
      status !== undefined ? status : 1,
      create_user || 'system',
      now,
      now
    ).run();
    
    const jsonData = await db.prepare('SELECT * FROM json_data WHERE id = ?')
      .bind(result.meta?.last_row_id)
      .first();
    
    return c.json({
      success: true,
      data: jsonData
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {put} /api/json-data/:id 更新 JSON 数据
 */
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const db = c.env.DB;
    const existing = await db.prepare('SELECT * FROM json_data WHERE id = ?').bind(id).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: 'JSON data not found'
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    await db.prepare(`
      UPDATE json_data SET 
        name = ?, parent_name = ?, content = ?, 
        status = ?, update_user = ?, update_time = ?
      WHERE id = ?
    `).bind(
      body.name || existing.name,
      body.parent_name !== undefined ? body.parent_name : existing.parent_name,
      body.content !== undefined ? body.content : existing.content,
      body.status !== undefined ? body.status : existing.status,
      body.update_user || existing.update_user,
      now,
      id
    ).run();
    
    const updated = await db.prepare('SELECT * FROM json_data WHERE id = ?').bind(id).first();
    
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
 * @api {delete} /api/json-data/:id 删除 JSON 数据
 */
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = c.env.DB;
    
    const existing = await db.prepare('SELECT * FROM json_data WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'JSON data not found'
      }, 404);
    }
    
    await db.prepare('DELETE FROM json_data WHERE id = ?').bind(id).run();
    
    return c.json({
      success: true,
      message: 'JSON data deleted successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;
