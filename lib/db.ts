import { Pool } from 'pg';

// Yalnızca sunucu bileşenlerinde kullanılabilir
let pool: Pool | null = null;

// Tarayıcıda değil, sunucuda olduğumuzdan emin olalım
if (typeof window === 'undefined') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Neon için gerekli SSL ayarı
    }
  });
}

// Veritabanı sorgularını çalıştırmak için yardımcı fonksiyon
export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Veritabanı bağlantısı sadece sunucu tarafında kullanılabilir');
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', error);
    throw error;
  }
}

// Tek bir bağlantı almak için fonksiyon (transaction gibi işlemler için)
export async function getClient() {
  if (!pool) {
    throw new Error('Veritabanı bağlantısı sadece sunucu tarafında kullanılabilir');
  }

  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // İşlem bitince bağlantıyı havuza geri döndür
  client.release = () => {
    client.query = query;
    release.apply(client);
  };

  return client;
}

export default {
  query,
  getClient,
};