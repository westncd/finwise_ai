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

print("Executing SQL UPDATE for Budgets...")
try:
    # Reset spent to 0 first
    cursor.execute("UPDATE budgets SET spent = 0")
    
    # The SQL requested by user:
    # "nếu category trong transaction và type là expense thì cộng cái amount đấy vào cột spent của budget"
    update_query = """
    UPDATE budgets b
    INNER JOIN (
        SELECT category, SUM(amount) as total_spent
        FROM transactions
        WHERE type = 'expense'
        GROUP BY category
    ) t ON b.category = t.category
    SET b.spent = t.total_spent
    """
    
    cursor.execute(update_query)
    conn.commit()
    print(f"SUCCESS: Updated budgets table. Rows matched: {cursor.rowcount}")
    
    # Check results
    cursor.execute("SELECT category, limit_amount, spent FROM budgets")
    rows = cursor.fetchall()
    print("\n--- Current Budgets Data ---")
    for r in rows:
        print(f"Cat: {r[0]} | Limit: {r[1]} | Spent: {r[2]}")
        
except mysql.connector.Error as err:
    print(f"ERROR: {err}")
finally:
    conn.close()
