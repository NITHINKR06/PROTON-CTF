import bcrypt from 'bcrypt';
import { mainDb } from '../config/database.js';

const command = process.argv[2];
const username = process.argv[3];
const email = process.argv[4];
const password = process.argv[5];

async function waitForDb() {
  while (!mainDb) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function listUsers() {
  await waitForDb();
  
  console.log('\n📋 Users in database:');
  const stmt = mainDb.prepare('SELECT id, username, email, is_admin, created_at FROM users');
  const users = stmt.all();
  
  if (users.length === 0) {
    console.log('No users found');
  } else {
    console.log('\n┌────┬──────────────┬──────────────────────┬─────────┬─────────────────────┐');
    console.log('│ ID │   Username   │        Email         │  Admin  │     Created At      │');
    console.log('├────┼──────────────┼──────────────────────┼─────────┼─────────────────────┤');
    users.forEach((u: any) => {
      const id = u.id.toString().padEnd(2);
      const uname = (u.username || '').padEnd(12);
      const mail = (u.email || '').padEnd(20);
      const admin = (u.is_admin ? 'Yes' : 'No').padEnd(7);
      const created = u.created_at || 'N/A';
      console.log(`│ ${id} │ ${uname} │ ${mail} │ ${admin} │ ${created} │`);
    });
    console.log('└────┴──────────────┴──────────────────────┴─────────┴─────────────────────┘');
  }
}

async function addUser() {
  if (!username || !email || !password) {
    console.error('❌ Usage: npm run manage-users add <username> <email> <password>');
    process.exit(1);
  }
  
  await waitForDb();
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const stmt = mainDb.prepare(`
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES (?, ?, ?, 0)
    `);
    stmt.run(username, email, passwordHash);
    console.log(`✅ User '${username}' created successfully!`);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.error('❌ Username or email already exists');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  }
}

async function deleteUser() {
  if (!username) {
    console.error('❌ Usage: npm run manage-users delete <username>');
    process.exit(1);
  }
  
  await waitForDb();
  
  try {
    // Get user ID
    const getUserStmt = mainDb.prepare('SELECT id FROM users WHERE username = ?');
    const user = getUserStmt.get(username);
    
    if (!user) {
      console.error(`❌ User '${username}' not found`);
      process.exit(1);
    }
    
    const userId = user.id;
    
    // Delete related data
    console.log(`🗑️ Deleting data for user '${username}'...`);
    
    const tables = [
      'scores',
      'hint_states',
      'challenge_status',
      'query_logs',
      'flag_attempts'
    ];
    
    for (const table of tables) {
      const stmt = mainDb.prepare(`DELETE FROM ${table} WHERE user_id = ?`);
      stmt.run(userId);
    }
    
    // Delete user
    const deleteUserStmt = mainDb.prepare('DELETE FROM users WHERE id = ?');
    deleteUserStmt.run(userId);
    
    console.log(`✅ User '${username}' deleted successfully!`);
  } catch (error: any) {
    console.error('❌ Error deleting user:', error.message);
  }
}

async function resetPassword() {
  if (!username || !password) {
    console.error('❌ Usage: npm run manage-users reset <username> <new-password>');
    process.exit(1);
  }
  
  await waitForDb();
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const stmt = mainDb.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
    const result = stmt.run(passwordHash, username);
    
    if (result.lastInsertRowid === 0) {
      console.error(`❌ User '${username}' not found`);
    } else {
      console.log(`✅ Password reset successfully for user '${username}'!`);
    }
  } catch (error: any) {
    console.error('❌ Error resetting password:', error.message);
  }
}

async function deleteAllUsers() {
  await waitForDb();
  
  try {
    console.log('⚠️ WARNING: This will delete ALL users from the database!');
    
    // Delete all related data first
    const tables = [
      'scores',
      'hint_states', 
      'challenge_status',
      'query_logs',
      'flag_attempts'
    ];
    
    for (const table of tables) {
      const stmt = mainDb.prepare(`DELETE FROM ${table}`);
      stmt.run();
      console.log(`  Cleared table: ${table}`);
    }
    
    // Delete all users
    const stmt = mainDb.prepare('DELETE FROM users');
    stmt.run();
    
    console.log('✅ All users deleted successfully!');
  } catch (error: any) {
    console.error('❌ Error deleting users:', error.message);
  }
}

async function main() {
  try {
    switch (command) {
      case 'list':
        await listUsers();
        break;
      case 'add':
        await addUser();
        await listUsers();
        break;
      case 'delete':
        await deleteUser();
        await listUsers();
        break;
      case 'reset':
        await resetPassword();
        break;
      case 'delete-all':
        await deleteAllUsers();
        await listUsers();
        break;
      default:
        console.log(`
📚 User Management Script

Usage:
  npx tsx src/scripts/manageUsers.ts <command> [options]

Commands:
  list                              - List all users
  add <username> <email> <password> - Add a new user
  delete <username>                 - Delete a user
  reset <username> <new-password>   - Reset user password
  delete-all                        - Delete ALL users (use with caution!)

Examples:
  npx tsx src/scripts/manageUsers.ts list
  npx tsx src/scripts/manageUsers.ts add john john@example.com password123
  npx tsx src/scripts/manageUsers.ts delete john
  npx tsx src/scripts/manageUsers.ts reset admin newpassword123
  npx tsx src/scripts/manageUsers.ts delete-all
        `);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

main();
