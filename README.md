
# 🚀 FinWise AI - Hệ Sinh Thái Quản Lý Tài Chính Toàn Diện
**Kết hợp sức mạnh của AI, Tự động hóa và Phân tích dữ liệu thông minh.**

FinWise AI không chỉ là một ứng dụng quản lý chi tiêu thông thường. Đây là một hệ sinh thái gồm nhiều mắt xích công nghệ kết nối với nhau để giúp bạn tự động hóa hoàn toàn việc theo dõi dòng tiền và nhận lời khuyên tài chính từ AI.

---

## 🏗️ 1. Kiến trúc hệ thống (How it works)

Hệ thống hoạt động theo một quy trình khép kín:
1.  **Dữ liệu đầu vào**: Email thông báo biến động số dư (MoMo, VCB, ZaloPay, hóa đơn điện/nước).
2.  **n8n (Người thu gom)**: Tự động đăng nhập vào Gmail, lọc các email có từ khóa tài chính, bóc tách văn bản thô và gửi về Backend.
3.  **Flask (Người xử lý)**: Nhận dữ liệu từ n8n, chuẩn hóa dữ liệu (ví dụ: chuyển "300k" thành "300000") và lưu vào cơ sở dữ liệu.
4.  **MySQL (Kho lưu trữ)**: Lưu trữ mọi giao dịch, ngân sách và hóa đơn một cách an toàn trên máy tính của bạn (qua XAMPP).
5.  **Dify AI (Bộ não)**: Đọc dữ liệu từ MySQL để đưa ra lời khuyên, phát hiện giao dịch bất thường và dự báo chi tiêu tháng tới.
6.  **Metabase/Superset (Mắt thần)**: Vẽ biểu đồ chuyên sâu, báo cáo BI từ dữ liệu thực tế.

---

## 🛠️ 2. Hướng dẫn cài đặt chi tiết (Step-by-Step)

### Bước 1: Cài đặt Cơ sở dữ liệu (MySQL qua XAMPP)
*   Tải và cài đặt [XAMPP](https://www.apachefriends.org/download.html).
*   Mở **XAMPP Control Panel** và nhấn **Start** tại mục MySQL.
*   Truy cập `localhost/phpmyadmin`, tạo một Database tên là `finwise_db`.
*   Tạo các bảng cơ bản: `transactions`, `budgets`, `bills` (Xem script trong thư mục `database/init.sql`).

### Bước 2: Cài đặt n8n (Tự động hóa Email)
*   Cài đặt [Node.js](https://nodejs.org/).
*   Mở Terminal/CMD, chạy lệnh: `npm install n8n -g`.
*   Gõ `n8n start` để khởi động.
*   **Thiết lập Workflow**:
    *   Dùng node **IMAP Email** để kết nối với Gmail của bạn (Cần tạo "Mật khẩu ứng dụng" trong Google Account).
    *   Dùng node **HTTP Request** để gửi dữ liệu bóc tách được sang Flask API (`localhost:5000/api/webhook`).

### Bước 3: Cài đặt Backend (Flask Engine)
*   Cài đặt Python.
*   Tạo môi trường ảo và cài đặt thư viện:
    ```bash
    pip install flask flask-cors mysql-connector-python requests
    ```
*   Chạy file backend: `python app.py`. Flask sẽ chạy tại cổng `5000`.

### Bước 4: Kết nối Dify AI (Trí tuệ nhân tạo)
*   Truy cập [Dify.ai](https://dify.ai) và tạo một tài khoản.
*   Tạo một App dạng **Chatbot** hoặc **Workflow**.
*   Lấy **API Key** và dán vào biến môi trường `process.env.API_KEY` trong ứng dụng của bạn.
*   Dify sẽ đóng vai trò phân tích các chuỗi văn bản phức tạp mà code thông thường không hiểu được.

### Bước 5: Cài đặt công cụ BI (Metabase - Tùy chọn)
*   Tải [Metabase JAR](https://www.metabase.com/start/oss/).
*   Chạy lệnh: `java -jar metabase.jar`.
*   Truy cập `localhost:3000`, kết nối tới MySQL `finwise_db` của bạn để bắt đầu vẽ biểu đồ.

---

## 📱 3. Sử dụng Giao diện Frontend
*   Frontend được xây dựng bằng **React + Tailwind CSS**.
*   Mọi dữ liệu bạn thấy trên màn hình đều được đồng bộ thời gian thực với MySQL qua Flask.
*   **Tính năng Mock Data**: Nếu bạn chưa có email thật, hãy vào tab **n8n Workflow Hub**, sử dụng bộ **Simulator** để tự tạo dữ liệu mẫu kiểm thử hệ thống.

---

## 📋 4. Các bảng dữ liệu (Database Schema)

| Bảng | Mục đích |
| :--- | :--- |
| `transactions` | Lưu lịch sử chi tiêu (Ngày, Số tiền, Hạng mục, Nguồn). |
| `budgets` | Lưu hạn mức chi tiêu hàng tháng cho từng loại (Ăn uống, Mua sắm...). |
| `bills` | Lưu danh sách hóa đơn cần thanh toán và ngày hạn. |

---

## ❓ 5. Câu hỏi thường gặp (FAQ)

**Q: Tôi không có API Key Dify thì sao?**
*   A: Hệ thống vẫn hoạt động ở chế độ cơ bản (hiển thị dữ liệu từ MySQL), nhưng các tính năng tư vấn thông minh và bóc tách email sẽ không hoạt động.

**Q: n8n có an toàn không khi đọc email của tôi?**
*   A: Có. n8n chạy **Local** trên máy tính của bạn, không có dữ liệu email nào gửi đi ngoài trừ việc gửi về Backend Flask do chính bạn quản lý.

**Q: Tại sao phải dùng Flask làm trung gian?**
*   A: Flask đóng vai trò bảo mật và chuẩn hóa. Nó kiểm tra dữ liệu từ n8n trước khi ghi vào MySQL để tránh lỗi định dạng.

---
*Chúc bạn quản lý tài chính hiệu quả với FinWise AI!*
