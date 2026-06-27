-- FreeDB 数据库表结构
-- Cloudflare D1 (SQLite)

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================
-- 应用版本表
-- ============================================
CREATE TABLE IF NOT EXISTS app_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COMMENT '应用名称',
  code TEXT NOT NULL COMMENT '应用编码',
  parent_code TEXT COMMENT '父级编码',
  package TEXT NOT NULL COMMENT '包名',
  version TEXT NOT NULL COMMENT '版本号',
  url TEXT COMMENT '下载/访问 URL',
  status TEXT DEFAULT 'active' COMMENT '状态：active/inactive',
  create_user TEXT COMMENT '创建人',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_user TEXT COMMENT '更新人',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_app_versions_code ON app_versions(code);
CREATE INDEX IF NOT EXISTS idx_app_versions_parent_code ON app_versions(parent_code);
CREATE INDEX IF NOT EXISTS idx_app_versions_package ON app_versions(package);
CREATE INDEX IF NOT EXISTS idx_app_versions_status ON app_versions(status);

-- ============================================
-- 示例数据
-- ============================================

-- 用户示例数据
INSERT OR IGNORE INTO users (name, email, status) VALUES 
  ('Alice', 'alice@example.com', 'active'),
  ('Bob', 'bob@example.com', 'active'),
  ('Charlie', 'charlie@example.com', 'inactive');

-- 应用版本示例数据
INSERT OR IGNORE INTO app_versions (name, code, parent_code, package, version, url, status, create_user) VALUES 
  ('FreeDB 管理后台', 'freedb-admin', NULL, 'com.freedb.admin', '1.0.0', 'https://github.com/DarrenHost/freedb', 'active', 'admin'),
  ('FreeDB API', 'freedb-api', NULL, 'com.freedb.api', '1.0.0', 'https://api.freedb.com', 'active', 'admin'),
  ('FreeDB 移动端', 'freedb-mobile', 'freedb-api', 'com.freedb.mobile', '1.0.0', 'https://mobile.freedb.com', 'active', 'admin'),
  ('测试应用', 'test-app', NULL, 'com.test.app', '0.1.0', 'https://test.freedb.com', 'inactive', 'test');
