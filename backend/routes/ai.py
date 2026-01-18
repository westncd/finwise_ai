import os
import requests
import mysql.connector
from flask import Blueprint, request, jsonify
from datetime import datetime

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    return obj
# =====================================
# 1. Blueprint PHẢI khai báo trước
# =====================================
ai_bp = Blueprint("ai", __name__)

# =====================================
# 2. ENV
# =====================================
DIFY_BASE_URL = os.getenv("DIFY_BASE_URL", "http://localhost/v1").rstrip("/")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "")

# =====================================
# 3. DB connection
# =====================================
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "finwise_db"),
        charset="utf8mb4",
        use_unicode=True,
    )

# =====================================
# 4. Call Dify
# =====================================
def call_dify(query: str, inputs: dict, user: str):
    if not DIFY_API_KEY:
        raise RuntimeError("Missing DIFY_API_KEY")

    url = f"{DIFY_BASE_URL}/chat-messages"
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": inputs,
        "query": query,
        "user": user,
        "response_mode": "blocking",
    }

    r = requests.post(url, json=payload, headers=headers, timeout=60)
    if r.status_code >= 400:
        try:
            err = r.json()
        except Exception:
            err = {"message": r.text}
        raise RuntimeError(f"Dify error {r.status_code}: {err.get('message', err)}")

    return r.json()

# =====================================
# 5. API: advisor (lấy DB)
# =====================================
@ai_bp.post("/advisor")
def advisor_from_db():
    body = request.get_json(force=True) or {}
    user_id = str(body.get("user_id", "u1"))
    question = body.get(
        "question",
        "Goi y toi uu chi tieu thang nay. Tra loi chuyen nghiep, khong emoji."
    )

    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT * FROM transactions ORDER BY date DESC LIMIT 30")
        transactions = cur.fetchall()
        for t in transactions:
            for k, v in t.items():
                t[k] = serialize_datetime(v)
            if "amount" in t and t["amount"] is not None:
                t["amount"] = int(t["amount"])


        cur.execute(
            "SELECT id, category, limit_amount AS `limit`, spent, updated_at FROM budgets"
        )
        budgets = cur.fetchall()
        for b in budgets:
            for k, v in b.items():
                b[k] = serialize_datetime(v)
            if "limit" in b and b["limit"] is not None:
                b["limit"] = int(b["limit"])
            if "spent" in b and b["spent"] is not None:
                b["spent"] = int(b["spent"])


        conn.close()

        result = call_dify(
            query=question,
            inputs={"transactions": transactions, "budgets": budgets},
            user=user_id,
        )

        return jsonify({"answer": result.get("answer", ""), "raw": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =====================================
# 6. API: advice (frontend gửi data)
# =====================================
@ai_bp.post("/advice")
def ai_advice():
    body = request.get_json(force=True) or {}

    transactions = (body.get("transactions") or [])[:30]
    budgets = body.get("budgets") or []

    try:
        result = call_dify(
            query=body.get("question", "Goi y toi uu chi tieu"),
            inputs={"transactions": transactions, "budgets": budgets},
            user=str(body.get("user_id", "u1")),
        )
        return jsonify({"answer": result.get("answer", ""), "raw": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
