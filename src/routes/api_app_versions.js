import { Hono } from 'hono';

const app = new Hono();

/**
 * @api {get} /api/app-versions 获取应用版本列表
 */
app.get('/', async (c) => {
  try {
    const db = c.env.DB;
    let sql = 'SELECT * FROM app_versions';
    const conditions = [];
    const params = [];
    
    // 支持筛选
    const status = c.req.query('status');
    const code = c.req.query('code');
    const package_name = c.req.query('package');
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (code) {
      conditions.push('code = ?');
      params.push(code);
    }
    if (package_name) {
      conditions.push('package = ?');
      params.push(package_name);
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
 * @api {get} /api/app-versions/:id 获取单个应用版本
 */
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM app_versions WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json({
        success: false,
        error: 'App version not found'
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
 * @api {post} /api/app-versions 创建应用版本
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, code, parent_code, package: pkg, version, url, status, create_user } = body;
    
    // 验证必填字段
    if (!name || !code || !pkg || !version) {
      return c.json({
        success: false,
        error: 'Name, code, package and version are required'
      }, 400);
    }
    
    const db = c.env.DB;
    const now = new Date().toISOString();
    const result = await db.prepare(`
      INSERT INTO app_versions 
      (name, code, parent_code, package, version, url, status, create_user, create_time, update_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      code,
      parent_code || null,
      pkg,
      version,
      url || null,
      status || 'active',
      create_user || 'system',
      now,
      now
    ).run();
    
    const appVersion = await db.prepare('SELECT * FROM app_versions WHERE id = ?')
      .bind(result.meta?.last_row_id)
      .first();
    
    return c.json({
      success: true,
      data: appVersion
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * @api {put} /api/app-versions/:id 更新应用版本
 */
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const db = c.env.DB;
    const existing = await db.prepare('SELECT * FROM app_versions WHERE id = ?').bind(id).first();
    
    if (!existing) {
      return c.json({
        success: false,
        error: 'App version not found'
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    await db.prepare(`
      UPDATE app_versions SET 
        name = ?, code = ?, parent_code = ?, package = ?, 
        version = ?, url = ?, status = ?, update_user = ?, update_time = ?
      WHERE id = ?
    `).bind(
      body.name || existing.name,
      body.code || existing.code,
      body.parent_code !== undefined ? body.parent_code : existing.parent_code,
      body.package || existing.package,
      body.version || existing.version,
      body.url !== undefined ? body.url : existing.url,
      body.status || existing.status,
      body.update_user || existing.update_user,
      now,
      id
    ).run();
    
    const updated = await db.prepare('SELECT * FROM app_versions WHERE id = ?').bind(id).first();
    
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
 * @api {delete} /api/app-versions/:id 删除应用版本
 */
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = c.env.DB;
    
    const existing = await db.prepare('SELECT * FROM app_versions WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'App version not found'
      }, 404);
    }
    
    await db.prepare('DELETE FROM app_versions WHERE id = ?').bind(id).run();
    
    return c.json({
      success: true,
      message: 'App version deleted successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;
