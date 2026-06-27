import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import usersRouter from './routes/users.js';
import { DB } from './db/index.js';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// 健康检查
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: ENVIRONMENT
  });
});

// API 路由
app.route('/api/users', usersRouter);

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
