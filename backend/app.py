# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="finwise_db",
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

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM transactions ORDER BY date DESC")
    transactions = cursor.fetchall()
    conn.close()
    return jsonify(transactions)

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, category, limit_amount AS 'limit', spent, updated_at FROM budgets")
    budgets = cursor.fetchall()
    
    conn.close()
    return jsonify(budgets)

@app.route('/api/bills', methods=['GET'])
def get_bills():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bills")
    bills = cursor.fetchall()
    conn.close()
    return jsonify(bills)

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