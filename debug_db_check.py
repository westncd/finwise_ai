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
cursor = conn.cursor(dictionary=True)

print("--- BUDGETS ---")
cursor.execute("SELECT id, category, limit_amount, spent FROM budgets")
budgets = cursor.fetchall()
for b in budgets:
    print(f"ID: {b['id']}, Cat: '{b['category']}', Hex: {b['category'].encode('utf-8').hex()}")

print("\n--- TRANSACTIONS ---")
cursor.execute("SELECT id, date, amount, type, category FROM transactions LIMIT 10")
transactions = cursor.fetchall()
for t in transactions:
    print(f"ID: {t['id']}, Date: {t['date']}, Amount: {t['amount']}, Type: {t['type']}, Cat: '{t['category']}', Hex: {t['category'].encode('utf-8').hex()}")

print("\n--- CURRENT DATE ---")
cursor.execute("SELECT CURRENT_DATE(), YEAR(CURRENT_DATE()), MONTH(CURRENT_DATE())")
print(cursor.fetchone())

conn.close()
