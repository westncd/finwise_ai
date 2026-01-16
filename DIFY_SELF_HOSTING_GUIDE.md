# Hướng dẫn Tự Host Dify (Self-Hosted)

Nếu bạn muốn chạy Dify trên máy cá nhân hoặc server riêng thay vì dùng bản Cloud, hãy làm theo các bước dưới đây. Cách đơn giản nhất là dùng **Docker Compose**.

## 1. Yêu cầu hệ thống
- **Hệ điều hành**: Windows (có WSL2), macOS hoặc Linux.
- **RAM**: Tối thiểu 8GB (Dify khá nặng vì chạy nhiều container).
- **Phần mềm**:
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (đã bật WSL2 nếu dùng Windows).
  - [Git](https://git-scm.com/downloads).

## 2. Các bước cài đặt

### Bước 1: Clone mã nguồn Dify
Mở Terminal (hoặc PowerShell/CMD) và chạy lệnh:

```bash
git clone https://github.com/langgenius/dify.git
```

### Bước 2: Truy cập thư mục Docker
Di chuyển vào thư mục chứa cấu hình Docker của Dify:

```bash
cd dify/docker
```

### Bước 3: Cấu hình biến môi trường
Mặc định Dify đã có file mẫu. Bạn cần tạo file `.env` từ file mẫu này:

```bash
cp .env.example .env
```
*(Trên Windows nếu lệnh `cp` không chạy, bạn có thể copy thủ công file `.env.example` và đổi tên thành `.env`)*

### Bước 4: Khởi chạy Dify
Chạy lệnh sau để Docker tải và bật toàn bộ hệ thống (Frontend, Backend, Database, Redis, Vector DB...):

```bash
docker compose up -d
```
*Lưu ý: Lần đầu chạy sẽ mất khoảng 5-10 phút để tải các Image (tổng khoảng vài GB).*

### Bước 5: Kiểm tra
Sau khi lệnh chạy xong, mở trình duyệt và truy cập:
- **Địa chỉ**: [http://localhost](http://localhost)
- **Tài khoản Admin đầu tiên**: Bạn sẽ được yêu cầu tạo tài khoản Admin ngay khi truy cập lần đầu.

## 3. Cập nhật Finwise AI để dùng Dify Local

Sau khi Dify Local chạy ngon lành, bạn cần sửa lại cấu hình của Finwise AI để nó trỏ về máy bạn thay vì `api.dify.ai`.

1. **Lấy API Key mới**: Đăng nhập Dify Local -> Tạo App -> Vào "API Access" lấy Key mới.
2. **Sửa file `.env.local` của Finwise**:
   ```env
   DIFY_API_KEY=app-xxxxxxxxxxxxxx (Key mới từ Local)
   ```
3. **Sửa file `services/aiService.ts`**:
   Tìm đoạn khai báo `DIFY_BASE_URL` và đổi thành:
   ```typescript
   // Nếu chạy Docker trên cùng máy
   const DIFY_BASE_URL = 'http://localhost/v1'; 
   ```

## 4. Xử lý lỗi thường gặp

- **Lỗi Port 80/5432 already in use**: 
  - Do máy bạn đang chạy phần mềm khác chiếm cổng (ví dụ Apache/XAMPP chiếm cổng 80, Postgres chiếm 5432).
  - **Cách sửa**: Mở file `dify/docker/docker-compose.yaml`, sửa phần `ports` của `nginx` từ `80:80` thành `8080:80`. Sau đó truy cập bằng `http://localhost:8080`.

- **Không kết nối được từ n8n/Finwise**:
  - Nếu n8n cũng chạy Docker, hãy dùng `http://host.docker.internal` thay cho `localhost`.
