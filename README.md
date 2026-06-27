# FreeDB

基于 Cloudflare D1 的轻量级自由数据库解决方案

## 📋 项目简介

FreeDB 是一个构建在 Cloudflare D1 数据库之上的轻量级数据库访问层，提供简单、高效的 Serverless 数据库操作方案。

**Cloudflare D1** 是 Cloudflare 推出的原生 Serverless SQLite 数据库，运行在 Cloudflare 全球边缘网络上。

## 🎯 核心特性

- ⚡ **Serverless 架构**: 无需管理服务器，按使用量付费
- 🌍 **全球边缘**: 数据存储在 Cloudflare 全球边缘网络
- 💰 **免费额度**: 每月 500 万行读取，免费使用
- 🔌 **Hono 集成**: 轻量级 Web 框架，快速构建 API
- 📦 **迁移系统**: 内置数据库迁移和种子数据
- 🔐 **类型安全**: 支持 TypeScript（可选）
- 🧪 **测试友好**: 本地测试支持

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Cloudflare 账号
- Wrangler CLI

### 安装

```bash
# 克隆项目
git clone https://github.com/DarrenHost/freedb.git
cd freedb

# 安装依赖
npm install

# 登录 Cloudflare
npx wrangler login

# 创建 D1 数据库
npx wrangler d1 create freedb

# 更新 wrangler.toml 中的 database_id
```

### 配置

编辑 `wrangler.toml`，填入你的 D1 数据库 ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "freedb"
database_id = "你的数据库 ID"
```

### 初始化数据库

```bash
# 本地开发环境
npm run db:init

# 生产环境
npx wrangler d1 execute freedb --remote --file=sql/schema.sql
```

### 开发运行

```bash
# 启动本地开发服务器
npm run dev

# 访问 http://localhost:8787
```

### 部署

```bash
# 部署到 Cloudflare
npm run deploy
```

## 📁 项目结构

```
freedb/
├── README.md              # 项目说明
├── package.json           # Node.js 配置
├── wrangler.toml          # Cloudflare 配置
├── .gitignore            # Git 忽略规则
├── LICENSE               # MIT 许可证
├── sql/
│   ├── schema.sql        # 数据库表结构
│   └── migrations/       # 迁移文件
├── src/
│   ├── index.js          # 入口文件
│   ├── routes/           # API 路由
│   ├── db/
│   │   ├── index.js      # 数据库模块
│   │   ├── query.js      # 查询构建器
│   │   └── migrations.js # 迁移工具
│   └── middleware/       # 中间件
├── scripts/
│   └── seed.js           # 种子数据脚本
└── tests/                # 测试文件
```

## 📚 使用示例

### 基础 CRUD 操作

```javascript
import { DB } from 'freedb';

// 创建记录
const user = await DB.insert('users', {
  name: 'John',
  email: 'john@example.com'
});

// 查询记录
const users = await DB.query('users')
  .where({ status: 'active' })
  .orderBy('created_at', 'DESC')
  .limit(10);

// 更新记录
await DB.update('users', { status: 'inactive' })
  .where({ id: 1 });

// 删除记录
await DB.delete('users').where({ id: 1 });
```

### API 路由示例

```javascript
// src/routes/users.js
import { Hono } from 'hono';
import { DB } from '../db';

const app = new Hono();

// 获取用户列表
app.get('/users', async (c) => {
  const users = await DB.query('users').all();
  return c.json({ success: true, data: users });
});

// 创建用户
app.post('/users', async (c) => {
  const body = await c.req.json();
  const user = await DB.insert('users', body);
  return c.json({ success: true, data: user }, 201);
});

export default app;
```

### 数据库迁移

```sql
-- sql/migrations/001_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

运行迁移：

```bash
npm run db:migrate
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ENVIRONMENT` | 运行环境 | `development` |
| `DB` | D1 数据库绑定 | - |

### wrangler.toml 配置

```toml
# D1 数据库
[[d1_databases]]
binding = "DB"              # 代码中使用的绑定名
database_name = "freedb"    # 数据库名称
database_id = "xxx"         # 数据库 ID（从 wrangler 获取）

# 变量
[vars]
ENVIRONMENT = "development"
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 单个测试文件
npx jest tests/db.test.js
```

## 📊 D1 数据库限制

| 操作 | 免费额度 | 付费价格 |
|------|---------|---------|
| 读取行数 | 500 万/月 | $0.10/百万行 |
| 写入行数 | 100 万/月 | $0.50/百万行 |
| 存储空间 | 5 GB | $0.50/GB/月 |

## 🤝 贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

MIT License

## 🔗 参考资源

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Hono 框架文档](https://hono.dev/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 📬 联系方式

- **GitHub**: [@DarrenHost](https://github.com/DarrenHost)
- **Email**: darren.host@foxmail.com

---

**版本**: 0.1.0  
**状态**: 🚧 开发中  
**最后更新**: 2024-06-27
