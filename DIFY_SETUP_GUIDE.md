# Hướng dẫn Tích hợp Dify vào Finwise AI

Hiện tại, mã nguồn của dự án (`services/aiService.ts` và `components/Dashboard.tsx`) đã được lập trình sẵn để kết nối với Dify. Bạn chỉ cần tạo App trên Dify và lấy API Key để kích hoạt.

## Bước 1: Tạo ứng dụng trên Dify
1. Truy cập [Dify.ai](https://dify.ai) hoặc Dify do bạn tự host.
2. Đăng nhập và chọn **Create New App**.
3. Chọn loại ứng dụng: **Chat App** (Ứng dụng Chat).
4. Đặt tên: `Finwise AI Advisor`.
5. Nhấn **Create**.

## Bước 2: Cấu hình Prompt cho AI
Để AI hiểu được dữ liệu JSON mà ứng dụng gửi lên, bạn cần cấu hình **System Prompt** (Tiền chỉ dẫn) trong mục **Orchestrate** của Dify:

**Copy và dán nội dung sau vào phần Pre-prompt / System Instruction:**

```markdown
Bạn là Dify Financial Advisor của Finwise AI.
Dưới đây là dữ liệu tài chính của người dùng (được truyền vào qua biến):

**1. Giao dịch gần đây (Transactions):**
{{transactions}}

**2. Ngân sách hiện tại (Budgets):**
{{budgets}}

NHIỆM VỤ CỦA BẠN:
- Dựa vào dữ liệu trên để trả lời câu hỏi của người dùng.
- Tự động nhận diện xu hướng chi tiêu (tăng/giảm) từ danh sách giao dịch.
- Cảnh báo nếu chi tiêu vượt quá hoặc sát nút ngân sách.
- Luôn trả lời ngắn gọn, thân thiện, dùng biểu tượng cảm xúc.
- KHÔNG hỏi người dùng cung cấp lại dữ liệu vì bạn ĐÃ CÓ chúng ở trên.
```

Sau đó chọn Model (ví dụ: GPT-4o-mini hoặc Gemini 1.5 Pro) và nhấn **Publish**.

## Bước 3: Lấy API Key
1. Trong giao diện App Dify của bạn, tìm mục **API Access** (thường ở menu bên trái hoặc góc trên phải).
2. Nhấn **API Key** -> **Create New Secret Key**.
3. Copy đoạn mã Key (thường bắt đầu bằng `app-...`).

## Bước 4: Cập nhật dự án Finwise AI
1. Mở file `.env.local` trong thư mục dự án Finwise AI.
2. Tìm dòng `DIFY_API_KEY`.
3. Thay thế giá trị cũ bằng API Key bạn vừa copy.

```env
# .env.local
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx  <-- Dán key của bạn vào đây
```

## Bước 5: Kiểm tra
1. Khởi động lại dự án:
   ```bash
   npm run dev
   ```
2. Mở trình duyệt, truy cập Dashboard.
3. Thử tải lại trang hoặc nhấn nút **Refresh** ở mục "Dify AI Advice".
4. Nếu thấy lời khuyên hiện ra thay vì thông báo lỗi, bạn đã tích hợp thành công!

## Ghi chú
Nếu bạn tự host Dify (Local), hãy cập nhật thêm biến `DIFY_BASE_URL` trong file `services/aiService.ts` nếu cần (mặc định là `https://api.dify.ai/v1`).
