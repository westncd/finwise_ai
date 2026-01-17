
import { Transaction, Budget } from '../types';

// API Key được lấy từ environment, đây là Dify API Key của bạn
const DIFY_API_KEY = process.env.DIFY_API_KEY || '';
const DIFY_BASE_URL = 'https://api.dify.ai/v1';

/**
 * Hàm trợ giúp gọi Dify Chat API
 */
const callDify = async (query: string, inputs: any = {}) => {
  if (!DIFY_API_KEY) {
    console.error("DIFY_API_KEY is missing!");
    return { answer: "Lỗi: Chưa cấu hình API Key cho Dify." };
  }

  try {
    const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: inputs,
        query: query,
        user: 'finwise-local-user',
        response_mode: 'blocking'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Dify API Error');
    }

    return await response.json();
  } catch (error) {
    console.error("Dify Service Error:", error);
    throw error;
  }
};

/**
 * Trích xuất JSON từ phản hồi văn bản của Dify (đề phòng Dify trả về Markdown code block)
 */
const parseDifyJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    console.warn("Could not parse Dify response as JSON:", text);
    return null;
  }
};

export const getFinancialAdvice = async (transactions: Transaction[], budgets: Budget[]) => {
  const query = `Dữ liệu giao dịch: ${JSON.stringify(transactions.slice(0, 15))}. 
  Hạn mức ngân sách: ${JSON.stringify(budgets)}. 
  Hãy đưa ra 3 lời khuyên tài chính ngắn gọn bằng tiếng Việt.`;

  const data = await callDify(query);
  return data.answer;
};

export const detectAnomalies = async (transactions: Transaction[]) => {
  // Use Local Logic for fast demo
  try {
    const response = await fetch('http://localhost:5000/api/scan-anomalies');
    const data = await response.json();

    // Map backend response to frontend expected format: { id, reason }
    const anomalies = data.anomalies.map((a: any) => ({
      id: a.id,
      reason: a.message
    }));

    return { anomalies };
  } catch (error) {
    console.warn("Local Scan failed, returning empty:", error);
    return { anomalies: [] };
  }
};

export const getBudgetSuggestions = async (transactions: Transaction[], totalIncome: number) => {
  // Limit to last 50 transactions to save tokens
  const recentTransactions = transactions.slice(0, 50);
  // Add fallback if totalIncome is 0 to avoid AI hallucinating widely if data is missing, 
  // though we will likely calculate it before passing or use a default.
  const incomeStr = totalIncome > 0 ? `${(totalIncome / 1000).toLocaleString()}K VND` : "Chưa xác định";

  const query = `Tôi có tổng thu nhập hàng tháng là ${incomeStr}. 
  Dựa trên dữ liệu chi tiêu gần đây (tối đa 50 gd): ${JSON.stringify(recentTransactions.map(t => ({ c: t.category, a: t.amount, d: t.date })))}. 
  Hãy đề xuất hạn mức ngân sách hợp lý cho từng danh mục sao cho Tổng Hạn Mức < Thu Nhập (để dành tiết kiệm ít nhất 20%).
  Trả về JSON: {"suggestions": [{"category": "...", "suggestedLimit": 0, "reason": "..."}]}`;

  const data = await callDify(query);
  return parseDifyJson(data.answer) || { suggestions: [] };
};

export const forecastSpending = async (transactions: Transaction[]) => {
  // Limit to last 50 transactions to save tokens
  const recentTransactions = transactions.slice(0, 50);
  const query = `Dự báo chi tiêu 3 tháng tới từ dữ liệu (tối đa 50 gd): ${JSON.stringify(recentTransactions)}. 
  Trả về JSON: {"predictions": [{"month": "...", "projectedExpense": 0, "projectedBalance": 0}], "riskFactors": [], "recommendations": [], "forecastBalance": 0}`;

  const data = await callDify(query);
  return parseDifyJson(data.answer) || { predictions: [], riskFactors: [], recommendations: [], forecastBalance: 0 };
};

export const extractBillFromEmail = async (emailText: string) => {
  const query = `Trích xuất thông tin hóa đơn từ văn bản: "${emailText}". 
  Trả về JSON: {"name": "...", "amount": 0, "dueDate": "YYYY-MM-DD", "isRecurring": true}`;

  const data = await callDify(query);
  return parseDifyJson(data.answer);
};

export const sendChatMessage = async (query: string, inputs: any = {}, user: string = 'finwise-user') => {
  if (!DIFY_API_KEY) {
    throw new Error("DIFY_API_KEY chưa được cấu hình! Kiểm tra file .env.local");
  }

  try {
    const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: inputs,
        query: query,
        user: user,
        response_mode: 'blocking'
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Dify API Error: ${err.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};
