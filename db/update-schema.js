require('dotenv').config();
const fs = require('fs');
const pg = require('pg');

// Veritabanı bağlantısı oluştur
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

// SQL dosyasını oku
const sqlScript = fs.readFileSync('./db/alter-password-reset.sql', 'utf8');

async function updateSchema() {
  try {
    // Veritabanına bağlan
    await client.connect();
    console.log('Veritabanına bağlanıldı');

    // SQL sorgularını çalıştır
    await client.query(sqlScript);
    console.log('Şifre sıfırlama alanları başarıyla eklendi');

  } catch (err) {
    console.error('Hata oluştu:', err);
  } finally {
    // Bağlantıyı kapat
    await client.end();
    console.log('Veritabanı bağlantısı kapatıldı');
  }
}

// Scripti çalıştır
updateSchema(); 