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
- 🔐 **Token 认证**: 支持 API Token 认证机制
- 📦 **完整 CRUD**: 内置数据库迁移和完整 CRUD 操作
- 🎨 **管理后台**: 内置可视化后台管理界面
- 📊 **访问统计**: 自动记录 API 访问日志

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
│   └── schema.sql        # 数据库表结构
├── src/
│   ├── index.js          # 入口文件
│   ├── routes/
│   │   ├── html.js       # 首页路由
│   │   ├── admin_api.js  # 后台管理 API
│   │   ├── admin_users.js    # 用户管理页面
│   │   ├── admin_tokens.js   # Token 管理页面
│   │   ├── admin_visits.js   # 访问统计页面
│   │   ├── api_app_versions.js # 应用版本 API
│   │   └── api_json_datas.js   # JSON 数据 API
│   ├── static_assets.js  # 静态资源（JS 文件）
│   └── templates/        # HTML 模板
│       ├── layouts/      # 布局模板
│       └── pages/        # 页面模板
└── tests/                # 测试文件
```

## 📚 API 文档

### 认证说明

调用 API 时需要在 Header 中添加 Token：

```bash
curl https://freedb.darren.host/api/app-versions \
  -H "X-API-Token: YOUR_TOKEN"
```

或在后台管理页面为用户生成 Token。

### 应用版本 API (`/api/app-versions`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/app-versions` | 获取应用版本列表 |
| GET | `/api/app-versions/:id` | 获取单个应用版本 |
| POST | `/api/app-versions` | 创建应用版本 |
| PUT | `/api/app-versions/:id` | 更新应用版本 |
| DELETE | `/api/app-versions/:id` | 删除应用版本 |

#### 应用版本字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 主键 ID |
| `name` | TEXT | 应用名称 |
| `code` | TEXT | 应用编码 |
| `parent_code` | TEXT | 父级编码 |
| `package` | TEXT | 包名 |
| `version` | TEXT | 版本号 |
| `url` | TEXT | 下载/访问 URL |
| `status` | TEXT | 状态：active/inactive |
| `create_user` | TEXT | 创建人 |
| `create_time` | DATETIME | 创建时间 |
| `update_user` | TEXT | 更新人 |
| `update_time` | DATETIME | 更新时间 |

### JSON 数据 API (`/api/json-data`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/json-data` | 获取 JSON 数据列表 |
| GET | `/api/json-data/:id` | 获取单条 JSON 数据 |
| POST | `/api/json-data` | 创建 JSON 数据 |
| PUT | `/api/json-data/:id` | 更新 JSON 数据 |
| DELETE | `/api/json-data/:id` | 删除 JSON 数据 |

## 🎨 管理后台

项目内置完整的管理后台，提供可视化操作界面：

| 页面 | 路径 | 说明 |
|------|------|------|
| **首页** | `/` | API 文档和快速开始 |
| **健康检查** | `/health` | 系统状态页面 |
| **用户管理** | `/admin/users` | 用户 CRUD、禁用/启用、生成 Token |
| **Token 管理** | `/admin/tokens` | Token CRUD、启用/禁用 |
| **访问统计** | `/admin/visits` | API 访问日志统计 |
| **应用版本** | `/demo/app-versions` | 应用版本管理 |
| **JSON 数据** | `/demo/json-data` | JSON 数据管理 |

### 默认管理员账号

```
邮箱：admin@example.com
密码：admin123
```

**⚠️ 首次登录后请修改默认密码！**

## 🔐 Token 管理

### 生成 Token

1. 登录管理后台 `/admin/users`
2. 点击用户行的「生成 Token」按钮
3. 输入 Token 名称（可选）
4. 复制生成的 Token 用于 API 调用

### Token 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 主键 ID |
| `user_id` | INTEGER | 关联用户 ID |
| `user` | TEXT | 用户名 |
| `token` | TEXT | Token 值（唯一） |
| `status` | INTEGER | 状态：1=启用，0=禁用 |
| `create_time` | DATETIME | 创建时间 |
| `update_time` | DATETIME | 更新时间 |

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

**版本**: 0.3.0  
**状态**: ✅ 稳定版本  
**最后更新**: 2024-06-28
