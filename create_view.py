import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="finwise_db",
        charset='utf8mb4',
        use_unicode=True
    )

conn = get_db_connection()
cursor = conn.cursor()

print("Creating VIEW 'budget_overview'...")
try:
    cursor.execute("DROP VIEW IF EXISTS budget_overview")
    
    view_query = """
    CREATE VIEW budget_overview AS
    SELECT 
        b.id, 
        b.category, 
        b.limit_amount, 
        COALESCE(SUM(t.amount), 0) AS spent, 
        b.updated_at 
    FROM budgets b
    LEFT JOIN transactions t 
        ON b.category = t.category 
        AND t.type = 'expense'
    GROUP BY b.id, b.category, b.limit_amount, b.updated_at
    """
    cursor.execute(view_query)
    conn.commit()
    print("SUCCESS: View 'budget_overview' created.")
    
    # Test the view
    cursor.execute("SELECT * FROM budget_overview")
    rows = cursor.fetchall()
    print(f"Test Select from View: Found {len(rows)} rows.")
    for r in rows:
        print(r)
        
except mysql.connector.Error as err:
    print(f"ERROR: {err}")
finally:
    conn.close()
