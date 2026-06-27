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
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  parent_code TEXT,
  package TEXT NOT NULL,
  version TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'active',
  create_user TEXT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_user TEXT,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_versions_code ON app_versions(code);
CREATE INDEX IF NOT EXISTS idx_app_versions_parent_code ON app_versions(parent_code);
CREATE INDEX IF NOT EXISTS idx_app_versions_package ON app_versions(package);
CREATE INDEX IF NOT EXISTS idx_app_versions_status ON app_versions(status);

-- ============================================
-- JSON 数据表
-- ============================================
CREATE TABLE IF NOT EXISTS json_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT,
  parent_name TEXT,
  parent_code TEXT,
  content TEXT,
  status INTEGER DEFAULT 1,
  create_user TEXT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_user TEXT,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN (0, 1, 2))
);

CREATE INDEX IF NOT EXISTS idx_json_data_name ON json_data(name);
CREATE INDEX IF NOT EXISTS idx_json_data_code ON json_data(code);
CREATE INDEX IF NOT EXISTS idx_json_data_parent_name ON json_data(parent_name);
CREATE INDEX IF NOT EXISTS idx_json_data_parent_code ON json_data(parent_code);
CREATE INDEX IF NOT EXISTS idx_json_data_status ON json_data(status);

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

-- JSON 数据示例
INSERT OR IGNORE INTO json_data (name, code, parent_name, parent_code, content, status, create_user) VALUES 
  ('首页配置', 'home-config', NULL, NULL, '{"title": "FreeDB", "subtitle": "轻量级数据库解决方案", "theme": "dark"}', 1, 'admin'),
  ('用户设置', 'user-settings', NULL, NULL, '{"language": "zh-CN", "timezone": "UTC+8", "notifications": true}', 1, 'admin'),
  ('导航菜单', 'nav-menu', '首页配置', 'home-config', '{"items": [{"name": "首页", "path": "/"}, {"name": "关于", "path": "/about"}]}', 1, 'admin'),
  ('测试数据', 'test-data', NULL, NULL, '{"test": true, "value": 123}', 0, 'test');
