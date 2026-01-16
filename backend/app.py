# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

import os

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'finwise_db'),
        charset='utf8mb4',
        use_unicode=True
    )

def parse_iso_date(date_str):
    try:
        if not date_str:
            return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        # Simple ISO parser handling Z
        val = date_str.replace('Z', '+00:00')
        dt = datetime.fromisoformat(val)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        print(f"Date parse error: {e}")
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

@app.route('/api/webhook', methods=['GET', 'POST'])
def webhook():
    if request.method == 'GET':
        return jsonify({"status": "active", "message": "Webhook is running. Send POST requests to this endpoint."})

    data = request.json
    print(f"Received webhook data: {data}")  # Debug log
    
    # Process incoming data from n8n
    if data:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert transaction
        cursor.execute("""
            INSERT INTO transactions (date, amount, type, category, description, source) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            parse_iso_date(data.get('timestamp')),
            data.get('amount', 0),
            data.get('type', 'expense'),
            data.get('category', 'Khác'),
            data.get('description', 'From n8n'),
            data.get('source', 'Email')
        ))
        
        conn.commit()
        conn.close()
        print(f"Saved transaction: {data.get('amount')} - {data.get('description')}")
    
    return jsonify({"status": "success"})

@app.route('/api/transactions', methods=['GET', 'POST'])
def transactions_handler():
    # GET: List transactions
    if request.method == 'GET':
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM transactions ORDER BY date DESC")
        transactions = cursor.fetchall()
        
        # Convert Decimal to int/float for JSON serialization
        for t in transactions:
            if 'amount' in t and t['amount'] is not None:
                t['amount'] = int(t['amount'])
                
        conn.close()
        return jsonify(transactions)

    # POST: Create transaction
    if request.method == 'POST':
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO transactions (date, amount, type, category, description, source) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data.get('date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            data.get('amount', 0),
            data.get('type', 'expense'),
            data.get('category', 'Khác'),
            data.get('description', 'Manual Entry'),
            data.get('source', 'Thủ công')
        ))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Transaction created"})

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, category, limit_amount AS 'limit', spent, updated_at FROM budgets")
    budgets = cursor.fetchall()
    
    # Convert Decimal to int
    for b in budgets:
        if 'limit' in b:
            b['limit'] = int(b['limit'])
        if 'spent' in b:
            b['spent'] = int(b['spent'])
    
    conn.close()
    return jsonify(budgets)

@app.route('/api/budgets', methods=['POST'])
def create_budget():
    data = request.json
    category = data.get('category')
    limit = data.get('limit')
    
    if not category or not limit:
        return jsonify({"status": "error", "message": "Category and limit are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO budgets (category, limit_amount, spent) VALUES (%s, %s, 0)", (category, limit))
        conn.commit()
        return jsonify({"status": "success", "message": "Budget created"})
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": str(err)}), 500
    finally:
        conn.close()

@app.route('/api/budgets/<int:budget_id>', methods=['PUT'])
def update_budget(budget_id):
    data = request.json
    new_limit = data.get('limit')
    
    if new_limit is None:
        return jsonify({"status": "error", "message": "Limit is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE budgets SET limit_amount = %s WHERE id = %s", (new_limit, budget_id))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success", "message": "Budget limit updated"})

@app.route('/api/bills', methods=['GET'])
def get_bills():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bills")
    bills = cursor.fetchall()
    
    # Convert Decimal to int
    for bill in bills:
        if 'amount' in bill:
            bill['amount'] = int(bill['amount'])
            
    conn.close()
    return jsonify(bills)

@app.route('/api/bills/<int:bill_id>/pay', methods=['POST'])
def pay_bill(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # 1. Get Bill Details
    cursor.execute("SELECT * FROM bills WHERE id = %s", (bill_id,))
    bill = cursor.fetchone()
    
    if not bill:
        conn.close()
        return jsonify({"status": "error", "message": "Bill not found"}), 404
        
    if bill['status'] == 'Đã thanh toán':
        conn.close()
        return jsonify({"status": "error", "message": "Bill already paid"}), 400

    # 2. Update Bill Status
    try:
        cursor.execute("UPDATE bills SET status = 'Đã thanh toán' WHERE id = %s", (bill_id,))
        
        # 3. Create Transaction
        cursor.execute("""
            INSERT INTO transactions (date, amount, type, category, description, source) 
            VALUES (NOW(), %s, 'expense', 'Hóa đơn', %s, 'Ngân hàng')
        """, (bill['amount'], f"Thanh toán: {bill['name']}"))
        
        conn.commit()
        print(f"✅ Success: Bill {bill_id} paid.")
        return jsonify({"status": "success", "message": "Bill paid and transaction recorded"})
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error paying bill {bill_id}: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/scan-anomalies', methods=['GET'])
def scan_anomalies():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # 1. High Value Transactions (> 10,000,000 VND) in last 24 hours
    cursor.execute("""
        SELECT * FROM transactions 
        WHERE amount > 10000000 
        AND date >= NOW() - INTERVAL 1 DAY
    """)
    high_value = cursor.fetchall()

    # 2. Potential Duplicates (Same amount, same category, same day)
    cursor.execute("""
        SELECT amount, category, date, COUNT(*) as count 
        FROM transactions 
        WHERE date >= NOW() - INTERVAL 1 DAY
        GROUP BY amount, category, date
        HAVING count > 1
    """)
    duplicates = cursor.fetchall()
    
    conn.close()
    
    anomalies = []
    
    for t in high_value:
        anomalies.append({
            "type": "HIGH_VALUE",
            "message": f"🚨 GIAO DỊCH LỚN: {t['description']} - {t['amount']:,.0f} VND",
            "transaction": t
        })
        
    for d in duplicates:
        anomalies.append({
            "type": "DUPLICATE",
            "message": f"⚠️ NGHI VẤN TRÙNG LẶP: {d['count']} giao dịch {d['category']} cùng số tiền {d['amount']:,.0f} VND",
            "details": d
        })
        
    return jsonify({"status": "success", "anomalies": anomalies})

if __name__ == '__main__':
    app.run(debug=True, port=5000)