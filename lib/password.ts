import * as bcrypt from 'bcrypt';

// Şifreyi hashler
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verilen şifreyi hash ile karşılaştırır
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Rastgele doğrulama kodu oluşturur
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

// Şifre sıfırlama token'ı oluşturur
export function generatePasswordResetToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36);
}

// Token geçerlilik süresini kontrol eder (24 saat)
export function isTokenExpired(tokenDate: Date): boolean {
  const now = new Date();
  const tokenTime = new Date(tokenDate);
  const diffHours = Math.abs(now.getTime() - tokenTime.getTime()) / 36e5; // Saat cinsinden fark
  return diffHours > 24;
} 