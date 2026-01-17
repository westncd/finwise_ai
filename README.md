
# 🚀 FinWise AI - Hệ Sinh Thái Quản Lý Tài Chính Cá Nhân

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Backend-Python%20Flask-green?style=for-the-badge&logo=python)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge&logo=mysql)
![n8n](https://img.shields.io/badge/Automation-n8n%20Workflow-red?style=for-the-badge&logo=n8n)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**FinWise AI** là giải pháp quản lý tài chính toàn diện, kết hợp sức mạnh của **Trí tuệ Nhân tạo (Dify/Gemini)**, **Tự động hóa (n8n)** và **Phân tích Dữ liệu (BI)** để giúp bạn kiểm soát dòng tiền thông minh, an toàn và hoàn toàn tự động.

---

## 🌟 Chức Năng Nổi Bật (Key Features)

### 1. 🤖 AI Financial Advisor (Cố vấn Tài chính AI)
-   **Phân tích Chi tiêu**: AI tự động đọc dữ liệu chi tiêu và đưa ra lời khuyên cắt giảm chi phí.
-   **Lập kế hoạch Ngân sách**: Gợi ý hạn mức chi tiêu dựa trên thu nhập thực tế và mục tiêu tiết kiệm.
-   **Giải thích lý do**: Mỗi gợi ý đều đi kèm giải thích chi tiết "Tại sao bạn cần làm vậy?".

### 2. ⚡ Tự Động Hóa Thông Minh (Intelligent Automation)
-   **Email Parsing**: Tự động đọc email từ ngân hàng (VCB, MoMo, Techcombank...) để tạo giao dịch.
-   **Smart Bill Routing**: Tự động phát hiện email "Thông báo cước/Hóa đơn" và thêm vào danh sách **Cần thanh toán** (Thay vì tính là chi tiêu).
-   **System Filter**: Tự động bỏ qua các email cảnh báo của chính hệ thống để tránh lặp vô hạn.

### 3. 🛡️ An Ninh & Cảnh Báo (Security & Alerts)
-   **Phát hiện Bất thường**: Cảnh báo ngay lập tức qua Email khi có giao dịch lớn bất thường hoặc trùng lặp nghi vấn.
-   **Email Tổng hợp**: Hệ thống gom tất cả các cảnh báo (Ngân sách, Hóa đơn, Rủi ro) vào **1 Email duy nhất** mỗi ngày để tránh làm phiền bạn.
-   **Format Chuyên nghiệp**: Email cảnh báo được thiết kế đẹp mắt với các thẻ màu (Badges) dễ nhìn.

### 4. 📊 Dự Báo & Rủi Ro (Forecast & Risk)
-   **Dự báo Chi tiêu**: Sử dụng thuật toán Simple Moving Average (SMA/3-Months) để dự đoán chi tiêu tháng tới.
-   **Cảnh báo Sớm**: Phát hiện sớm nguy cơ "cháy túi" từ ngày 15 hàng tháng dựa trên tốc độ chi tiêu hiện tại.

---

## 🏗️ Kiến Trúc Hệ Thống

Hệ thống hoạt động theo mô hình Micro-services thu nhỏ:

1.  **Thu thập**: *n8n* quét Gmail định kỳ (1 phút/lần).
2.  **Xử lý**:
    -   Backend *Flask* nhận dữ liệu, làm sạch và lưu vào *MySQL*.
    -   AI Controller gọi *Dify/Google Gemini* để phân tích ngữ nghĩa.
3.  **Lưu trữ**: *MySQL* (XAMPP) lưu trữ Transactions, Budgets, Bills.
4.  **Hiển thị**: *React JS* (Frontend) hiển thị Dashboard tương tác.

---

## 🛠️ Hướng Dẫn Cài Đặt (Installation)

### Yêu cầu tiên quyết (Prerequisites)
-   Node.js & npm
-   Python 3.8+
-   XAMPP (hoặc MySQL Server riêng)
-   n8n (đã cài đặt `npm install n8n -g`)

### Bước 1: Khởi tạo Database
1.  Bật XAMPP (Apache & MySQL).
2.  Chạy script cài đặt database lần đầu:
    ```bash
    python init_local_db.py
    ```
    *(Script này sẽ tạo database `finwise_db` và các bảng cần thiết).*

### Bước 2: Cài đặt Backend (Flask)
```bash
# Tại thư mục gốc
python -m venv venv           # Tạo môi trường ảo (tùy chọn)
pip install -r requirements.txt # Cài thư viện (flask, mysql-connector, etc.)
python backend/app.py         # Chạy Server tại cổng 5000
```

### Bước 3: Cài đặt Frontend (React)
```bash
npm install                   # Cài đặt dependencies
npm run dev                   # Chạy Web App tại cổng 5173
```

### Bước 4: Thiết lập n8n (Tự động hóa)
1.  Mở terminal mới, chạy `n8n start`.
2.  Truy cập `localhost:5678`.
3.  Import 2 file workflow trong thư mục `workflows/`:
    -   `finwise-n8n-workflow.json`: Xử lý Email đầu vào.
    -   `finwise-cron-workflow.json`: Chạy Cron job (Cảnh báo & Gửi email tổng hợp).

---

## 📂 Cấu Trúc Thư Mục

```
finwise_ai/
├── backend/            # Flask API Server
│   ├── app.py          # Main Backend Logic
│   └── seed_data.py    # Dữ liệu mẫu
├── components/         # React UI Components
│   ├── Dashboard.tsx   # Màn hình chính
│   ├── BudgetManager.tsx # Quản lý ngân sách AI
│   └── ...
├── workflows/          # n8n Automation Files
│   ├── finwise-n8n-workflow.json  # Email Parser
│   └── finwise-cron-workflow.json # Cron Jobs
├── database/           # SQL Scripts
├── init_local_db.py    # Setup script
└── README.md           # Tài liệu hướng dẫn
```

---

## 🛡️ Bảo Mật & Riêng Tư

-   **Local First**: Toàn bộ dữ liệu tài chính nằm trên máy tính của bạn (MySQL Local).
-   **No Hardcoded Secrets**: Hệ thống sử dụng biến môi trường, không lưu cứng API Key trong code.
-   **Safe AI**: Chỉ gửi dữ liệu ẩn danh hoặc tổng hợp lên AI để phân tích.

---

*Developed by FinWise Team © 2026*
