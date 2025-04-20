import { query } from './db';
import { TransactionType } from './categories';
import { endOfDay, startOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';

// İşlem arayüzü
export interface Transaction {
  id: string | number;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date | string;
  categoryId: string | number;
  userId: string;
  categoryName?: string;
  categoryIcon?: string;
}

// Yeni işlem oluşturma arayüzü
export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  description?: string;
  date?: Date | string;
  categoryId: string | number;
  userId: string;
}

// Bir kullanıcının tüm işlemlerini getir
export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const result = await query(
      `SELECT 
        t.id, t.amount, t.type, t.description, t.date, 
        t.category_id as "categoryId", t.user_id as "userId",
        c.name as "categoryName", c.icon as "categoryIcon"
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.date DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// Bir kullanıcının işlemlerini filtrelerle getir
export async function getFilteredTransactions(
  userId: string, 
  options: { 
    type?: TransactionType; 
    categoryId?: string | number; 
    startDate?: string; 
    endDate?: string; 
    limit?: number;
    offset?: number;
  }
): Promise<Transaction[]> {
  try {
    // Dinamik parametre ve koşul oluşturma
    let params: any[] = [userId];
    let conditions = ['t.user_id = $1'];
    let index = 2;

    if (options.type) {
      conditions.push(`t.type = $${index}`);
      params.push(options.type);
      index++;
    }

    if (options.categoryId) {
      conditions.push(`t.category_id = $${index}`);
      params.push(String(options.categoryId));
      index++;
    }

    if (options.startDate) {
      conditions.push(`t.date >= $${index}`);
      params.push(options.startDate);
      index++;
    }

    if (options.endDate) {
      conditions.push(`t.date <= $${index}`);
      params.push(options.endDate);
      index++;
    }

    // Koşulları WHERE cümlesine ekle
    const whereClause = conditions.join(' AND ');

    // Limit ve offset ekle
    let limitClause = '';
    if (options.limit) {
      limitClause = ` LIMIT $${index}`;
      params.push(String(options.limit));
      index++;

      if (options.offset) {
        limitClause += ` OFFSET $${index}`;
        params.push(String(options.offset));
      }
    }

    const result = await query(
      `SELECT 
        t.id, t.amount, t.type, t.description, t.date, 
        t.category_id as "categoryId", t.user_id as "userId",
        c.name as "categoryName", c.icon as "categoryIcon"
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereClause}
      ORDER BY t.date DESC${limitClause}`,
      params
    );
    
    return result.rows;
  } catch (error) {
    console.error("Error fetching filtered transactions:", error);
    return [];
  }
}

// Yeni işlem oluştur
export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
  try {
    // Eğer tarih belirtilmemişse şimdiki zamanı kullan
    const date = data.date || new Date();
    
    const result = await query(
      `INSERT INTO transactions 
        (amount, type, description, date, category_id, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, amount, type, description, date, category_id as "categoryId", user_id as "userId"`,
      [data.amount, data.type, data.description, date, String(data.categoryId), data.userId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

// İşlem güncelle
export async function updateTransaction(
  id: string,
  userId: string,
  updateData: Partial<Transaction>
): Promise<Transaction> {
  try {
    // İlk olarak işlemin var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol et
    const transaction = await query(
      'SELECT id, amount, type, description, date, category_id as "categoryId", user_id as "userId" FROM transactions WHERE id = $1 AND user_id = $2',
      [String(id), userId]
    );

    if (!transaction.rowCount || transaction.rowCount === 0) {
      throw new Error("İşlem bulunamadı veya bu işlemi güncelleme yetkiniz yok");
    }

    // Güncellenecek alanları ve parametreleri belirle
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (updateData.amount !== undefined) {
      updates.push(`amount = $${paramIndex}`);
      params.push(updateData.amount);
      paramIndex++;
    }
    
    if (updateData.type !== undefined) {
      updates.push(`type = $${paramIndex}`);
      params.push(updateData.type);
      paramIndex++;
    }
    
    if (updateData.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(updateData.description);
      paramIndex++;
    }
    
    if (updateData.date !== undefined) {
      updates.push(`date = $${paramIndex}`);
      params.push(updateData.date);
      paramIndex++;
    }
    
    if (updateData.categoryId !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      params.push(String(updateData.categoryId));
      paramIndex++;
    }
    
    // Hiçbir alan güncellenmiyorsa mevcut işlemi döndür
    if (updates.length === 0) {
      return transaction.rows[0];
    }
    
    // Güncellenme tarihini ayarla
    updates.push(`updated_at = NOW()`);
    
    // ID ve userId parametrelerini ekle
    params.push(String(id));
    params.push(userId);
    
    const result = await query(
      `UPDATE transactions 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} 
      RETURNING id, amount, type, description, date, category_id as "categoryId", user_id as "userId"`,
      params
    );
    
    return result.rows[0];
  } catch (error) {
    console.error("İşlem güncellenirken hata:", error);
    throw error;
  }
}

// İşlem sil
export async function deleteTransaction(id: string | number, userId: string): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [String(id), userId]
    );
    
    if (!result.rowCount || result.rowCount === 0) {
      throw new Error('İşlem bulunamadı veya bu kullanıcıya ait değil');
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

// Özet bilgileri getir (toplam gelir/gider)
export async function getTransactionSummary(
  userId: string, 
  options: { 
    startDate?: string; 
    endDate?: string; 
  }
): Promise<{ income: number; expense: number; balance: number }> {
  try {
    let params = [userId];
    let conditions = ['user_id = $1'];
    let index = 2;

    if (options.startDate) {
      conditions.push(`date >= $${index}`);
      params.push(options.startDate);
      index++;
    }

    if (options.endDate) {
      conditions.push(`date <= $${index}`);
      params.push(options.endDate);
      index++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT 
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE ${whereClause}`,
      params
    );
    
    const summary = result.rows[0];
    const income = Number(summary.income) || 0;
    const expense = Number(summary.expense) || 0;
    
    return {
      income,
      expense,
      balance: income - expense
    };
  } catch (error) {
    console.error("Error getting transaction summary:", error);
    return { income: 0, expense: 0, balance: 0 };
  }
}

// Kategori bazında toplam harcamaları getir (grafikler için)
export async function getExpensesByCategory(
  userId: string, 
  options: { 
    startDate?: string; 
    endDate?: string; 
  }
): Promise<Array<{ categoryId: string | number; categoryName: string; categoryIcon: string; total: number; percentage: number }>> {
  try {
    let params = [userId];
    let conditions = ['t.user_id = $1 AND t.type = \'EXPENSE\''];
    let index = 2;

    if (options.startDate) {
      conditions.push(`t.date >= $${index}`);
      params.push(options.startDate);
      index++;
    }

    if (options.endDate) {
      conditions.push(`t.date <= $${index}`);
      params.push(options.endDate);
      index++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT 
        c.id as "categoryId", 
        c.name as "categoryName", 
        c.icon as "categoryIcon",
        SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE ${whereClause}
      GROUP BY c.id, c.name, c.icon
      ORDER BY total DESC`,
      params
    );
    
    const categories = result.rows;
    
    // Toplam hesapla ve yüzde ekle
    const total = categories.reduce((sum, cat) => sum + Number(cat.total), 0);
    
    return categories.map(cat => ({
      ...cat,
      total: Number(cat.total),
      percentage: total > 0 ? Number(((Number(cat.total) / total) * 100).toFixed(1)) : 0
    }));
  } catch (error) {
    console.error("Error getting expenses by category:", error);
    return [];
  }
}

// Aylık trend verileri (grafikler için)
export async function getMonthlyTrends(
  userId: string, 
  options: { 
    months?: number; // Son kaç ay
  }
): Promise<Array<{ month: string; income: number; expense: number; balance: number }>> {
  try {
    const months = options.months || 6;
    
    const result = await query(
      `SELECT 
        TO_CHAR(date_trunc('month', date), 'YYYY-MM') as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = $1 
        AND date >= date_trunc('month', NOW()) - interval '${months} month'
      GROUP BY date_trunc('month', date)
      ORDER BY month ASC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      month: row.month,
      income: Number(row.income),
      expense: Number(row.expense),
      balance: Number(row.income) - Number(row.expense)
    }));
  } catch (error) {
    console.error("Error getting monthly trends:", error);
    return [];
  }
}