import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { testConnection, syncDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import therapyRoutes from './routes/therapy.js';
import notificationsRoutes from './routes/notifications.js';
import exportRoutes from './routes/export.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const dbType = process.env.DB_DIALECT || 'sqlite';
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    database: dbType.toUpperCase(),
    message: '✅ Backend полностью работает!'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/export', exportRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Start server
async function start() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Sync database
    await syncDatabase();

    // Start server
    app.listen(config.port, () => {
      console.log('\n🎉 ============================================');
      console.log('✅ АСИТ Дейли - Backend готов!');
      console.log('============================================');
      console.log(`🔧 API сервер: http://localhost:${config.port}`);
      console.log(`📱 Frontend:   http://localhost:5173`);
      console.log(`💾 База данных: SQLite (разработка)`);
      console.log('============================================');
      console.log('\n📋 Доступные эндпоинты:');
      console.log('  POST /api/auth/register');
      console.log('  POST /api/auth/login');
      console.log('  GET  /api/therapy/current');
      console.log('  POST /api/therapy/start');
      console.log('  POST /api/therapy/take-dose');
      console.log('  GET  /api/therapy/history');
      console.log('  POST /api/therapy/side-effect');
      console.log('  POST /api/notifications/subscribe');
      console.log('  GET  /api/export/data');
      console.log('\n💡 Откройте http://localhost:5173 и зарегистрируйтесь!\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
