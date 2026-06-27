import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// HTML 路由
import htmlRouter from './routes/html.js';

// Demo 页面路由
import demoRouter from './routes/demo.js';
import demoJsonDataRouter from './routes/demo_json_data.js';

// 后台管理路由
import adminDashboardRouter from './routes/admin_dashboard.js';
import adminUsersRouter from './routes/admin_users.js';
import adminVisitsRouter from './routes/admin_visits.js';
import adminTokensRouter from './routes/admin_tokens.js';

// 业务 API 路由
import apiUsersRouter from './routes/api_users.js';
import apiAppVersionsRouter from './routes/api_app_versions.js';
import apiJsonDatasRouter from './routes/api_json_datas.js';

// 中间件
import { createVisitMiddleware } from './middleware/visit_logger.js';

const app = new Hono();

// 全局中间件
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// API 访问记录中间件（仅记录 /api/ 路径，排除管理后台 API）
const visitMiddleware = createVisitMiddleware();
app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/admin/api/')) {
    return await next();
  }
  await visitMiddleware(c, next);
});

// HTML 路由
app.route('/', htmlRouter);

// Demo 页面路由
app.route('/demo', demoRouter);
app.route('/demo', demoJsonDataRouter);

// 管理后台路由
app.route('/admin', adminDashboardRouter);
app.route('/admin', adminUsersRouter);
app.route('/admin', adminVisitsRouter);
app.route('/admin', adminTokensRouter);

// 业务 API 路由
app.route('/api/users', apiUsersRouter);
app.route('/api/app-versions', apiAppVersionsRouter);
app.route('/api/json-data', apiJsonDatasRouter);

// 404 处理
app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: err.message }, 500);
});

export default app;
