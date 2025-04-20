-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP,
  image TEXT,
  surname TEXT,
  phone TEXT,
  address TEXT,
  password_hash TEXT,
  verification_token TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İşlem kategorileri için tablo
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, type)
);

-- İşlemler tablosu
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Demo kullanıcı ekle
INSERT INTO users (id, name, email, email_verified, role) 
VALUES ('demo-user', 'Demo Kullanıcı', 'demo@example.com', CURRENT_TIMESTAMP, 'admin')
ON CONFLICT (id) DO NOTHING;

-- Örnek kategori verileri
INSERT INTO categories (name, type, icon) 
VALUES 
  ('Maaş', 'INCOME', 'banknote'),
  ('Yatırım', 'INCOME', 'trending-up'),
  ('Serbest Çalışma', 'INCOME', 'briefcase'),
  ('Hediye', 'INCOME', 'gift'),
  ('Diğer Gelir', 'INCOME', 'plus-circle'),
  ('Konut', 'EXPENSE', 'home'),
  ('Gıda', 'EXPENSE', 'utensils'),
  ('Ulaşım', 'EXPENSE', 'car'),
  ('Faturalar', 'EXPENSE', 'zap'),
  ('Sağlık', 'EXPENSE', 'heart-pulse'),
  ('Eğlence', 'EXPENSE', 'film'),
  ('Alışveriş', 'EXPENSE', 'shopping-bag'),
  ('Eğitim', 'EXPENSE', 'book'),
  ('Seyahat', 'EXPENSE', 'plane'),
  ('Abonelikler', 'EXPENSE', 'repeat'),
  ('Diğer Giderler', 'EXPENSE', 'minus-circle')
ON CONFLICT (name, type) DO NOTHING; 