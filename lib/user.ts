import { query } from "./db";
import { hashPassword, generateVerificationToken, generatePasswordResetToken, isTokenExpired } from "./password";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { v4 as uuidv4 } from "uuid";

export interface UserSignUpData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

/**
 * Yeni kullanıcı oluşturur ve doğrulama e-postası gönderir
 */
export async function createUser(userData: UserSignUpData): Promise<{ 
  success: boolean; 
  message?: string;
  userId?: string;
}> {
  try {
    // E-posta adresi kullanılmış mı kontrol et
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return { 
        success: false, 
        message: 'Bu e-posta adresi zaten kullanılıyor.' 
      };
    }

    // Şifreyi hashleme
    const hashedPassword = await hashPassword(userData.password);
    
    // Benzersiz kullanıcı ID'si oluştur
    const userId = uuidv4();
    
    // Doğrulama token'ı oluştur
    const verificationToken = generateVerificationToken();

    // Kullanıcıyı veritabanına kaydet (doğrulanmamış olarak)
    const result = await query(
      `INSERT INTO users (
        id, name, surname, email, phone, address, password_hash, 
        verification_token, role, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        userId,
        userData.name,
        userData.surname,
        userData.email,
        userData.phone,
        userData.address,
        hashedPassword,
        verificationToken,
        'user', // Varsayılan rol
        null, // e-posta doğrulanmadı
      ]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return { success: false, message: 'Kullanıcı oluşturulurken bir hata oluştu.' };
    }

    // Doğrulama e-postası gönder
    const emailSent = await sendVerificationEmail(
      userData.email,
      userData.name,
      verificationToken
    );

    if (!emailSent) {
      // E-posta gönderilemedi ancak kullanıcı kaydedildi, doğrulama için alternatif yöntem sunabiliriz
      console.warn(`Kullanıcı ${userId} için doğrulama e-postası gönderilemedi. Manuel doğrulama gerekebilir.`);
      
      // Kullanıcı için alternatif doğrulama yöntemi önerin veya yönetici için uyarı bırakın
      return { 
        success: true, 
        message: 'Kullanıcı kaydınız tamamlandı, ancak doğrulama e-postası gönderilemedi. Yönetici ile iletişime geçin veya hesabınızı daha sonra doğrulamayı deneyin.',
        userId
      };
    }

    return { 
      success: true, 
      message: 'Kullanıcı kaydınız tamamlandı. Lütfen e-posta adresinize gönderilen doğrulama bağlantısını kullanarak hesabınızı aktifleştirin.',
      userId
    };
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return { success: false, message: 'Bir hata oluştu.' };
  }
}

/**
 * E-posta doğrulama token'ını kontrol eder ve kullanıcıyı doğrular
 */
export async function verifyEmail(token: string): Promise<{ 
  success: boolean; 
  message: string;
}> {
  try {
    // Token'a sahip kullanıcıyı bul
    const result = await query(
      'SELECT id, email, name FROM users WHERE verification_token = $1',
      [token]
    );

    // Kullanıcı bulunamadı
    if (!result.rowCount || result.rowCount === 0) {
      return { 
        success: false, 
        message: 'Geçersiz doğrulama bağlantısı. Bağlantı daha önce kullanılmış veya süresi dolmuş olabilir.' 
      };
    }

    const user = result.rows[0];

    // Kullanıcıyı doğrulanmış olarak işaretle ve token'ı temizle
    await query(
      'UPDATE users SET email_verified = CURRENT_TIMESTAMP, verification_token = NULL WHERE id = $1',
      [user.id]
    );

    return { 
      success: true, 
      message: 'E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.' 
    };
  } catch (error) {
    console.error('E-posta doğrulama hatası:', error);
    return { success: false, message: 'Doğrulama sırasında bir hata oluştu.' };
  }
}

/**
 * Şifre sıfırlama isteği oluşturur ve kullanıcıya e-posta gönderir
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Kullanıcıyı e-posta ile bul
    const result = await query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1',
      [email]
    );

    // Kullanıcı bulunamadı veya e-postası doğrulanmamış
    if (!result.rowCount || result.rowCount === 0) {
      // Kullanıcıya bilgi sızdırmamak için başarılı dönüş yaparız
      return {
        success: true,
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
      };
    }

    const user = result.rows[0];

    // E-posta doğrulanmamış ise
    if (!user.email_verified) {
      return {
        success: false,
        message: 'E-posta adresiniz henüz doğrulanmamış. Lütfen önce e-posta adresinizi doğrulayın.'
      };
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = generatePasswordResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

    // Kullanıcıya şifre sıfırlama token'ı ata
    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, expiresAt, user.id]
    );

    // Şifre sıfırlama e-postası gönder
    await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    return {
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
    };
  } catch (error) {
    console.error('Şifre sıfırlama isteği hatası:', error);
    return { 
      success: false,
      message: 'Şifre sıfırlama isteği oluşturulurken bir hata oluştu.'
    };
  }
}

/**
 * Şifre sıfırlama işlemini gerçekleştirir
 */
export async function resetPassword(token: string, newPassword: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Token'a sahip kullanıcıyı bul
    const result = await query(
      'SELECT id, reset_password_expires FROM users WHERE reset_password_token = $1',
      [token]
    );

    // Kullanıcı bulunamadı veya token geçersiz
    if (!result.rowCount || result.rowCount === 0) {
      return {
        success: false,
        message: 'Geçersiz veya süresi dolmuş bir şifre sıfırlama bağlantısı. Lütfen yeni bir sıfırlama isteği oluşturun.'
      };
    }

    const user = result.rows[0];
    const tokenExpires = user.reset_password_expires;

    // Token'ın süresi dolmuş mu kontrol et
    if (isTokenExpired(tokenExpires)) {
      return {
        success: false,
        message: 'Şifre sıfırlama bağlantınızın süresi dolmuş. Lütfen yeni bir sıfırlama isteği oluşturun.'
      };
    }

    // Yeni şifreyi hashle
    const hashedPassword = await hashPassword(newPassword);

    // Kullanıcının şifresini güncelle ve token'ı temizle
    await query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    return {
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz.'
    };
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return { 
      success: false,
      message: 'Şifre sıfırlanırken bir hata oluştu.'
    };
  }
} 