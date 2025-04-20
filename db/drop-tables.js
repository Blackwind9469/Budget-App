// Tabloları temizleme skripti
require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon için gerekli
  }
});

async function dropTables() {
  try {
    console.log('Tabloları silme işlemi başlatıldı...');
    
    // Tabloları sil
    await pool.query('DROP TABLE IF EXISTS transactions CASCADE');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('Tablolar başarıyla silindi!');
    return true;
  } catch (error) {
    console.error('Tablolar silinirken hata:', error.message);
    return false;
  } finally {
    // Bağlantıyı kapat
    await pool.end();
  }
}

// Betiği çalıştır
dropTables().then(success => {
  if (success) {
    console.log('Temizleme işlemi tamamlandı.');
  } else {
    console.log('Temizleme işlemi hatayla sonuçlandı.');
  }
}); 