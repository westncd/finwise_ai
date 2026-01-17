import mysql.connector
import random
from datetime import datetime, timedelta
import os

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'finwise_db'),
        charset='utf8mb4',
        use_unicode=True
    )

def seed_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    categories = ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Hóa đơn', 'Khác']
    
    print("Seeding data for last 3 months...")
    
    # Generate 50 mock transactions over last 90 days
    for _ in range(50):
        days_ago = random.randint(1, 90)
        date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
        amount = random.randint(50, 500) * 1000 # 50k to 500k
        category = random.choice(categories)
        
        cursor.execute("""
            INSERT INTO transactions (date, amount, type, category, description, source)
            VALUES (%s, %s, 'expense', %s, 'Mock Transaction', 'Seed Script')
        """, (date, amount, category))
        
    conn.commit()
    conn.close()
    print("✅ Data seeded successfully!")

if __name__ == '__main__':
    seed_data()
