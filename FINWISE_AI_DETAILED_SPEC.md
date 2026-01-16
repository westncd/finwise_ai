# 🚀 FinWise AI - Đề Cương Chi Tiết
**Hệ Sinh Thái Quản Lý Tài Chính Cá Nhân với AI & Automation**

---

## 📋 MỤC LỤC

1. [Tổng Quan Hệ Thống](#-tổng-quan-hệ-thống)
2. [Kiến Trúc Tổng Thể](#-kiến-trúc-tổng-thể)
3. [Chi Tiết Các Component](#-chi-tiết-các-component)
   - [n8n - Workflow Automation](#n8n---workflow-automation)
   - [Dify - AI Financial Advisor](#dify---ai-financial-advisor)
   - [Superset - Advanced BI Analytics](#superset---advanced-bi-analytics)
   - [Metabase - Business Intelligence](#metabase---business-intelligence)
4. [Luồng Dữ Liệu](#-luồng-dữ-liệu)
5. [Hướng Dẫn Triển Khai](#-hướng-dẫn-triển-khai)
6. [Tính Năng Chi Tiết](#-tính-năng-chi-tiết)
7. [API Documentation](#-api-documentation)
8. [Bảo Mật & An Toàn](#-bảo-mật--an-toàn)

---

## 🎯 TỔNG QUAN HỆ THỐNG

FinWise AI là một hệ sinh thái quản lý tài chính cá nhân toàn diện, kết hợp sức mạnh của:

- **🤖 AI (Dify)**: Tư vấn tài chính thông minh, phân tích pattern chi tiêu
- **⚡ Automation (n8n)**: Tự động thu thập dữ liệu từ email, ngân hàng
- **📊 BI Tools (Superset/Metabase)**: Phân tích dữ liệu chuyên sâu, báo cáo
- **💾 Local Database (MySQL)**: Lưu trữ an toàn 100% trên máy tính cá nhân

### 🎯 Mục Tiêu
- **Tự động hóa hoàn toàn** việc theo dõi dòng tiền
- **AI phân tích** pattern chi tiêu và đưa ra lời khuyên
- **Visualization chuyên nghiệp** với BI tools
- **Bảo mật tối đa** - tất cả data lưu local

---

## 🏗️ KIẾN TRÚC TỔNG THỂ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Email/MoMo    │───▶│      n8n        │───▶│     Flask       │
│   Bank APIs     │    │  Workflow Hub   │    │   Backend       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │◀───│     MySQL       │───▶│   Dify AI       │
│   Dashboard     │    │   Database      │    │   Advisor       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Metabase      │    │   Superset      │    │   Data Export   │
│   BI Dashboard  │    │   Advanced BI   │    │   & Reports     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🏛️ Architecture Layers

1. **Data Ingestion Layer**: n8n thu thập data từ email/banking APIs
2. **Processing Layer**: Flask xử lý, chuẩn hóa và lưu trữ
3. **AI Layer**: Dify phân tích data và đưa ra insights
4. **Visualization Layer**: Metabase/Superset tạo dashboard BI
5. **User Interface Layer**: React dashboard cho user interaction

---

## 🔧 CHI TIẾT CÁC COMPONENT

### n8n - Workflow Automation

#### 🎯 Chức năng chính:
- **Email Processing**: Đọc và phân tích email từ Gmail
- **Data Extraction**: Trích xuất thông tin giao dịch từ nội dung email
- **API Integration**: Kết nối với banking APIs (MoMo, VCB, ZaloPay)
- **Webhook Delivery**: Gửi data đã xử lý về Flask backend

#### ⚙️ Workflow Nodes:

**1. IMAP Email Reader**
```json
{
  "host": "imap.gmail.com",
  "port": 993,
  "ssl": true,
  "username": "user@gmail.com",
  "password": "app_password_16_chars",
  "mailbox": "INBOX",
  "action": "markAsRead"
}
```

**2. Smart Filter**
```javascript
// Filter financial emails
const isFinancial = (subject, body) => {
  const keywords = ['momo', 'vcb', 'zalopay', 'thanh toán', 'giao dịch', 'hoá đơn'];
  const text = (subject + body).toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
};

return isFinancial($node["IMAP Email"].json.subject, $node["IMAP Email"].json.body);
```

**3. AI Data Extractor (Function Node)**
```javascript
// Extract transaction details using regex + AI
const extractTransaction = (emailBody) => {
  // Amount patterns (VNĐ, k, đ)
  const amountRegex = /(\d{1,3}(?:\.\d{3})*|\d+)[\s]*(?:vnđ|vnd|k|đ)/gi;
  const amounts = emailBody.match(amountRegex) || [];
  const cleanAmounts = amounts.map(a => parseInt(a.replace(/[^\d]/g, '')));

  // Date patterns
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
  const dates = emailBody.match(dateRegex) || [];

  // Merchant/Category detection
  let category = 'Khác';
  let merchant = 'Unknown';

  if (emailBody.includes('highlands') || emailBody.includes('coffee')) {
    category = 'Ăn uống';
    merchant = 'Highlands Coffee';
  }

  return {
    amount: cleanAmounts[0] || 0,
    date: dates[0] || new Date().toISOString(),
    category: category,
    merchant: merchant,
    source: 'Email',
    raw_text: emailBody
  };
};

return extractTransaction($node["IMAP Email"].json.body);
```

**4. HTTP Request to Flask**
```json
{
  "method": "POST",
  "url": "http://localhost:5000/api/webhook",
  "body": {
    "amount": "{{$node[\"Function\"].json.amount}}",
    "category": "{{$node[\"Function\"].json.category}}",
    "description": "{{$node[\"Function\"].json.merchant}} - {{$node[\"Function\"].json.raw_text.substring(0,100)}}",
    "source": "{{$node[\"Function\"].json.source}}",
    "date": "{{$node[\"Function\"].json.date}}"
  }
}
```

#### 🚀 Tính năng nâng cao n8n:
- **Schedule Trigger**: Chạy workflow mỗi 5 phút
- **Error Handling**: Retry failed requests
- **Data Validation**: Validate extracted data trước khi gửi
- **Duplicate Prevention**: Check for duplicate transactions
- **Notification**: Slack/Telegram alerts cho transactions lớn

---

### Dify - AI Financial Advisor

#### 🎯 Chức năng chính:
- **Financial Analysis**: Phân tích pattern chi tiêu
- **Anomaly Detection**: Phát hiện giao dịch bất thường
- **Budget Optimization**: Đề xuất hạn mức ngân sách
- **Spending Forecast**: Dự báo chi tiêu tháng tới
- **Bill Extraction**: Trích xuất thông tin hóa đơn từ email

#### 🤖 AI Models & Capabilities:

**1. Chatbot Interface**
- Natural language conversation về tài chính
- Context-aware responses với transaction history
- Multi-turn conversations

**2. Structured Data Analysis**
```javascript
// Example Dify workflow for anomaly detection
{
  "inputs": {
    "transactions": transactions.slice(-50), // Last 50 transactions
    "budgets": budgets,
    "timeframe": "3_months"
  },
  "query": "Phân tích bất thường trong chi tiêu và đưa ra cảnh báo",
  "response_mode": "blocking"
}
```

**3. Predictive Analytics**
- **Time Series Forecasting**: Dự báo chi tiêu dựa trên historical data
- **Category Analysis**: Phân tích trend từng hạng mục
- **Risk Assessment**: Đánh giá rủi ro tài chính

#### 📊 Dify Integration Points:

**Frontend Integration:**
```typescript
// services/aiService.ts
const callDify = async (query: string, inputs: any = {}) => {
  const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: inputs,
      query: query,
      user: 'finwise-user',
      response_mode: 'blocking'
    })
  });
  return await response.json();
};
```

**Available AI Functions:**
- `getFinancialAdvice()`: Tư vấn tài chính tổng quát
- `detectAnomalies()`: Phát hiện giao dịch bất thường
- `getBudgetSuggestions()`: Đề xuất ngân sách
- `forecastSpending()`: Dự báo chi tiêu
- `extractBillFromEmail()`: Trích xuất hóa đơn

---

### Superset - Advanced BI Analytics

#### 🎯 Chức năng chính:
- **Advanced Visualizations**: Charts, graphs, heatmaps
- **SQL Lab**: Custom queries và data exploration
- **Dashboard Builder**: Tạo dashboard tương tác
- **Data Export**: Export reports sang PDF/Excel
- **Real-time Updates**: Auto-refresh dashboards

#### 📈 Superset Dashboards:

**1. Financial Overview Dashboard**
- **KPI Cards**: Tổng thu chi, số dư, tỷ lệ tiết kiệm
- **Time Series Charts**: Trend chi tiêu theo thời gian
- **Category Breakdown**: Pie chart phân loại chi tiêu
- **Budget vs Actual**: Bar chart so sánh ngân sách

**2. Transaction Analysis Dashboard**
- **Transaction Volume**: Line chart số lượng giao dịch
- **Geographic Analysis**: Map visualization (nếu có location data)
- **Merchant Analysis**: Top merchants by spending
- **Payment Method Analysis**: Distribution by payment source

**3. Predictive Analytics Dashboard**
- **Forecast Charts**: Dự báo chi tiêu tương lai
- **Risk Indicators**: Warning flags cho overspending
- **Budget Alerts**: Visual alerts khi vượt ngân sách

#### 🔧 Superset Configuration:

**Database Connection:**
```yaml
# superset_config.py
SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/finwise_db'
SECRET_KEY = 'your-secret-key'
```

**Sample Charts:**
```sql
-- Top spending categories
SELECT category, SUM(amount) as total
FROM transactions
WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY category
ORDER BY total DESC;

-- Monthly spending trend
SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total
FROM transactions
GROUP BY month
ORDER BY month;
```

---

### Metabase - Business Intelligence

#### 🎯 Chức năng chính:
- **Self-service BI**: User-friendly query builder
- **Automated Insights**: AI-generated insights
- **Email Reports**: Scheduled report delivery
- **Embedded Analytics**: Integrate vào web apps
- **Data Sandboxing**: Row-level security

#### 📊 Metabase Features:

**1. Question Builder**
- **Simple Mode**: Drag-drop query building
- **Custom SQL**: Advanced SQL queries
- **Saved Questions**: Reusable query templates

**2. Dashboard Features**
- **Auto-refresh**: Real-time data updates
- **Parameters**: Dynamic filtering
- **Alerts**: Email notifications for KPIs
- **Sharing**: Public links và embedded dashboards

**3. Admin Features**
- **User Management**: Role-based access control
- **Data Modeling**: Custom metrics và segments
- **Caching**: Performance optimization

#### 📋 Sample Metabase Questions:

**Financial Health Score:**
```sql
SELECT
  user_id,
  (savings_rate * 0.3 + budget_adherence * 0.3 + expense_diversity * 0.4) as health_score
FROM (
  SELECT
    user_id,
    (savings / income) as savings_rate,
    (budget_spent / budget_limit) as budget_adherence,
    COUNT(DISTINCT category) / 10.0 as expense_diversity
  FROM financial_metrics
) metrics;
```

**Spending Anomalies:**
```sql
SELECT *
FROM transactions
WHERE amount > (
  SELECT AVG(amount) + 2 * STDDEV(amount)
  FROM transactions
  WHERE category = transactions.category
  AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
);
```

---

## 🔄 LUỒNG DỮ LIỆU

### 📥 Data Ingestion Flow:
```
Email/Bank API → n8n IMAP/API → Data Extraction → Validation → Flask Webhook → MySQL
```

### 🤖 AI Processing Flow:
```
MySQL Data → API Call → Dify AI → Analysis Results → Frontend Display → User Interaction
```

### 📊 BI Visualization Flow:
```
MySQL Data → Metabase/Superset → Dashboard Creation → User Queries → Reports/Charts
```

### 🔄 Complete Data Pipeline:
1. **Raw Data**: Email notifications, bank statements
2. **Ingestion**: n8n workflows collect and parse
3. **Storage**: Flask validates and stores in MySQL
4. **Processing**: Dify AI analyzes patterns and anomalies
5. **Visualization**: Metabase/Superset creates dashboards
6. **User Interaction**: React app displays insights and recommendations

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI

### 📋 Prerequisites:
- Node.js 18+
- Python 3.8+
- MySQL (XAMPP)
- Gmail account with 2FA

### ⚡ Quick Start:

**1. Database Setup:**
```bash
# Start XAMPP MySQL
# Create database
mysql -u root -p
CREATE DATABASE finwise_db;
# Import schema
mysql -u root -p finwise_db < database/init.sql
```

**2. Backend Setup:**
```bash
cd backend
pip install flask flask-cors mysql-connector-python requests
python app.py
```

**3. n8n Setup:**
```bash
npm install n8n -g
n8n start
# Import workflow from workflows/finwise-n8n-workflow.json
```

**4. Dify Setup:**
```bash
# Get API key from dify.ai
# Add to .env.local
DIFY_API_KEY=your_api_key_here
```

**5. BI Tools Setup:**
```bash
# Metabase
java -jar metabase.jar

# Superset
pip install apache-superset
superset db upgrade
superset init
superset run
```

**6. Frontend Setup:**
```bash
npm install
npm run dev
```

---

## 🎮 TÍNH NĂNG CHI TIẾT

### 💰 Core Financial Features:
- ✅ **Transaction Tracking**: Automatic import from emails
- ✅ **Budget Management**: Category-based budgeting
- ✅ **Bill Reminders**: Automated bill tracking
- ✅ **Spending Analytics**: Category and merchant analysis
- ✅ **Financial Forecasting**: AI-powered predictions

### 🤖 AI Features:
- ✅ **Smart Categorization**: Auto-categorize transactions
- ✅ **Anomaly Detection**: Flag unusual spending
- ✅ **Personalized Advice**: AI financial recommendations
- ✅ **Budget Optimization**: Suggest budget adjustments
- ✅ **Risk Assessment**: Financial health scoring

### 📊 BI Features:
- ✅ **Interactive Dashboards**: Real-time financial metrics
- ✅ **Advanced Charts**: Custom visualizations
- ✅ **Automated Reports**: Scheduled PDF/Excel exports
- ✅ **Data Export**: Multiple format support
- ✅ **Collaborative Sharing**: Share dashboards with others

### ⚙️ Automation Features:
- ✅ **Email Processing**: Automatic transaction import
- ✅ **API Integration**: Bank and payment provider APIs
- ✅ **Webhook Support**: Real-time data synchronization
- ✅ **Scheduled Tasks**: Automated report generation
- ✅ **Alert System**: Email/SMS notifications

---

## 🔌 API DOCUMENTATION

### Flask Backend APIs:

**GET /api/transactions**
- Returns: Array of transaction objects
- Sample Response:
```json
[
  {
    "id": 1,
    "date": "2024-01-15T10:00:00Z",
    "amount": 50000,
    "category": "Ăn uống",
    "description": "Highlands Coffee #123",
    "source": "MoMo"
  }
]
```

**POST /api/webhook**
- Input: Transaction data from n8n
- Returns: Success confirmation

**GET /api/budgets**
- Returns: Budget configuration

**GET /api/bills**
- Returns: Bill reminders

### Dify AI APIs:
- **POST /chat-messages**: General AI conversation
- **POST /completions**: Structured data analysis
- **POST /workflows**: Complex multi-step analysis

---

## 🔒 BẢO MẬT & AN TOÀN

### 🛡️ Security Measures:
- **Local Data Storage**: 100% data stored locally
- **No Cloud Dependencies**: All components run locally
- **Encrypted Communications**: HTTPS for external APIs
- **Access Control**: Local authentication only
- **Data Sanitization**: Input validation and sanitization

### 🔐 Privacy Protection:
- **No Data Sharing**: Data never leaves local environment
- **Secure Credentials**: Encrypted storage of API keys
- **Audit Logging**: Complete transaction audit trail
- **Data Backup**: Automated local backups
- **GDPR Compliance**: User data control and deletion

### ⚠️ Security Best Practices:
- Regular software updates
- Strong local passwords
- Network firewall configuration
- Regular data backups
- Secure API key management

---

## 🎯 KẾT LUẬN

FinWise AI represents a comprehensive personal finance management ecosystem that combines the power of automation, artificial intelligence, and business intelligence tools. By leveraging n8n for workflow automation, Dify for AI-driven insights, and Superset/Metabase for advanced analytics, users gain complete control over their financial data while maintaining maximum privacy and security.

The system's modular architecture allows for easy customization and extension, making it suitable for both individual users and small businesses looking to implement intelligent financial management solutions.

**Key Benefits:**
- 🚀 **Complete Automation**: Hands-free financial tracking
- 🧠 **AI-Powered Insights**: Intelligent financial advice
- 📊 **Professional Analytics**: Enterprise-grade reporting
- 🔒 **Maximum Privacy**: 100% local data storage
- ⚡ **Real-time Updates**: Instant financial awareness
- 🎨 **Beautiful Interface**: Intuitive user experience

---

*Developed with ❤️ for financial freedom and data sovereignty*</content>
<parameter name="filePath">c:\Users\buidu\Downloads\finwise_ai\FINWISE_AI_DETAILED_SPEC.md