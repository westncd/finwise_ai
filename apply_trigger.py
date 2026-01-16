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

print("Applying Database Trigger...")
try:
    cursor.execute("DROP TRIGGER IF EXISTS update_budget_spent")
    
    # Create the trigger
    trigger_sql = """
    CREATE TRIGGER update_budget_spent AFTER INSERT ON transactions
    FOR EACH ROW
    BEGIN
        IF NEW.type = 'expense' THEN
            UPDATE budgets 
            SET spent = spent + NEW.amount 
            WHERE category = NEW.category;
        END IF;
    END
    """
    cursor.execute(trigger_sql)
    conn.commit()
    print("SUCCESS: Trigger 'update_budget_spent' created.")
    
except mysql.connector.Error as err:
    print(f"ERROR: {err}")
finally:
    conn.close()
