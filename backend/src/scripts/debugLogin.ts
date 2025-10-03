import bcrypt from 'bcrypt';
import { mainDb } from '../config/database.js';

async function debugLogin() {
  try {
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const usernameOrEmail = 'admin';
    const password = 'admin123';
    
    console.log('Attempting login with:', { usernameOrEmail, password });
    
    // Simulate the exact query from loginUser function
    const stmt = mainDb.prepare(`
      SELECT id, username, email, password_hash, is_admin
      FROM users
      WHERE username = ? OR email = ?
    `);

    const user = stmt.get(usernameOrEmail, usernameOrEmail);
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      password_hash: user.password_hash
    });
    
    // Test password comparison
    console.log('\nTesting password comparison...');
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', valid);
    
    // Generate a new hash for comparison
    console.log('\nGenerating fresh hash for admin123...');
    const freshHash = await bcrypt.hash('admin123', 10);
    console.log('Fresh hash:', freshHash);
    
    // Test with fresh hash
    const testWithFresh = await bcrypt.compare('admin123', freshHash);
    console.log('Test with fresh hash:', testWithFresh);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugLogin();
