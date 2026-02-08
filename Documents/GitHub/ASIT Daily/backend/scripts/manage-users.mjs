#!/usr/bin/env node

/**
 * Утилита для управления пользователями
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/asit_daily.db');

const command = process.argv[2];
const arg = process.argv[3];

async function runSQL(sql) {
  try {
    const { stdout } = await execAsync(`sqlite3 "${dbPath}" "${sql}"`);
    return stdout;
  } catch (error) {
    console.error('Ошибка выполнения SQL:', error.message);
    process.exit(1);
  }
}

async function listUsers() {
  console.log('\n📋 Список пользователей:\n');
  
  const result = await runSQL(`
    SELECT email, name, email_verified, created_at 
    FROM users 
    ORDER BY created_at DESC;
  `);

  if (!result.trim()) {
    console.log('❌ Нет пользователей в базе\n');
    return;
  }

  const lines = result.trim().split('\n');
  lines.forEach((line, index) => {
    const [email, name, verified, created] = line.split('|');
    console.log(`${index + 1}. ${email}`);
    console.log(`   Имя: ${name}`);
    console.log(`   Email подтверждён: ${verified === '1' ? '✅ Да' : '❌ Нет'}`);
    console.log(`   Создан: ${new Date(created).toLocaleString('ru-RU')}\n`);
  });

  console.log(`Всего пользователей: ${lines.length}\n`);
}

async function deleteUser(email) {
  if (!email) {
    console.error('❌ Укажите email пользователя');
    process.exit(1);
  }

  await runSQL(`DELETE FROM users WHERE email = '${email}';`);
  console.log(`✅ Пользователь ${email} удалён\n`);
}

async function clearAll() {
  await runSQL('DELETE FROM users;');
  console.log('✅ Все пользователи удалены\n');
}

// Главная логика
(async () => {
  switch (command) {
    case 'list':
      await listUsers();
      break;
    
    case 'delete':
      await deleteUser(arg);
      break;
    
    case 'clear':
      await clearAll();
      break;
    
    default:
      console.log(`
📚 Утилита управления пользователями

Использование:
  npm run users:list              - Показать всех
  npm run users:delete <email>    - Удалить одного
  npm run users:clear             - Удалить всех

Примеры:
  npm run users:list
  npm run users:delete user@example.com
  npm run users:clear
`);
      break;
  }
})();
