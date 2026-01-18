import { Transaction, Budget } from "../types";

/**
 * Base URL:
 * - Khi chạy dev: Vite proxy sẽ forward /api -> http://localhost:5000
 * - Khi deploy: frontend + backend cùng domain thì vẫn dùng /api
 */
const API_BASE = "/api";

/**
 * Helper gọi Flask backend
 */
async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "API request failed");
  }
  return data;
}

/**
 * ========== CORE CHAT ==========
 * Chat tư vấn tài chính (dùng DB thật trong backend)
 */
export async function sendChatMessage(
  query: string,
  user: string = "u1"
): Promise<string> {
  const data = await postJSON<{ answer: string }>(
    `${API_BASE}/ai/advisor`,
    {
      user_id: user,
      question: query,
    }
  );

  return data.answer;
}

/**
 * ========== FINANCIAL ADVICE ==========
 * (giữ signature cũ để UI không phải sửa nhiều)
 */
export async function getFinancialAdvice(
  transactions: Transaction[],
  budgets: Budget[]
): Promise<string> {
  // Backend đã tự lấy DB rồi → frontend không cần gửi transactions/budgets
  const data = await postJSON<{ answer: string }>(
    `${API_BASE}/ai/advisor`,
    {
      user_id: "u1",
      question: "Goi y toi uu chi tieu dua tren du lieu hien tai. Khong emoji.",
    }
  );

  return data.answer;
}

/**
 * ========== ANOMALY DETECTION ==========
 * Backend có thể mở rộng endpoint riêng sau.
 * Hiện tại dùng advisor với câu hỏi chuyên biệt.
 */
export async function detectAnomalies(
  transactions: Transaction[]
): Promise<{ anomalies: any[] }> {
  const data = await postJSON<{ answer: string }>(
    `${API_BASE}/ai/advisor`,
    {
      user_id: "u1",
      question:
        "Phan tich cac giao dich gan day va phat hien bat thuong. Tra loi ro rang, khong emoji.",
    }
  );

  return { anomalies: [{ description: data.answer }] };
}

/**
 * ========== BUDGET SUGGESTIONS ==========
 */
export async function getBudgetSuggestions(
  transactions: Transaction[]
): Promise<{ suggestions: any[] }> {
  const data = await postJSON<{ answer: string }>(
    `${API_BASE}/ai/advisor`,
    {
      user_id: "u1",
      question:
        "De xuat dieu chinh han muc ngan sach theo xu huong chi tieu. Khong emoji.",
    }
  );

  return { suggestions: [{ summary: data.answer }] };
}

/**
 * ========== SPENDING FORECAST ==========
 */
export async function forecastSpending(
  transactions: Transaction[]
): Promise<{
  forecastBalance: number;
  predictions: any[];
  recommendations: string[];
}> {
  const data = await postJSON<{ answer: string }>(
    `${API_BASE}/ai/advisor`,
    {
      user_id: "u1",
      question:
        "Du bao chi tieu 3 thang toi va dua ra canh bao neu co rui ro. Khong emoji.",
    }
  );

  return {
    forecastBalance: 0,
    predictions: [],
    recommendations: [data.answer],
  };
}

/**
 * ========== BILL EXTRACTION ==========
 * (backend có thể làm endpoint riêng sau)
 */
export async function extractBillFromEmail(
  emailText: string
): Promise<any> {
  const data = await postJSON<{ answer: string }>(
    `${API_BASE}/ai/advisor`,
    {
      user_id: "u1",
      question: `Trich xuat thong tin hoa don tu email sau: "${emailText}". Tra loi ro rang, khong emoji.`,
    }
  );

  return { raw: data.answer };
}
