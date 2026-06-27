/**
 * FreeDB 数据库模块
 * 基于 Cloudflare D1 的轻量级数据库操作封装
 */

/**
 * 查询构建器类
 */
export class QueryBuilder {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
    this.conditions = [];
    this.params = [];
    this.orderByClause = '';
    this.limitClause = '';
    this.offsetClause = '';
  }

  /**
   * 添加 WHERE 条件
   * @param {Object} conditions - 条件对象 {column: value}
   * @returns {QueryBuilder}
   */
  where(conditions) {
    for (const [key, value] of Object.entries(conditions)) {
      this.conditions.push(`${key} = ?`);
      this.params.push(value);
    }
    return this;
  }

  /**
   * 添加 ORDER BY 子句
   * @param {string} column - 列名
   * @param {string} direction - 方向 ASC/DESC
   * @returns {QueryBuilder}
   */
  orderBy(column, direction = 'ASC') {
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  /**
   * 添加 LIMIT 子句
   * @param {number} limit - 限制数量
   * @returns {QueryBuilder}
   */
  limit(limit) {
    this.limitClause = `LIMIT ${limit}`;
    return this;
  }

  /**
   * 添加 OFFSET 子句
   * @param {number} offset - 偏移量
   * @returns {QueryBuilder}
   */
  offset(offset) {
    this.offsetClause = `OFFSET ${offset}`;
    return this;
  }

  /**
   * 执行查询，返回所有结果
   * @returns {Promise<Array>}
   */
  async all() {
    return await this.db.all(this);
  }

  /**
   * 执行查询，返回第一条结果
   * @returns {Promise<Object|null>}
   */
  async first() {
    return await this.db.first(this);
  }

  /**
   * 获取 SQL 和参数
   * @returns {Object}
   */
  getQuery() {
    let sql = `SELECT * FROM ${this.tableName}`;
    
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }
    
    if (this.limitClause) {
      sql += ` ${this.limitClause}`;
    }
    
    if (this.offsetClause) {
      sql += ` ${this.offsetClause}`;
    }
    
    return { sql, params: this.params };
  }
}

/**
 * 数据库操作类
 */
export class Database {
  constructor(db) {
    this.db = db;
  }

  /**
   * 创建查询构建器
   * @param {string} tableName - 表名
   * @returns {QueryBuilder}
   */
  query(tableName) {
    return new QueryBuilder(this, tableName);
  }

  /**
   * 执行查询，返回所有结果
   * @param {QueryBuilder} queryBuilder
   * @returns {Promise<Array>}
   */
  async all(queryBuilder) {
    const { sql, params } = queryBuilder.getQuery();
    const result = await this.db.prepare(sql).bind(...params).all();
    return result.results || [];
  }

  /**
   * 执行查询，返回第一条结果
   * @param {QueryBuilder} queryBuilder
   * @returns {Promise<Object|null>}
   */
  async first(queryBuilder) {
    queryBuilder.limit(1);
    const results = await this.all(queryBuilder);
    return results[0] || null;
  }

  /**
   * 插入数据
   * @param {string} tableName - 表名
   * @param {Object} data - 数据对象
   * @returns {Promise<Object>} 插入的结果
   */
  async insert(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const result = await this.db.prepare(sql).bind(...values).run();
    
    return {
      id: result.meta?.last_row_id,
      changes: result.meta?.changes,
      ...data
    };
  }

  /**
   * 更新数据
   * @param {string} tableName - 表名
   * @param {Object} data - 更新的数据
   * @returns {UpdateBuilder}
   */
  update(tableName, data) {
    return new UpdateBuilder(this, tableName, data);
  }

  /**
   * 删除数据
   * @param {string} tableName - 表名
   * @returns {DeleteBuilder}
   */
  delete(tableName) {
    return new DeleteBuilder(this, tableName);
  }

  /**
   * 执行原始 SQL
   * @param {string} sql - SQL 语句
   * @param {Array} params - 参数数组
   * @returns {Promise<Object>}
   */
  async raw(sql, params = []) {
    return await this.db.prepare(sql).bind(...params).run();
  }

  /**
   * 批量插入
   * @param {string} tableName - 表名
   * @param {Array<Object>} records - 记录数组
   * @returns {Promise<Object>}
   */
  async insertBatch(tableName, records) {
    const statements = records.map(record => {
      const columns = Object.keys(record).join(', ');
      const placeholders = Object.keys(record).map(() => '?').join(', ');
      const values = Object.values(record);
      return this.db.prepare(
        `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`
      ).bind(...values);
    });
    
    return await this.db.batch(statements);
  }
}

/**
 * 更新构建器
 */
export class UpdateBuilder {
  constructor(db, tableName, data) {
    this.db = db;
    this.tableName = tableName;
    this.data = data;
    this.conditions = [];
    this.params = [];
  }

  where(conditions) {
    for (const [key, value] of Object.entries(conditions)) {
      this.conditions.push(`${key} = ?`);
      this.params.push(value);
    }
    return this;
  }

  async execute() {
    const setClause = Object.keys(this.data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = [
      ...Object.values(this.data),
      ...this.params
    ];
    
    let sql = `UPDATE ${this.tableName} SET ${setClause}`;
    
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    return await this.db.prepare(sql).bind(...values).run();
  }
}

/**
 * 删除构建器
 */
export class DeleteBuilder {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
    this.conditions = [];
    this.params = [];
  }

  where(conditions) {
    for (const [key, value] of Object.entries(conditions)) {
      this.conditions.push(`${key} = ?`);
      this.params.push(value);
    }
    return this;
  }

  async execute() {
    let sql = `DELETE FROM ${this.tableName}`;
    
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    return await this.db.prepare(sql).bind(...this.params).run();
  }
}

/**
 * 创建数据库实例
 * @param {Object} env - Cloudflare 环境对象
 * @returns {Database}
 */
export function createDB(env) {
  if (!env || !env.DB) {
    throw new Error('Database not initialized. Make sure DB binding is configured in wrangler.toml');
  }
  return new Database(env.DB);
}

// 导出 DB 辅助函数（需要在路由中使用 env 参数）
export const DB = {
  query: (env, tableName) => {
    const db = createDB(env);
    return db.query(tableName);
  },
  
  insert: (env, tableName, data) => {
    const db = createDB(env);
    return db.insert(tableName, data);
  },
  
  raw: (env, sql, params = []) => {
    const db = createDB(env);
    return db.raw(sql, params);
  }
};
