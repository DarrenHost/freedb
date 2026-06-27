import { Hono } from 'hono';
import { DB } from '../db/index.js';

const app = new Hono();

/**
 * @api {get} /api/app-versions 获取应用版本列表
 */
app.get('/', async (c) => {
  try {
    const query = DB.query('app_versions');
    
    // 支持筛选
    const status = c.req.query('status');
    const code = c.req.query('code');
    const package_name = c.req.query('package');
    
    if (status) query.where({ status });
    if (code) query.where({ code });
    if (package_name) query.where({ package: package_name });
    
    const versions = await query.orderBy('create_time', 'DESC').all();
    
    return c.json({
      success: true,
      data: versions,
      count: versions.length
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
    const version = await DB.query('app_versions').where({ id }).first();
    
    if (!version) {
      return c.json({
        success: false,
        error: 'App version not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: version
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
    
    const now = new Date().toISOString();
    const appVersion = await DB.insert('app_versions', {
      name,
      code,
      parent_code: parent_code || null,
      package: pkg,
      version,
      url: url || null,
      status: status || 'active',
      create_user: create_user || 'system',
      create_time: now,
      update_time: now
    });
    
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
    
    // 检查是否存在
    const existing = await DB.query('app_versions').where({ id }).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'App version not found'
      }, 404);
    }
    
    // 更新字段
    const updateData = {
      ...existing,
      ...body,
      update_time: new Date().toISOString()
    };
    
    // 移除不需要更新的字段
    delete updateData.id;
    delete updateData.create_time;
    delete updateData.create_user;
    
    const { UpdateBuilder } = await import('../db/index.js');
    const { Database } = await import('../db/index.js');
    const db = new Database(c.env);
    
    await new UpdateBuilder(db, 'app_versions', updateData)
      .where({ id })
      .execute();
    
    const updated = await DB.query('app_versions').where({ id }).first();
    
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
    
    // 检查是否存在
    const existing = await DB.query('app_versions').where({ id }).first();
    if (!existing) {
      return c.json({
        success: false,
        error: 'App version not found'
      }, 404);
    }
    
    const { DeleteBuilder } = await import('../db/index.js');
    const { Database } = await import('../db/index.js');
    const db = new Database(c.env);
    
    await new DeleteBuilder(db, 'app_versions')
      .where({ id })
      .execute();
    
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
