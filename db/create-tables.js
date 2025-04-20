// Veritabanı şemasını oluşturan Node.js betiği
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon için gerekli
  }
});

// SQL dosyasını oku
async function createTables() {
  try {
    console.log('Veritabanı tablolarını oluşturma işlemi başlatıldı...');
    
    // SQL dosyasını oku
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // SQL'i çalıştır
    await pool.query(sql);
    
    console.log('Veritabanı tabloları başarıyla oluşturuldu!');
    return true;
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken hata:', error.message);
    if (error.stack) console.error(error.stack);
    return false;
  } finally {
    // Bağlantıyı kapat
    await pool.end();
  }
}

// Betiği çalıştır
createTables().then(success => {
  if (success) {
    console.log('İşlem tamamlandı. Demo kullanıcı ve kategoriler oluşturuldu.');
  } else {
    console.log('İşlem hatayla sonuçlandı.');
  }
}); 