#!/usr/bin/env node

/**
 * Утилита для управления пользователями в базе данных
 * Использование:
 *   node scripts/manage-users.js list              - Показать всех пользователей
 *   node scripts/manage-users.js delete <email>    - Удалить пользователя
 *   node scripts/manage-users.js clear             - Удалить ВСЕХ пользователей
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, '../data/asit_daily.db');

const db = new Database(dbPath);

const command = process.argv[2];
const arg = process.argv[3];

function listUsers() {
  console.log('\n📋 Список пользователей:\n');
  
  const users = db.prepare(`
    SELECT id, email, name, email_verified, created_at 
    FROM users 
    ORDER BY created_at DESC
  `).all();

  if (users.length === 0) {
    console.log('❌ Нет пользователей в базе\n');
    return;
  }

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   Имя: ${user.name}`);
    console.log(`   Email подтверждён: ${user.email_verified ? '✅ Да' : '❌ Нет'}`);
    console.log(`   Создан: ${new Date(user.created_at).toLocaleString('ru-RU')}`);
    console.log(`   ID: ${user.id}\n`);
  });

  console.log(`Всего пользователей: ${users.length}\n`);
}

function deleteUser(email) {
  if (!email) {
    console.error('❌ Укажите email пользователя для удаления');
    process.exit(1);
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user) {
    console.error(`❌ Пользователь с email ${email} не найден`);
    process.exit(1);
  }

  // Удаляем пользователя (CASCADE удалит связанные данные)
  db.prepare('DELETE FROM users WHERE email = ?').run(email);
  
  console.log(`✅ Пользователь ${email} (${user.name}) успешно удалён\n`);
}

function clearAllUsers() {
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  
  if (count === 0) {
    console.log('❌ База пользователей уже пуста\n');
    return;
  }

  console.log(`⚠️  Будет удалено пользователей: ${count}`);
  console.log('⚠️  Это действие нельзя отменить!');
  console.log('⚠️  Для подтверждения запустите: node scripts/manage-users.js clear-confirmed\n');
}

function clearAllUsersConfirmed() {
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  db.prepare('DELETE FROM users').run();
  console.log(`✅ Удалено пользователей: ${count}\n`);
}

// Главная логика
switch (command) {
  case 'list':
    listUsers();
    break;
  
  case 'delete':
    deleteUser(arg);
    break;
  
  case 'clear':
    clearAllUsers();
    break;
  
  case 'clear-confirmed':
    clearAllUsersConfirmed();
    break;
  
  default:
    console.log(`
📚 Утилита управления пользователями

Использование:
  node scripts/manage-users.js list              - Показать всех пользователей
  node scripts/manage-users.js delete <email>    - Удалить пользователя
  node scripts/manage-users.js clear             - Удалить ВСЕХ пользователей

Примеры:
  node scripts/manage-users.js list
  node scripts/manage-users.js delete user@example.com
  node scripts/manage-users.js clear-confirmed
`);
    break;
}

db.close();
