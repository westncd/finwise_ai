# Hướng dẫn Kết nối Metabase với MySQL (FinWise AI)

Metabase là công cụ vẽ biểu đồ (Business Intelligence) cực mạnh và dễ dùng. Dưới đây là cách kết nối nó với database MySQL của FinWise.

## 1. Cài đặt Metabase (Khuyên dùng Docker)
Nếu bạn chưa cài Metabase, cách nhanh nhất là chạy lệnh Docker:

```bash
docker run -d -p 3001:3000 --name metabase metabase/metabase
```
Sau đó truy cập: [http://localhost:3001](http://localhost:3001)

## 2. Các bước kết nối Database
Sau khi tạo tài khoản Admin trên Metabase, bạn vào mục **Admin Settings** -> **Databases** -> **Add Database**.

Điền thông tin như sau:

| Mục | Giá trị | Ghi chú |
| :--- | :--- | :--- |
| **Database type** | MySQL | |
| **Display name** | FinWise DB | Tên hiển thị trên Metabase |
| **Host** | `host.docker.internal` | Nếu Metabase chạy Docker. Nếu chạy file JAR thì dùng `localhost` |
| **Port** | 3306 | Cổng mặc định của MySQL |
| **Database name** | `finwise_db` | Tên database của dự án |
| **Username** | `root` | Hoặc user bạn đã tạo |
| **Password** | (Bỏ trống) | Nếu XAMPP mặc định không có pass. Nếu có thì điền vào. |

## 3. Lưu ý quan trọng
- **Lỗi không kết nối được (Connection refused)**:
  - Nếu Metabase chạy trong Docker, nó không hiểu `localhost` là máy tính của bạn. BẮT BUỘC dùng `host.docker.internal`.
  - Nếu dùng XAMPP, hãy đảm bảo MySQL đang BẬT (nút Start màu xanh).
  
- **Quyền truy cập**:
  - User `root` của XAMPP thường chỉ cho phép kết nối từ `localhost`. Nếu Docker không kết nối được, bạn cần tạo user mới cho phép truy cập từ mọi IP (`%`):
  
  ```sql
  -- Chạy lệnh này trong phpMyAdmin hoặc MySQL Workbench
  CREATE USER 'metabase'@'%' IDENTIFIED BY 'password_cua_ban';
  GRANT ALL PRIVILEGES ON finwise_db.* TO 'metabase'@'%';
  FLUSH PRIVILEGES;
  ```
  *(Sau đó dùng user `metabase` và pass này để kết nối).*

## 4. Gợi ý Biểu đồ hay cho FinWise
Sau khi kết nối, thử vẽ mấy cái này nhé:
1. **Chi tiêu theo Danh mục**: Chọn bảng `transactions` -> Summarize `Sum of Amount` -> Group by `Category` -> Visualization: *Pie Chart*.
2. **Xu hướng chi tiêu**: Chọn bảng `transactions` -> Summarize `Sum of Amount` -> Group by `Date (Month)` -> Visualization: *Line Chart*.
3. **Cảnh báo vượt ngân sách**: Join bảng `budgets` và `transactions` -> Tính % `Spent` / `Limit`.

## 5. Code SQL Mẫu (Copy vào Metabase SQL Editor)

Nếu bạn muốn dùng **Native Query** (viết SQL trực tiếp) thay vì kéo thả, hãy dùng các đoạn code sau:

### Phân tích Xu hướng Chi tiêu (Theo Tháng)
```sql
SELECT 
    DATE_FORMAT(date, '%Y-%m') AS Thang,
    SUM(amount) AS Tong_Chi_Tieu
FROM transactions
WHERE type = 'expense'
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY Thang;
```

### Cảnh báo Vượt Ngân sách (% Đã dùng)
```sql
SELECT 
    b.category AS Danh_Muc,
    b.limit_amount AS Han_Muc,
    IFNULL(SUM(t.amount), 0) AS Thuc_Te_Chi,
    ROUND((IFNULL(SUM(t.amount), 0) / b.limit_amount) * 100, 1) AS Phan_Tram_Dung
FROM budgets b
LEFT JOIN transactions t ON b.category = t.category 
    AND t.type = 'expense' 
    AND MONTH(t.date) = MONTH(CURRENT_DATE()) -- Chỉ tính tháng hiện tại
GROUP BY b.category, b.limit_amount
HAVING Phan_Tram_Dung > 80 -- Chỉ hiện danh mục đã dùng quá 80%
ORDER BY Phan_Tram_Dung DESC;
```

### So Sánh Thu - Chi (Cash Flow)
*Vẽ biểu đồ Bar Chart (Stack) hoặc Line Chart (Multi-series) để xem tháng nào dương hay âm.*
```sql
SELECT 
    DATE_FORMAT(date, '%Y-%m') AS Thang,
    type AS Loai,
    SUM(amount) AS So_Tien
FROM transactions
GROUP BY Thang, Loai
ORDER BY Thang;
```

### Top 5 Giao Dịch "Tốn Kém" Nhất Tháng Này
*Dùng bảng Table để soi xem tiền đi đâu nhiều nhất.*
```sql
SELECT 
    date AS Ngay,
    description AS Noi_Dung,
    category AS Danh_Muc,
    amount AS So_Tien
FROM transactions
WHERE type = 'expense'
  AND MONTH(date) = MONTH(CURRENT_DATE())
ORDER BY amount DESC
LIMIT 5;
```

### Tỷ Lệ Nguồn Tiền (Ví nào dùng nhiều nhất?)
*Vẽ Pie Chart để biết bạn hay quẹt thẻ hay dùng MoMo.*
```sql
SELECT 
    source AS Nguon_Tien,
    COUNT(*) AS So_Giao_Dich,
    SUM(amount) AS Tong_Tien
FROM transactions
WHERE type = 'expense'
GROUP BY source;
```
