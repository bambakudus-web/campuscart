-- CampusCart database schema
-- Run this after creating the campuscart_db database (see task1-setup/SETUP.md)

USE campuscart_db;

CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('books', 'electronics', 'furniture', 'clothing', 'other') NOT NULL DEFAULT 'other',
    item_condition ENUM('new', 'like_new', 'used', 'fair') NOT NULL DEFAULT 'used',
    seller_name VARCHAR(100) NOT NULL,
    seller_contact VARCHAR(50) NOT NULL,
    status ENUM('available', 'sold') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample seed data
INSERT INTO listings (title, description, price, category, item_condition, seller_name, seller_contact)
VALUES
('Engineering Mathematics Textbook', 'Third edition, minor highlighting on chapter 3', 45.00, 'books', 'used', 'Ama Serwaa', '0244000111'),
('HP Laptop Charger', 'Original charger, barely used', 60.00, 'electronics', 'like_new', 'Kwame Owusu', '0207000222'),
('Reading Table', 'Wooden reading table, good for hostel room', 120.00, 'furniture', 'fair', 'Efua Mensah', '0554000333');
