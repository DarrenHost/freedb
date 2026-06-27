# FreeDB

轻量级自由数据库解决方案

## 📋 项目简介

FreeDB 是一个轻量级、开源的数据库管理工具，旨在提供简单、高效的数据存储和查询方案。

## 🎯 核心特性

- 🔓 **开源免费**: MIT 许可证，完全免费使用
- 🚀 **轻量高效**: 最小化依赖，快速启动
- 🔌 **插件扩展**: 支持自定义插件和扩展
- 📦 **多格式支持**: JSON, CSV, SQLite 等多种数据格式
- 🔐 **安全可靠**: 数据加密和访问控制
- 🌐 **跨平台**: Windows, macOS, Linux 全平台支持

## 🚀 快速开始

### 环境要求

- Python 3.9+
- pip 包管理器

### 安装

```bash
# 从源码安装
git clone https://github.com/DarrenHost/freedb.git
cd freedb
pip install -e .

# 或使用 pip 安装（发布后）
pip install freedb
```

### 基础使用

```python
from freedb import FreeDB

# 初始化数据库
db = FreeDB('my_database.db')

# 创建表
db.create_table('users', {
    'id': 'INTEGER PRIMARY KEY',
    'name': 'TEXT',
    'email': 'TEXT UNIQUE'
})

# 插入数据
db.insert('users', name='John', email='john@example.com')

# 查询数据
users = db.query('users', where={'email': 'john@example.com'})
print(users)
```

## 📁 项目结构

```
freedb/
├── README.md              # 项目说明
├── LICENSE                # 许可证
├── .gitignore            # Git 忽略规则
├── pyproject.toml        # Python 项目配置
├── requirements.txt      # 依赖列表
├── src/
│   └── freedb/
│       ├── __init__.py   # 包入口
│       ├── core/         # 核心功能
│       ├── drivers/      # 数据库驱动
│       ├── plugins/      # 插件系统
│       └── utils/        # 工具函数
├── tests/                # 测试文件
├── docs/                 # 文档
└── examples/             # 使用示例
```

## 🔧 开发指南

### 安装开发依赖

```bash
pip install -r requirements-dev.txt
```

### 运行测试

```bash
# 运行所有测试
pytest tests/

# 运行单个测试
pytest tests/test_core.py

# 生成测试报告
pytest --cov=src/freedb --cov-report=html
```

### 代码规范

```bash
# 代码格式化
black src/ tests/

# 代码检查
flake8 src/

# 类型检查
mypy src/
```

## 📚 API 文档

详细 API 文档请访问：[https://freedb.readthedocs.io](https://freedb.readthedocs.io)（待发布）

### 核心类

| 类名 | 功能 |
|------|------|
| `FreeDB` | 主数据库类，提供 CRUD 操作 |
| `QueryBuilder` | 链式查询构建器 |
| `Migration` | 数据库迁移工具 |
| `PluginManager` | 插件管理器 |

## 🔌 插件开发

FreeDB 支持自定义插件扩展功能：

```python
from freedb.plugins import BasePlugin

class MyPlugin(BasePlugin):
    name = 'my_plugin'
    version = '1.0.0'
    
    def on_init(self, db):
        # 初始化逻辑
        pass
    
    def on_query(self, query):
        # 查询拦截逻辑
        return query
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 👥 作者与维护者

- **DarrenHost** - [GitHub](https://github.com/DarrenHost) | [Email](mailto:darren.host@foxmail.com)

## 🙏 致谢

感谢以下开源项目的启发：

- [SQLite](https://www.sqlite.org/)
- [Peewee](https://docs.peewee-orm.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)

## 📬 反馈与支持

- 🐛 提交 Issue: [GitHub Issues](https://github.com/DarrenHost/freedb/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/DarrenHost/freedb/discussions)
- 📧 邮件: darren.host@foxmail.com

---

**版本**: 0.1.0 (开发中)  
**最后更新**: 2024-06-27  
**状态**: 🚧 开发中
