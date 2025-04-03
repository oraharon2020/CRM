-- Database schema for Global CRM

-- Create enum types for PostgreSQL
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE event_type AS ENUM ('meeting', 'task', 'reminder');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'closed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  manager_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_stores_timestamp
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_customers_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  store_id INT,
  user_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status order_status DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TRIGGER update_order_items_timestamp
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  type event_type NOT NULL,
  user_id INT,
  customer_id INT,
  order_id INT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TRIGGER update_calendar_events_timestamp
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  related_id INT,
  related_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(100) NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  notes TEXT,
  assigned_to INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_leads_timestamp
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Insert default admin user
INSERT INTO users (name, email, password, role)
VALUES (
  'מנהל מערכת',
  'admin@example.com',
  -- This is a hashed version of 'admin123' - in a real app, you would hash this properly
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQICd4hFR31Rc33LBFGr9Hy.1Guqt2',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert manager user (needed for leads foreign key)
INSERT INTO users (name, email, password, role)
VALUES (
  'מנהל צוות',
  'manager@example.com',
  -- This is a hashed version of 'manager123'
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQICd4hFR31Rc33LBFGr9Hy.1Guqt2',
  'manager'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample data for testing
INSERT INTO stores (name, address, phone, email)
VALUES 
  ('חנות ראשית', 'רחוב הרצל 1, תל אביב', '03-1234567', 'main@example.com'),
  ('סניף צפון', 'רחוב הנביאים 10, חיפה', '04-7654321', 'north@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO customers (name, email, phone, address)
VALUES 
  ('ישראל ישראלי', 'israel@example.com', '050-1234567', 'רחוב אלנבי 10, תל אביב'),
  ('שרה כהן', 'sarah@example.com', '052-7654321', 'רחוב ביאליק 5, רמת גן'),
  ('יוסי לוי', 'yossi@example.com', '054-9876543', 'רחוב הרצל 20, ירושלים')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, sku, price, cost, stock)
VALUES 
  ('מוצר 1', 'תיאור של מוצר 1', 'SKU001', 100.00, 60.00, 50),
  ('מוצר 2', 'תיאור של מוצר 2', 'SKU002', 200.00, 120.00, 30),
  ('מוצר 3', 'תיאור של מוצר 3', 'SKU003', 150.00, 90.00, 40)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (name, email, phone, source, status, notes, assigned_to)
VALUES 
  ('דני כהן', 'dani@example.com', '050-1111111', 'אתר אינטרנט', 'new', 'מתעניין במוצר 1', 1),
  ('מיכל לוי', 'michal@example.com', '052-2222222', 'הפניה', 'contacted', 'שוחחנו בטלפון, מעוניינת בהצעת מחיר', 2),
  ('אבי ישראלי', 'avi@example.com', '054-3333333', 'פייסבוק', 'qualified', 'מעוניין ברכישה של מספר מוצרים', 1),
  ('רונית שמעוני', 'ronit@example.com', '053-4444444', 'תערוכה', 'new', 'השאירה פרטים בתערוכה האחרונה', NULL),
  ('יעקב גולן', 'yaakov@example.com', '050-5555555', 'גוגל', 'converted', 'הפך ללקוח, הזמנה #1001', 2)
ON CONFLICT DO NOTHING;
