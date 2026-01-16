
import mysql.connector
import os

# Local connection details (default XAMPP/MySQL)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Empty for standard XAMPP, change if needed
    'database': 'finwise_db'
}

def init_db():
    print("Connecting to local MySQL...")
    try:
        # 1. Connect without Database first (to create it)
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'], 
            user=DB_CONFIG['user'], 
            password=DB_CONFIG['password']
        )
        cursor = conn.cursor()
        
        # Read the SQL file
        with open('finwise_init.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()

        print("Executing finwise_init.sql...")
        
        # Execute commands one by one
        # Note: mysql-connector python executes one statement at a time usually
        # But we can split by semicolon.
        # However, improved approach: use multi=True
        
        results = cursor.execute(sql_script, multi=True)
        
        for res in results:
            print(f"Executed: {res}")
            
        conn.commit()
        print("\n✅ SUCCESS: Local Database (finwise_db) has been synced!")
        print("Required tables (transactions, budgets, bills) should now exist.")
        
    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    init_db()
