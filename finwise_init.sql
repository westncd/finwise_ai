SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS finwise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finwise_db;

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME,
    amount DECIMAL(15, 2),
    type ENUM('income', 'expense') DEFAULT 'expense',
    category VARCHAR(255),
    description TEXT,
    source VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255),
    limit_amount Decimal(15,2),
    spent DECIMAL(15, 2) DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    amount DECIMAL(15, 2),
    due_date DATE,
    status ENUM('Đã thanh toán', 'Chờ thanh toán', 'Quá hạn') DEFAULT 'Chờ thanh toán',
    is_recurring BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS anomalies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    type VARCHAR(50),
    message TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Seed Initial Budgets
INSERT INTO budgets (category, limit_amount) VALUES 
('Ăn uống', 5000000),
('Di chuyển', 2000000),
('Mua sắm', 3000000),
('Hóa đơn', 1500000),
('Khác', 1000000);

-- Seed Initial Bills
INSERT INTO bills (name, amount, due_date, status, is_recurring) VALUES 
('Internet tháng 1', 250000, '2024-02-15', 'unpaid', TRUE),
('Điện lực EVN', 850000, '2024-02-20', 'unpaid', TRUE),
('Nước sạch', 120000, '2024-02-22', 'unpaid', TRUE);
