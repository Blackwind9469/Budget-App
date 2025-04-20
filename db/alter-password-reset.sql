-- Şifre sıfırlama için users tablosuna yeni alanlar ekle
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;

-- İndeks oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_password_token); 