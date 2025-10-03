import bcrypt from 'bcrypt';
import { mainDb } from '../config/database.js';

async function resetAdminPassword() {
  try {
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new password hash for "admin123"
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    console.log('Generated password hash for "admin123":', passwordHash);
    
    // Update admin user password
    const stmt = mainDb.prepare(`
      UPDATE users 
      SET password_hash = ? 
      WHERE username = 'admin'
    `);
    
    const result = stmt.run(passwordHash);
    console.log('Admin password updated successfully');
    
    // Verify the admin user exists and has admin privileges
    const checkStmt = mainDb.prepare(`
      SELECT id, username, email, is_admin 
      FROM users 
      WHERE username = 'admin'
    `);
    
    const adminUser = checkStmt.get();
    console.log('Admin user details:', adminUser);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
