import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/main.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

async function migrate() {
  console.log('Starting database migration...');

  try {
    // Check if attempts column exists, if not add it
    try {
      const testStmt = db.prepare('SELECT attempts FROM challenge_status LIMIT 1');
      testStmt.get();
      console.log('Column "attempts" already exists');
    } catch (e) {
      console.log('Adding "attempts" column...');
      db.exec(`
        ALTER TABLE challenge_status 
        ADD COLUMN attempts INTEGER DEFAULT 0
      `);
      console.log('Column "attempts" added successfully');
    }

    // Check if last_attempt_time column exists, if not add it
    try {
      const testStmt = db.prepare('SELECT last_attempt_time FROM challenge_status LIMIT 1');
      testStmt.get();
      console.log('Column "last_attempt_time" already exists');
    } catch (e) {
      console.log('Adding "last_attempt_time" column...');
      db.exec(`
        ALTER TABLE challenge_status 
        ADD COLUMN last_attempt_time INTEGER
      `);
      console.log('Column "last_attempt_time" added successfully');
    }

    console.log('Migration completed successfully!');
    
    // Verify the schema
    const schemaStmt = db.prepare(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='challenge_status'
    `);
    const schema = schemaStmt.get();
    console.log('\nCurrent challenge_status schema:');
    console.log(schema);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  db.close();
  process.exit(0);
}

migrate();
