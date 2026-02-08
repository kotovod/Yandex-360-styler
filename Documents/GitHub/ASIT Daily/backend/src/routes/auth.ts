import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, VerificationCode } from '../models/index.js';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  generateVerificationCode 
} from '../services/emailService.js';
import { Op } from 'sequelize';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email уже существует',
        code: 'USER_EXISTS',
        suggestion: 'forgot_password'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (email_verified = false)
    const user = await User.create({
      email,
      password_hash: passwordHash,
      name,
      email_verified: false,
    });

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    await VerificationCode.create({
      email,
      code,
      type: 'email_verification',
      expires_at: expiresAt,
      used: false,
    });

    // Send verification email
    try {
      console.log(`📧 Отправка кода подтверждения для: ${email}`);
      console.log(`🔑 Код подтверждения: ${code}`);
      await sendVerificationEmail(email, code, name);
      console.log(`✅ Email успешно отправлен на ${email}`);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      console.log(`⚠️ Письмо не отправлено, но КОД СОХРАНЁН В БАЗЕ: ${code}`);
      // Продолжаем даже если письмо не отправилось
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.createdAt,
      },
      message: 'Код подтверждения отправлен на email',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Email не подтвержден. Проверьте почту и введите код подтверждения.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Verify Email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email и код обязательны' });
    }

    // Find valid verification code
    const verification = await VerificationCode.findOne({
      where: {
        email,
        code,
        type: 'email_verification',
        used: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!verification) {
      return res.status(400).json({ error: 'Неверный или истёкший код' });
    }

    // Mark code as used
    await verification.update({ used: true });

    // Update user email_verified
    const user = await User.findOne({ where: { email } });
    if (user) {
      await user.update({ email_verified: true });
    }

    res.json({ 
      success: true, 
      message: 'Email успешно подтверждён',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Ошибка подтверждения email' });
  }
});

// Resend Verification Code
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email уже подтверждён' });
    }

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await VerificationCode.create({
      email,
      code,
      type: 'email_verification',
      expires_at: expiresAt,
      used: false,
    });

    // Send email
    await sendVerificationEmail(email, code, user.name);

    res.json({ 
      success: true, 
      message: 'Код отправлен повторно',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Ошибка отправки кода' });
  }
});

// Request Password Reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь с таким email не найден',
      });
    }

    // Generate reset code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await VerificationCode.create({
      email,
      code,
      type: 'password_reset',
      expires_at: expiresAt,
      used: false,
    });

    // Send email
    try {
      console.log(`📧 Отправка кода восстановления для: ${email}`);
      console.log(`🔑 Код восстановления: ${code}`);
      await sendPasswordResetEmail(email, code, user.name);
      console.log(`✅ Email восстановления отправлен на ${email}`);
    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      console.log(`⚠️ Письмо не отправлено, но КОД СОХРАНЁН В БАЗЕ: ${code}`);
      // Продолжаем даже если письмо не отправилось
    }

    res.json({ 
      success: true, 
      message: 'Код восстановления отправлен на email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Ошибка отправки кода' });
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Find valid reset code
    const verification = await VerificationCode.findOne({
      where: {
        email,
        code,
        type: 'password_reset',
        used: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!verification) {
      return res.status(400).json({ error: 'Неверный или истёкший код' });
    }

    // Mark code as used
    await verification.update({ used: true });

    // Update user password
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: passwordHash });

    res.json({ 
      success: true, 
      message: 'Пароль успешно изменён',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Ошибка сброса пароля' });
  }
});

export default router;
