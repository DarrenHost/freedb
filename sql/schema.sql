-- FreeDB 数据库表结构
-- Cloudflare D1 (SQLite)

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pwd TEXT,
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
-- API 访问记录表
-- ============================================
CREATE TABLE IF NOT EXISTS visit_log (
  visit_id TEXT PRIMARY KEY,
  visit_time TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  method TEXT NOT NULL,
  request_url TEXT NOT NULL,
  request_path TEXT NOT NULL,
  query_string TEXT,
  referrer_url TEXT,
  user_agent TEXT,
  remote_ip TEXT,
  remote_port INTEGER,
  server_ip TEXT,
  server_port INTEGER,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visit_log_time ON visit_log(visit_time);
CREATE INDEX IF NOT EXISTS idx_visit_log_user ON visit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_log_session ON visit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_visit_log_method ON visit_log(method);
CREATE INDEX IF NOT EXISTS idx_visit_log_path ON visit_log(request_path);
CREATE INDEX IF NOT EXISTS idx_visit_log_status ON visit_log(status_code);

-- ============================================
-- Token 管理表（新增 user_id 字段）
-- ============================================
CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status INTEGER DEFAULT 1,
  create_user TEXT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_user TEXT,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);

-- ============================================
-- 示例数据
-- ============================================

-- 用户示例数据（密码：admin123 的 MD5）
INSERT OR IGNORE INTO users (name, email, pwd, status) VALUES 
  ('admin', 'admin@example.com', '0192023a7bbd73250516f069df18b500', 'active'),
  ('Alice', 'alice@example.com', NULL, 'active'),
  ('Bob', 'bob@example.com', NULL, 'active');

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

-- Token 示例数据
INSERT OR IGNORE INTO tokens (user_id, user, token, status, create_user) VALUES 
  (1, 'admin', 'admin_token_abc123xyz', 1, 'system'),
  (1, 'admin', 'api_key_def456uvw', 1, 'admin'),
  (2, 'Alice', 'test_token_ghi789rst', 0, 'admin');
