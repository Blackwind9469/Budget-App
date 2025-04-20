import nodemailer from 'nodemailer';

// SMTP yapılandırmasını debug et
console.log('SMTP Ayarları:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER ? '**ayarlanmış**' : 'ayarlanmamış',
  pass: process.env.SMTP_PASSWORD ? '**ayarlanmış**' : 'ayarlanmamış',
});

// SMTP yapılandırması
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// SMTP bağlantısını test et
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Bağlantı Hatası:', error);
  } else {
    console.log('SMTP Sunucusu bağlantısı başarılı');
  }
});

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * E-posta gönderir
 */
export async function sendMail({ to, subject, text, html }: SendMailOptions): Promise<boolean> {
  try {
    // E-posta yapılandırması kontrol edilmiş mi?
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP yapılandırması eksik. E-posta gönderilemedi.');
      return false;
    }

    const info = await transporter.sendMail({
      from: `"Budget Tracker" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('E-posta gönderildi:', info.messageId);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
}

/**
 * Doğrulama e-postası gönderir
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationToken: string
): Promise<boolean> {
  // NEXTAUTH_URL kontrol et
  if (!process.env.NEXTAUTH_URL) {
    console.error('NEXTAUTH_URL çevre değişkeni eksik. Doğrulama e-postası gönderilemedi.');
    return false;
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
  
  const subject = 'E-posta Adresinizi Doğrulayın';
  
  const text = `
    Merhaba ${name},
    
    E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:
    ${verificationUrl}
    
    Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.
    
    Teşekkürler,
    Budget Tracker Ekibi
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">E-posta Adresinizi Doğrulayın</h2>
      <p>Merhaba ${name},</p>
      <p>E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">
          E-postamı Doğrula
        </a>
      </p>
      <p>Veya aşağıdaki bağlantıyı kullanın:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
      <p>Teşekkürler,<br>Budget Tracker Ekibi</p>
    </div>
  `;

  return await sendMail({ to, subject, text, html });
}

/**
 * Şifre sıfırlama e-postası gönderir
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<boolean> {
  // NEXTAUTH_URL kontrol et
  if (!process.env.NEXTAUTH_URL) {
    console.error('NEXTAUTH_URL çevre değişkeni eksik. Şifre sıfırlama e-postası gönderilemedi.');
    return false;
  }

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Şifre Sıfırlama İsteği';
  
  const text = `
    Merhaba ${name},
    
    Hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:
    ${resetUrl}
    
    Bu bağlantı 24 saat boyunca geçerli olacaktır.
    
    Eğer bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayın. Hesabınızın güvenliği sağlanmıştır.
    
    Teşekkürler,
    Budget Tracker Ekibi
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Şifre Sıfırlama İsteği</h2>
      <p>Merhaba ${name},</p>
      <p>Hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">
          Şifremi Sıfırla
        </a>
      </p>
      <p>Veya aşağıdaki bağlantıyı kullanın:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Bu bağlantı 24 saat boyunca geçerli olacaktır.</p>
      <p>Eğer bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayın. Hesabınızın güvenliği sağlanmıştır.</p>
      <p>Teşekkürler,<br>Budget Tracker Ekibi</p>
    </div>
  `;

  return await sendMail({ to, subject, text, html });
} 