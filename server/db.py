import mysql.connector
from mysql.connector import pooling, Error
from config import DB_CONFIG

# Connection pool
connection_pool = pooling.MySQLConnectionPool(
    pool_name="employee_pool",
    pool_size=5,
    pool_reset_session=True,
    **DB_CONFIG
)

def get_connection():
    """Get a connection from the pool"""
    try:
        return connection_pool.get_connection()
    except Error as e:
        print(f"Error getting connection from pool: {e}")
        raise

def query_all(sql, params=None):
    """Execute SELECT queries and return all results"""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql, params or ())
            return cur.fetchall()
    except Error as e:
        print(f"Database query error: {e}")
        raise
    finally:
        if conn and conn.is_connected():
            conn.close()

def execute(sql, params=None):
    """Execute INSERT/UPDATE/DELETE queries"""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            conn.commit()
            return cur.lastrowid
    except Error as e:
        if conn:
            conn.rollback()
        print(f"Database execution error: {e}")
        raise
    finally:
        if conn and conn.is_connected():
            conn.close()
