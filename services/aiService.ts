
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
  const query = `Phân tích các giao dịch sau và phát hiện bất thường: ${JSON.stringify(transactions)}. 
  Trả về JSON chuẩn format: {"anomalies": [{"id": "...", "reason": "..."}]}`;
  
  const data = await callDify(query);
  return parseDifyJson(data.answer) || { anomalies: [] };
};

export const getBudgetSuggestions = async (transactions: Transaction[]) => {
  const query = `Dựa trên dữ liệu 3 tháng gần nhất: ${JSON.stringify(transactions)}, đề xuất hạn mức ngân sách mới. 
  Trả về JSON: {"suggestions": [{"category": "...", "suggestedLimit": 0, "reason": "..."}]}`;
  
  const data = await callDify(query);
  return parseDifyJson(data.answer) || { suggestions: [] };
};

export const forecastSpending = async (transactions: Transaction[]) => {
  const query = `Dự báo chi tiêu 3 tháng tới từ dữ liệu: ${JSON.stringify(transactions)}. 
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
