-- Database Initialization for FinWise AI
CREATE DATABASE IF NOT EXISTS finwise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finwise_db;

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL DEFAULT 'expense',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    source VARCHAR(50) NOT NULL,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL UNIQUE,
    limit_amount DECIMAL(15, 2) NOT NULL, -- 'limit' is a reserved keyword
    spent DECIMAL(15, 2) DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Đã thanh toán', 'Chờ thanh toán', 'Quá hạn') DEFAULT 'Chờ thanh toán',
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data (Optional, for testing)
INSERT INTO budgets (category, limit_amount, spent) VALUES
('Ăn uống', 5000000, 0),
('Di chuyển', 2000000, 0),
('Mua sắm', 3000000, 0),
('Tiện ích', 1500000, 0),
('Nhà ở', 8000000, 0)
ON DUPLICATE KEY UPDATE limit_amount = VALUES(limit_amount);

-- Trigger to auto-update 'spent' in budgets
DELIMITER //
CREATE TRIGGER update_budget_spent AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    IF NEW.type = 'expense' THEN
        UPDATE budgets 
        SET spent = spent + NEW.amount 
        WHERE category = NEW.category;
    END IF;
END //
DELIMITER ;
