import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    email: process.env.VAPID_EMAIL || 'mailto:test@example.com',
  },
  // Database type can be 'sqlite', 'mysql', or 'postgres'
  databaseType: process.env.DATABASE_TYPE || 'sqlite',
  databaseUrl: process.env.DATABASE_URL || '',
  // Email configuration
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: process.env.EMAIL_PORT || '587',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
};
