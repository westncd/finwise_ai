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

print("Applying Schema Update: Adding is_locked to budgets...")
try:
    # Check if column exists
    cursor.execute("SHOW COLUMNS FROM budgets LIKE 'is_locked'")
    result = cursor.fetchone()
    if not result:
        cursor.execute("ALTER TABLE budgets ADD COLUMN is_locked BOOLEAN DEFAULT FALSE")
        conn.commit()
        print("SUCCESS: Added 'is_locked' column to 'budgets' table.")
    else:
        print("INFO: 'is_locked' column already exists.")
        
except mysql.connector.Error as err:
    print(f"ERROR: {err}")
finally:
    conn.close()
