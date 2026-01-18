# -*- coding: utf-8 -*-
import os
from datetime import datetime

import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS

# Optional: load backend/.env if you use it
# pip install python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

app = Flask(__name__)
CORS(app)

# Register AI blueprint
from routes.ai import ai_bp
app.register_blueprint(ai_bp, url_prefix="/api/ai")


def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "finwise_db"),
        charset="utf8mb4",
        use_unicode=True,
    )


def parse_iso_date(date_str):
    try:
        if not date_str:
            return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        val = date_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(val)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        print(f"Date parse error: {e}")
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@app.route("/api/webhook", methods=["GET", "POST"])
def webhook():
    if request.method == "GET":
        return jsonify({"status": "active", "message": "Webhook is running. Send POST requests to this endpoint."})

    data = request.get_json(silent=True) or {}
    print(f"Received webhook data: {data}")

    if data:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO transactions (date, amount, type, category, description, source)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                parse_iso_date(data.get("timestamp")),
                data.get("amount", 0),
                data.get("type", "expense"),
                data.get("category", "Khác"),
                data.get("description", "From n8n"),
                data.get("source", "Email"),
            ),
        )

        conn.commit()
        conn.close()

        print(f"Saved transaction: amount={data.get('amount')} description={data.get('description')}")

    return jsonify({"status": "success"})


@app.route("/api/transactions", methods=["GET", "POST"])
def transactions_handler():
    if request.method == "GET":
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM transactions ORDER BY date DESC")
        transactions = cursor.fetchall()

        for t in transactions:
            if "amount" in t and t["amount"] is not None:
                t["amount"] = int(t["amount"])

        conn.close()
        return jsonify(transactions)

    data = request.get_json(silent=True) or {}
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO transactions (date, amount, type, category, description, source)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            data.get("date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            data.get("amount", 0),
            data.get("type", "expense"),
            data.get("category", "Khác"),
            data.get("description", "Manual Entry"),
            data.get("source", "Thủ công"),
        ),
    )

    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Transaction created"})


@app.route("/api/budgets", methods=["GET"])
def get_budgets():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, category, limit_amount AS `limit`, spent, updated_at FROM budgets")
    budgets = cursor.fetchall()

    for b in budgets:
        if "limit" in b and b["limit"] is not None:
            b["limit"] = int(b["limit"])
        if "spent" in b and b["spent"] is not None:
            b["spent"] = int(b["spent"])

    conn.close()
    return jsonify(budgets)


@app.route("/api/budgets", methods=["POST"])
def create_budget():
    data = request.get_json(silent=True) or {}
    category = data.get("category")
    limit_amount = data.get("limit")

    if not category or limit_amount is None:
        return jsonify({"status": "error", "message": "Category and limit are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO budgets (category, limit_amount, spent) VALUES (%s, %s, 0)",
            (category, limit_amount),
        )
        conn.commit()
        return jsonify({"status": "success", "message": "Budget created"})
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": str(err)}), 500
    finally:
        conn.close()


@app.route("/api/budgets/<int:budget_id>", methods=["PUT"])
def update_budget(budget_id):
    data = request.get_json(silent=True) or {}
    new_limit = data.get("limit")

    if new_limit is None:
        return jsonify({"status": "error", "message": "Limit is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE budgets SET limit_amount = %s WHERE id = %s", (new_limit, budget_id))
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "Budget limit updated"})


@app.route("/api/bills", methods=["GET"])
def get_bills():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bills")
    bills = cursor.fetchall()

    for bill in bills:
        if "amount" in bill and bill["amount"] is not None:
            bill["amount"] = int(bill["amount"])

    conn.close()
    return jsonify(bills)


@app.route("/api/bills/<int:bill_id>/pay", methods=["POST"])
def pay_bill(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM bills WHERE id = %s", (bill_id,))
    bill = cursor.fetchone()

    if not bill:
        conn.close()
        return jsonify({"status": "error", "message": "Bill not found"}), 404

    if bill.get("status") == "Đã thanh toán":
        conn.close()
        return jsonify({"status": "error", "message": "Bill already paid"}), 400

    try:
        cursor.execute("UPDATE bills SET status = 'Đã thanh toán' WHERE id = %s", (bill_id,))
        cursor.execute(
            """
            INSERT INTO transactions (date, amount, type, category, description, source)
            VALUES (NOW(), %s, 'expense', 'Hóa đơn', %s, 'Ngân hàng')
            """,
            (bill["amount"], f"Thanh toán: {bill['name']}"),
        )

        conn.commit()
        print(f"Success: Bill {bill_id} paid.")
        return jsonify({"status": "success", "message": "Bill paid and transaction recorded"})
    except Exception as e:
        conn.rollback()
        print(f"Error paying bill {bill_id}: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/scan-anomalies", methods=["GET"])
def scan_anomalies():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT * FROM transactions
        WHERE amount > 10000000
        AND date >= NOW() - INTERVAL 1 DAY
        """
    )
    high_value = cursor.fetchall()

    cursor.execute(
        """
        SELECT amount, category, DATE(date) as day, COUNT(*) as count
        FROM transactions
        WHERE date >= NOW() - INTERVAL 1 DAY
        GROUP BY amount, category, DATE(date)
        HAVING count > 1
        """
    )
    duplicates = cursor.fetchall()

    conn.close()

    anomalies = []

    for t in high_value:
        anomalies.append({
            "type": "HIGH_VALUE",
            "message": f"Giao dịch giá trị lớn: {t.get('description')} - {float(t.get('amount', 0)):,.0f} VND",
            "transaction": t
        })

    for d in duplicates:
        anomalies.append({
            "type": "DUPLICATE",
            "message": f"Nghi vấn trùng lặp: {d['count']} giao dịch {d['category']} cùng số tiền {float(d['amount']):,.0f} VND",
            "details": d
        })

    return jsonify({"status": "success", "anomalies": anomalies})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
