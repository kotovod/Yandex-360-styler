import { Sequelize } from 'sequelize';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Функция инициализации Sequelize (вызывается после загрузки .env)
function initializeSequelize(): Sequelize {
  const dialect = process.env.DB_DIALECT || 'sqlite';
  
  console.log('🔧 Initializing database...');
  console.log('📊 Dialect:', dialect);
  
  if (dialect === 'mysql') {
    // MySQL configuration
    console.log('📊 MySQL Host:', process.env.DB_HOST);
    console.log('📊 MySQL Database:', process.env.DB_NAME);
    console.log('📊 MySQL User:', process.env.DB_USER);
    
    return new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME!,
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  } else {
    // SQLite configuration (default for development)
    const dataDir = join(__dirname, '..', '..', 'data');
    try {
      mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }
    
    const dbPath = join(dataDir, 'asit_daily.db');
    console.log('📊 SQLite path:', dbPath);
    
    return new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: false,
    });
  }
}

// Экспортируем sequelize (инициализация произойдёт при первом обращении)
export const sequelize = initializeSequelize();

// Test connection
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Sync database (create tables)
export async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database sync failed:', error);
    throw error;
  }
}
