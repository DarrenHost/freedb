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
import { visitLogger } from './middleware/visit_logger.js';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// 访问记录中间件（记录所有请求）
app.use('*', async (c, next) => {
  await visitLogger(c.env)(c, next);
});

// HTML 路由
app.route('/', htmlRouter);

// Demo 页面路由
app.route('/demo', demoRouter);
app.route('/demo', demoJsonDataRouter);

// 管理后台
app.route('/admin', adminVisitsRouter);

// API 路由
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
