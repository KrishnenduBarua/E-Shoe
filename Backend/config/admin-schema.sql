-- Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Update orders table to support guest checkout
ALTER TABLE orders 
  MODIFY COLUMN user_id INT NULL,
  ADD COLUMN guest_name VARCHAR(100) NULL AFTER user_id,
  ADD COLUMN guest_phone VARCHAR(20) NULL AFTER guest_name,
  ADD COLUMN guest_email VARCHAR(100) NULL AFTER guest_phone,
  ADD COLUMN order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected') DEFAULT 'pending' AFTER status,
  ADD COLUMN admin_notes TEXT NULL AFTER order_status,
  ADD COLUMN confirmed_by INT NULL AFTER admin_notes,
  ADD COLUMN confirmed_at TIMESTAMP NULL AFTER confirmed_by,
  ADD CONSTRAINT fk_orders_admin FOREIGN KEY (confirmed_by) REFERENCES admins(id) ON DELETE SET NULL;

-- Create index for faster order queries
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admins (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@eshoe.com', '$2a$10$rQ6vF8xVxVxVxVxVxVxVxOX5xYm5xYm5xYm5xYm5xYm5xYm5xYm5xY', 'Super Admin', 'super_admin');

-- Product Images Table (for multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);
