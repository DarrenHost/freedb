"""
FreeDB 核心数据库类
"""

import sqlite3
from typing import Any, Dict, List, Optional


class FreeDB:
    """
    FreeDB 主数据库类
    
    提供轻量级的数据库操作接口，支持 SQLite 后端。
    
    示例:
        >>> db = FreeDB('mydb.db')
        >>> db.create_table('users', {'id': 'INTEGER PRIMARY KEY', 'name': 'TEXT'})
        >>> db.insert('users', name='John')
        >>> users = db.query('users')
    """
    
    def __init__(self, db_path: str = ':memory:'):
        """
        初始化数据库连接
        
        Args:
            db_path: 数据库文件路径，默认使用内存数据库
        """
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self._connect()
    
    def _connect(self):
        """建立数据库连接"""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
    
    def create_table(self, table_name: str, columns: Dict[str, str]) -> bool:
        """
        创建数据表
        
        Args:
            table_name: 表名
            columns: 列定义，{列名：类型}
            
        Returns:
            是否成功
        """
        column_defs = ', '.join([f'{name} {dtype}' for name, dtype in columns.items()])
        sql = f'CREATE TABLE IF NOT EXISTS {table_name} ({column_defs})'
        
        try:
            self.cursor.execute(sql)
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"创建表失败：{e}")
            return False
    
    def insert(self, table_name: str, **data) -> Optional[int]:
        """
        插入数据
        
        Args:
            table_name: 表名
            **data: 键值对数据
            
        Returns:
            插入的行 ID，失败返回 None
        """
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data])
        sql = f'INSERT INTO {table_name} ({columns}) VALUES ({placeholders})'
        
        try:
            self.cursor.execute(sql, list(data.values()))
            self.conn.commit()
            return self.cursor.lastrowid
        except sqlite3.Error as e:
            print(f"插入数据失败：{e}")
            return None
    
    def query(self, table_name: str, 
              columns: List[str] = None,
              where: Dict[str, Any] = None) -> List[Dict]:
        """
        查询数据
        
        Args:
            table_name: 表名
            columns: 要查询的列，默认查询所有列
            where: 查询条件，{列名：值}
            
        Returns:
            查询结果列表
        """
        if columns is None:
            columns = ['*']
        
        sql = f'SELECT {", ".join(columns)} FROM {table_name}'
        
        if where:
            conditions = ' AND '.join([f'{key} = ?' for key in where.keys()])
            sql += f' WHERE {conditions}'
            self.cursor.execute(sql, list(where.values()))
        else:
            self.cursor.execute(sql)
        
        rows = self.cursor.fetchall()
        return [dict(row) for row in rows]
    
    def update(self, table_name: str, 
               data: Dict[str, Any],
               where: Dict[str, Any]) -> int:
        """
        更新数据
        
        Args:
            table_name: 表名
            data: 要更新的数据
            where: 更新条件
            
        Returns:
            受影响的行数
        """
        set_clause = ', '.join([f'{key} = ?' for key in data.keys()])
        where_clause = ' AND '.join([f'{key} = ?' for key in where.keys()])
        
        sql = f'UPDATE {table_name} SET {set_clause} WHERE {where_clause}'
        params = list(data.values()) + list(where.values())
        
        try:
            self.cursor.execute(sql, params)
            self.conn.commit()
            return self.cursor.rowcount
        except sqlite3.Error as e:
            print(f"更新数据失败：{e}")
            return 0
    
    def delete(self, table_name: str, where: Dict[str, Any]) -> int:
        """
        删除数据
        
        Args:
            table_name: 表名
            where: 删除条件
            
        Returns:
            受影响的行数
        """
        where_clause = ' AND '.join([f'{key} = ?' for key in where.keys()])
        sql = f'DELETE FROM {table_name} WHERE {where_clause}'
        
        try:
            self.cursor.execute(sql, list(where.values()))
            self.conn.commit()
            return self.cursor.rowcount
        except sqlite3.Error as e:
            print(f"删除数据失败：{e}")
            return 0
    
    def close(self):
        """关闭数据库连接"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
