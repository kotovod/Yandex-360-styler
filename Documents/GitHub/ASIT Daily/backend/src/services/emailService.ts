import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// Создаем транспорт для отправки email
const transporter = nodemailer.createTransport({
  host: config.emailHost || 'smtp.gmail.com',
  port: parseInt(config.emailPort || '587'),
  secure: config.emailPort === '465', // true только для 465 (SSL)
  requireTLS: config.emailPort === '587' || config.emailPort === '25', // STARTTLS для 587/25
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
  tls: {
    // Не проверять сертификат (для некоторых хостингов)
    rejectUnauthorized: false,
  },
});

// Генерация 6-значного кода
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка кода подтверждения email
export async function sendVerificationEmail(email: string, code: string, name: string): Promise<void> {
  const mailOptions = {
    from: `"АСИТ Дейли" <${config.emailUser}>`,
    to: email,
    subject: 'Подтверждение регистрации - АСИТ Дейли',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { font-size: 32px; font-weight: bold; color: #1f2937; background: white; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Добро пожаловать в АСИТ Дейли!</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, ${name}!</p>
            <p>Спасибо за регистрацию в приложении АСИТ Дейли для отслеживания АСИТ-терапии препаратом Сталораль.</p>
            <p>Для завершения регистрации введите этот код подтверждения:</p>
            <div class="code">${code}</div>
            <p><strong>Код действителен в течение 15 минут.</strong></p>
            <p>Если вы не регистрировались в АСИТ Дейли, просто проигнорируйте это письмо.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} АСИТ Дейли. Приложение для учёта АСИТ-терапии.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Отправка кода восстановления пароля
export async function sendPasswordResetEmail(email: string, code: string, name: string): Promise<void> {
  const mailOptions = {
    from: `"АСИТ Дейли" <${config.emailUser}>`,
    to: email,
    subject: 'Восстановление пароля - АСИТ Дейли',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { font-size: 32px; font-weight: bold; color: #1f2937; background: white; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Восстановление пароля</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, ${name}!</p>
            <p>Вы запросили восстановление пароля для вашей учётной записи в АСИТ Дейли.</p>
            <p>Используйте этот код для сброса пароля:</p>
            <div class="code">${code}</div>
            <p><strong>Код действителен в течение 15 минут.</strong></p>
            <div class="warning">
              <strong>⚠️ Важно:</strong> Если вы не запрашивали восстановление пароля, немедленно свяжитесь с нами и НЕ ДЕЛИТЕСЬ этим кодом ни с кем!
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} АСИТ Дейли. Приложение для учёта АСИТ-терапии.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Проверка подключения к email серверу
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email сервер подключен');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к email серверу:', error);
    return false;
  }
}
