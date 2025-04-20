import { query } from './db';

// Define transaction types manually to avoid prisma dependency
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

// Define Category interface to replace Prisma model
export interface Category {
  id: string | number;
  name: string;
  type: TransactionType;
  icon?: string;
}

interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  icon?: string;
}

/**
 * Tüm kategorileri getirir
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const result = await query('SELECT id, name, type, icon FROM categories ORDER BY name ASC');
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * Belirli bir türe göre kategorileri getirir
 */
export async function getCategoriesByType(type: TransactionType): Promise<Category[]> {
  try {
    const result = await query(
      'SELECT id, name, type, icon FROM categories WHERE type = $1 ORDER BY name ASC',
      [type]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories by type:", error);
    throw error;
  }
}

/**
 * Yeni bir kategori oluşturur
 */
export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  try {
    const result = await query(
      `INSERT INTO categories (name, type, icon) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, type, icon`,
      [data.name, data.type, data.icon || null]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

/**
 * Bir kategoriyi siler
 */
export async function deleteCategory(id: string | number): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// Varsayılan kategoriler (veritabanı oluşturulurken ekleniyor)
export const defaultCategories: Omit<Category, 'id'>[] = [
  // Gelir kategorileri
  { name: 'Maaş', type: TransactionType.INCOME, icon: 'banknote' },
  { name: 'Yatırım', type: TransactionType.INCOME, icon: 'trending-up' },
  { name: 'Serbest Çalışma', type: TransactionType.INCOME, icon: 'briefcase' },
  { name: 'Hediye', type: TransactionType.INCOME, icon: 'gift' },
  { name: 'Diğer Gelir', type: TransactionType.INCOME, icon: 'plus-circle' },
  
  // Gider kategorileri
  { name: 'Konut', type: TransactionType.EXPENSE, icon: 'home' },
  { name: 'Gıda', type: TransactionType.EXPENSE, icon: 'utensils' },
  { name: 'Ulaşım', type: TransactionType.EXPENSE, icon: 'car' },
  { name: 'Faturalar', type: TransactionType.EXPENSE, icon: 'zap' },
  { name: 'Sağlık', type: TransactionType.EXPENSE, icon: 'heart-pulse' },
  { name: 'Eğlence', type: TransactionType.EXPENSE, icon: 'film' },
  { name: 'Alışveriş', type: TransactionType.EXPENSE, icon: 'shopping-bag' },
  { name: 'Eğitim', type: TransactionType.EXPENSE, icon: 'book' },
  { name: 'Seyahat', type: TransactionType.EXPENSE, icon: 'plane' },
  { name: 'Abonelikler', type: TransactionType.EXPENSE, icon: 'repeat' },
  { name: 'Diğer Giderler', type: TransactionType.EXPENSE, icon: 'minus-circle' },
];