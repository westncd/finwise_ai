# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta

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
    # GET: List transactions
    if request.method == 'GET':
        # Get query parameters
        limit = request.args.get('limit', default=50, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        search = request.args.get('search')
        
        query = "SELECT * FROM transactions WHERE 1=1"
        params = []
        
        if start_date:
            query += " AND date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND date <= %s"
            params.append(end_date)
        if search:
            query += " AND (description LIKE %s OR category LIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
            
        query += " ORDER BY date DESC LIMIT %s"
        params.append(limit)

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, tuple(params))
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

@app.route('/api/bills', methods=['GET', 'POST'])
def bills_handler():
    # GET: List bills
    if request.method == 'GET':
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

    # POST: Create bill
    if request.method == 'POST':
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO bills (name, amount, due_date, status, is_recurring) 
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data.get('name'),
            data.get('amount'),
            data.get('dueDate'),
            data.get('status', 'Chờ thanh toán'),
            data.get('isRecurring', False)
        ))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Bill created"})

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
    
    # 1. High Value Transactions (> 10,000,000 VND) in last 7 days
    cursor.execute("""
        SELECT * FROM transactions 
        WHERE amount > 10000000 
        AND date >= NOW() - INTERVAL 7 DAY
    """)
    high_value = cursor.fetchall()

    anomalies = []
    
    for t in high_value:
        anomalies.append({
            "id": t['id'],
            "type": "HIGH_VALUE",
            "message": f"🚨 GIAO DỊCH LỚN: {t['amount']:,.0f} VND",
            "transaction": t
        })

    # 2. Potential Duplicates (Same amount, same description, same day)
    # Fetch recent transactions to check in Python (easier than complex SQL for IDs)
    cursor.execute("SELECT * FROM transactions WHERE date >= NOW() - INTERVAL 7 DAY")
    recent_txs = cursor.fetchall()
    
    seen = {}
    for t in recent_txs:
        # Create a signature: date_str + amount + description
        date_str = str(t['date']).split(' ')[0] # YYYY-MM-DD
        key = f"{date_str}_{t['amount']}_{t['description']}"
        
        if key in seen:
            # Found a duplicate! Add both the current and the previous one if not added
            prev_t = seen[key]
            
            # Add current
            anomalies.append({
                "id": t['id'],
                "type": "DUPLICATE",
                "message": f"⚠️ NGHI VẤN TRÙNG LẶP: Giao dịch giống hệt nhau ({t['amount']:,.0f} VND)",
                "transaction": t
            })
            
            # We might want to mark the previous one too, but for simplicity let's just mark the new ones found
        else:
            seen[key] = t
            
    conn.close()
    return jsonify({"status": "success", "anomalies": anomalies})

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """
    Project spending for the next month based on average of last 3 months.
    Simple Moving Average (SMA) implementation.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get last 3 months of data
    three_months_ago = (datetime.now() - relativedelta(months=3)).strftime('%Y-%m-%d')
    
    cursor.execute("""
        SELECT category, DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total
        FROM transactions
        WHERE date >= %s AND type = 'expense'
        GROUP BY category, month
    """, (three_months_ago,))
    
    history = cursor.fetchall()
    
    # Calculate average by category
    category_totals = {}
    category_counts = {}
    
    for row in history:
        cat = row['category']
        if cat not in category_totals:
            category_totals[cat] = 0
            category_counts[cat] = 0
        category_totals[cat] += float(row['total'])
        category_counts[cat] += 1
        
    predictions = []
    for cat, total in category_totals.items():
        avg_spending = total / max(category_counts[cat], 1) # Avoid div by zero, though unlikely if count is 0 total is 0
        
        predictions.append({
            "category": cat,
            "predicted_amount": int(avg_spending),
            "based_on_months": category_counts[cat]
        })
        
    conn.close()
    return jsonify({"status": "success", "forecast": predictions})

@app.route('/api/risk-assessment', methods=['GET'])
def risk_assessment():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    risks = []
    
    # 1. Check Budget Overruns (Current Spending vs Limit)
    cursor.execute("SELECT * FROM budgets")
    budgets = cursor.fetchall()
    
    current_day = datetime.now().day
    days_in_month = (datetime.now() + relativedelta(months=1, day=1) - relativedelta(days=1)).day
    month_progress = current_day / days_in_month
    
    for b in budgets:
        limit = float(b['limit_amount'])
        spent = float(b['spent'])
        
        if limit > 0:
            usage = spent / limit
            
            # Risk: Spent > 80% early in the month (before 20th)
            if usage > 0.80 and current_day < 20:
                risks.append({
                    "type": "BUDGET_RISK",
                    "level": "HIGH",
                    "message": f"Ngân sách '{b['category']}' sắp cạn ({int(usage*100)}%) khi mới đầu tháng.",
                    "details": {"category": b['category'], "spent": spent, "limit": limit}
                })
            # Risk: Already over budget
            elif usage > 1.0:
                 risks.append({
                    "type": "BUDGET_OVERFLOW",
                    "level": "CRITICAL",
                    "message": f"Đã vượt ngân sách '{b['category']}' ({int(spent - limit):,.0f} VND).",
                    "details": {"category": b['category'], "spent": spent, "limit": limit}
                })

    # 2. Check Unpaid Bills
    cursor.execute("SELECT * FROM bills WHERE status = 'Chờ thanh toán' OR status = 'Quá hạn'")
    unpaid_bills = cursor.fetchall()
    
    total_bill_debt = sum(float(bill['amount']) for bill in unpaid_bills)
    
    if total_bill_debt > 0:
        risks.append({
             "type": "BILL_PRESSURE",
             "level": "MEDIUM" if total_bill_debt < 2000000 else "HIGH",
             "message": f"Tổng nợ hóa đơn cần thanh toán: {int(total_bill_debt):,.0f} VND",
             "details": {"bill_count": len(unpaid_bills), "total_amount": total_bill_debt}
        })

    conn.close()
    return jsonify({"status": "success", "risks": risks})

if __name__ == '__main__':
    app.run(debug=True, port=5000)