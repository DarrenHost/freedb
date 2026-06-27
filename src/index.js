import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import htmlRouter from './routes/html.js';
import usersRouter from './routes/users.js';
import appVersionsRouter from './routes/app_versions.js';
import jsonDataRouter from './routes/json_data.js';
import demoRouter from './routes/demo.js';
import demoJsonDataRouter from './routes/demo_json_data.js';
import adminVisitsRouter from './routes/admin_visits.js';
import adminTokensRouter from './routes/admin_tokens.js';
import { createVisitMiddleware } from './middleware/visit_logger.js';

const app = new Hono();

// 全局中间件
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// API 访问记录中间件（仅记录 /api/ 路径，排除管理后台 API）
const visitMiddleware = createVisitMiddleware();
app.use('/api/*', async (c, next) => {
  // 不记录管理后台的 API
  if (c.req.path.startsWith('/admin/api/')) {
    return await next();
  }
  await visitMiddleware(c, next);
});

// HTML 路由（不记录访问）
app.route('/', htmlRouter);

// Demo 页面路由（不记录访问）
app.route('/demo', demoRouter);
app.route('/demo', demoJsonDataRouter);

// 管理后台（不记录访问）
app.route('/admin', adminVisitsRouter);
app.route('/admin', adminTokensRouter);

// API 路由（记录访问）
app.route('/api/users', usersRouter);
app.route('/api/app-versions', appVersionsRouter);
app.route('/api/json-data', jsonDataRouter);

// 404 处理
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found'
  }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error(err);
  return c.json({
    success: false,
    error: err.message
  }, 500);
});

export default app;
