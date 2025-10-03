import bcrypt from 'bcrypt';
import { mainDb } from '../config/database.js';

async function testAdminLogin() {
  try {
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Testing admin login...');
    
    // Get admin user from database
    const stmt = mainDb.prepare(`
      SELECT id, username, email, password_hash, is_admin
      FROM users
      WHERE username = ?
    `);
    
    const adminUser = stmt.get('admin');
    console.log('Admin user found:', adminUser ? 'Yes' : 'No');
    
    if (adminUser) {
      console.log('Admin details:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        is_admin: adminUser.is_admin,
        password_hash_length: adminUser.password_hash?.length
      });
      
      // Test password verification
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
      console.log(`Password 'admin123' is valid:`, isValid);
      
      // Test with a wrong password
      const wrongValid = await bcrypt.compare('wrongpassword', adminUser.password_hash);
      console.log(`Password 'wrongpassword' is valid:`, wrongValid);
    }
    
    // List all users
    const allUsersStmt = mainDb.prepare('SELECT id, username, email, is_admin FROM users');
    const allUsers = allUsersStmt.all();
    console.log('\nAll users in database:');
    allUsers.forEach((user: any) => {
      console.log(`- ${user.username} (${user.email}) - Admin: ${user.is_admin ? 'Yes' : 'No'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing admin login:', error);
    process.exit(1);
  }
}

testAdminLogin();
