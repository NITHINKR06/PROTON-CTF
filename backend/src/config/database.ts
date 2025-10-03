import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '../../data');
const MAIN_DB = join(DB_DIR, 'main.db');
const CHALLENGE_TEMPLATE = join(DB_DIR, 'challenge_template.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let SQL: any;
export let mainDb: DatabaseWrapper;

async function initSql() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

// Database wrapper to match better-sqlite3 API
class DatabaseWrapper {
  private db: SqlJsDatabase;
  private path: string;

  constructor(db: SqlJsDatabase, path: string) {
    this.db = db;
    this.path = path;
  }

  prepare(sql: string) {
    return {
      run: (...params: any[]) => {
        this.db.run(sql, params);
        this.save();
        return { lastInsertRowid: this.db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
      },
      get: (...params: any[]) => {
        const result = this.db.exec(sql, params);
        if (!result.length || !result[0].values.length) return undefined;
        const row: any = {};
        result[0].columns.forEach((col: any, i: any) => {
          row[col] = result[0].values[0][i];
        });
        return row;
      },
      all: (...params: any[]) => {
        const result = this.db.exec(sql, params);
        if (!result.length) return [];
        return result[0].values.map((row: any) => {
          const obj: any = {};
          result[0].columns.forEach((col: any, i: any) => {
            obj[col] = row[i];
          });
          return obj;
        });
      },
    };
  }

  exec(sql: string) {
    this.db.exec(sql);
    this.save();
  }

  pragma(pragma: string) {
    // No-op for sql.js compatibility
  }

  close() {
    this.save();
    this.db.close();
  }

  private save() {
    const data = this.db.export();
    fs.writeFileSync(this.path, data);
  }
}

async function loadOrCreateDb(path: string): Promise<DatabaseWrapper> {
  await initSql();
  
  if (fs.existsSync(path)) {
    const buffer = fs.readFileSync(path);
    const db = new SQL.Database(buffer);
    return new DatabaseWrapper(db, path);
  } else {
    const db = new SQL.Database();
    return new DatabaseWrapper(db, path);
  }
}

// Initialize main database - CORRECT VERSION WITH ALL TABLES
export async function initMainDb() {
  const db = await loadOrCreateDb(MAIN_DB);
  
  // First, check if the users table exists
  try {
    // Basic tables
    db.exec(`
      -- Create tables if they don't exist
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scores (
        user_id INTEGER PRIMARY KEY,
        points INTEGER NOT NULL,
        solved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS hint_states (
        user_id INTEGER PRIMARY KEY,
        hints_opened TEXT DEFAULT '[]',
        first_hint_opened_at TEXT,
        second_hint_opened_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Check if is_admin column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasIsAdmin = tableInfo.some((col: any) => col.name === 'is_admin');
    
    // Add is_admin column if it doesn't exist
    if (!hasIsAdmin) {
      console.log('Adding is_admin column to users table...');
      db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
    }
    
    // Now create or ensure other tables exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS challenge_status (
        user_id INTEGER PRIMARY KEY,
        started INTEGER DEFAULT 0,
        start_time INTEGER,
        completed INTEGER DEFAULT 0,
        completion_time INTEGER,
        score INTEGER,
        attempts INTEGER DEFAULT 0,
        last_attempt_time INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Create challenge_config table for dynamic flag
      CREATE TABLE IF NOT EXISTS challenge_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        flag TEXT NOT NULL DEFAULT 'FLAG{SQL_INJECTION_MASTER_CHALLENGE_COMPLETE}',
        points INTEGER DEFAULT 500,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      );

      -- Admin tables
      CREATE TABLE IF NOT EXISTS query_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        query TEXT NOT NULL,
        execution_time INTEGER,
        row_count INTEGER,
        flag_found INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT
      );

      -- Default admin settings
      INSERT OR IGNORE INTO admin_settings (key, value, description)
      VALUES 
        ('challenge_enabled', 'true', 'Whether the challenge is enabled for users'),
        ('registration_enabled', 'true', 'Whether new user registration is enabled'),
        ('max_queries_per_user', '1000', 'Maximum number of queries per user');

      -- Insert default flag configuration if not exists
      INSERT OR IGNORE INTO challenge_config (id, flag, points)
      VALUES (1, 'FLAG{SQL_INJECTION_MASTER_CHALLENGE_COMPLETE}', 500);

      -- Create default admin user if none exists
      INSERT OR IGNORE INTO users (username, email, password_hash, is_admin)
      VALUES ('admin', 'admin@example.com', '$2b$10$AjGzuZ.H.dmAf1yLUcjwB.S5iSd4Ajo03QbG0jUc0rkOxQ1kbQoCK', 1);
    `);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }

  return db;
}

// Initialize mainDb
(async () => {
  try {
    console.log('Initializing database...');
    mainDb = await initMainDb();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
})();

// Challenge database template
export async function initializeChallengeTemplate() {
  if (fs.existsSync(CHALLENGE_TEMPLATE)) {
    return;
  }

  await initSql();
  const challengeDb = new SQL.Database();
  
  // MUCH HARDER CHALLENGE DATABASE
  challengeDb.exec(`
    -- Public products table (visible)
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      stock INTEGER DEFAULT 0
    );

    -- Public categories table (visible)
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );

    -- Public reviews table (visible)
    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY,
      product_id INTEGER,
      rating INTEGER,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Hidden admin table (requires discovery)
    CREATE TABLE admin_panel (
      id INTEGER PRIMARY KEY,
      setting_name TEXT NOT NULL,
      setting_value TEXT NOT NULL,
      last_modified TEXT
    );

    -- Hidden security logs (contains hints)
    CREATE TABLE security_audit_logs (
      id INTEGER PRIMARY KEY,
      event_type TEXT,
      event_data TEXT,
      severity TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Super hidden encrypted vault
    CREATE TABLE encrypted_vault (
      id INTEGER PRIMARY KEY,
      vault_key TEXT NOT NULL,
      encrypted_data TEXT NOT NULL,
      encryption_method TEXT,
      access_level INTEGER DEFAULT 99
    );

    -- Decoy flags table (fake flags)
    CREATE TABLE debug_flags (
      id INTEGER PRIMARY KEY,
      flag_name TEXT,
      flag_value TEXT,
      is_active INTEGER DEFAULT 0
    );

    -- Hidden system config
    CREATE TABLE system_internal_config (
      config_id TEXT PRIMARY KEY,
      config_data TEXT NOT NULL,
      config_type TEXT,
      restricted INTEGER DEFAULT 1
    );

    -- Insert public data
    INSERT INTO categories (id, name, description) VALUES
      (1, 'Electronics', 'Electronic devices and accessories'),
      (2, 'Books', 'Physical and digital books'),
      (3, 'Clothing', 'Fashion and apparel'),
      (4, 'Home', 'Home and garden products');

    INSERT INTO products (id, name, price, description, category, stock) VALUES
      (1, 'Laptop Pro X1', 1299.99, 'High-performance laptop with 16GB RAM', 'Electronics', 15),
      (2, 'Wireless Mouse', 29.99, 'Ergonomic wireless mouse', 'Electronics', 50),
      (3, 'Programming Guide', 49.99, 'Complete guide to modern programming', 'Books', 100),
      (4, 'Security Handbook', 39.99, 'Cybersecurity best practices', 'Books', 75),
      (5, 'Developer T-Shirt', 19.99, 'Code, Sleep, Repeat design', 'Clothing', 200),
      (6, 'Coffee Mug', 12.99, 'World''s Best Developer mug', 'Home', 150),
      (7, 'Mechanical Keyboard', 89.99, 'RGB mechanical keyboard', 'Electronics', 30),
      (8, 'Standing Desk', 399.99, 'Adjustable height desk', 'Home', 10);

    INSERT INTO reviews (id, product_id, rating, comment) VALUES
      (1, 1, 5, 'Excellent laptop, very fast!'),
      (2, 1, 4, 'Good but expensive'),
      (3, 2, 5, 'Perfect for daily use'),
      (4, 3, 5, 'Very informative book'),
      (5, 4, 4, 'Good security tips'),
      (6, 5, 5, 'Comfortable shirt'),
      (7, 6, 3, 'Mug is okay, nothing special'),
      (8, 7, 5, 'Best keyboard I''ve used');

    -- Insert hidden admin data
    INSERT INTO admin_panel (id, setting_name, setting_value, last_modified) VALUES
      (1, 'maintenance_mode', 'false', '2024-01-20 10:00:00'),
      (2, 'debug_mode', 'false', '2024-01-20 10:00:00'),
      (3, 'api_rate_limit', '100', '2024-01-20 10:00:00'),
      (4, 'encryption_key', 'AES256:7h3_k3y_15_n07_h3r3', '2024-01-20 10:00:00'),
      (5, 'vault_access_code', 'VAULT_2024_SECURE', '2024-01-20 10:00:00');

    -- Insert security logs with hints
    INSERT INTO security_audit_logs (id, event_type, event_data, severity, timestamp) VALUES
      (1, 'SYSTEM_START', 'System initialized successfully', 'INFO', '2024-01-20 08:00:00'),
      (2, 'CONFIG_CHANGE', 'Vault encryption updated to ROT13+Base64', 'WARNING', '2024-01-20 09:00:00'),
      (3, 'ACCESS_ATTEMPT', 'Failed access to encrypted_vault table', 'ERROR', '2024-01-20 10:00:00'),
      (4, 'SECURITY_SCAN', 'Flag components distributed across multiple tables', 'INFO', '2024-01-20 11:00:00'),
      (5, 'ENCRYPTION_UPDATE', 'Flag format: Combine system_internal_config entries with config_type="flag_segment"', 'INFO', '2024-01-20 12:00:00'),
      (6, 'AUDIT_NOTE', 'Order segments by config_id for correct flag', 'DEBUG', '2024-01-20 13:00:00');

    -- Insert encrypted vault data (ROT13 + Base64 encoded)
    INSERT INTO encrypted_vault (id, vault_key, encrypted_data, encryption_method, access_level) VALUES
      (1, 'api_keys', 'cGF5bWVudF9hcGlfa2V5XzIwMjQ=', 'BASE64', 50),
      (2, 'admin_passwords', 'YWRtaW5fcGFzc3dvcmRfaGFzaGVz', 'BASE64', 75),
      (3, 'secret_data', 'U3lGTVIxOWZWMU5mVjBGT1ZFVkVYekl3TWpSZg==', 'ROT13_BASE64', 99),
      (4, 'backup_codes', 'YmFja3VwX2NvZGVzXzIwMjRfdjI=', 'BASE64', 60),
      (5, 'master_key', 'bWFzdGVyX2tleV9mb3JfYWxsX3NlY3JldHM=', 'BASE64', 90);

    -- Insert decoy flags (fake ones to confuse)
    INSERT INTO debug_flags (id, flag_name, flag_value, is_active) VALUES
      (1, 'test_flag', 'FLAG{this_is_not_the_real_flag}', 0),
      (2, 'dev_flag', 'FLAG{development_flag_ignore}', 0),
      (3, 'staging_flag', 'FLAG{staging_environment_2024}', 0),
      (4, 'debug_flag', 'FLAG{debug_mode_enabled_false}', 0),
      (5, 'temp_flag', 'FLAG{temporary_flag_for_testing}', 0);

    -- Insert the REAL flag segments (requires complex UNION and ordering)
    INSERT INTO system_internal_config (config_id, config_data, config_type, restricted) VALUES
      ('A001', 'RkxBR3', 'flag_segment', 1),
      ('A002', 'tTUUxf', 'flag_segment', 1),
      ('A003', 'SU5KRUN', 'flag_segment', 1),
      ('A004', 'USU9OX0', 'flag_segment', 1),
      ('A005', 'VYQVJUX0', 'flag_segment', 1),
      ('A006', '0hBTExFTkd', 'flag_segment', 1),
      ('A007', 'FX0NPTVBMRVRFfQ==', 'flag_segment', 1),
      ('B001', 'system_version', 'metadata', 0),
      ('B002', 'database_schema', 'metadata', 0),
      ('C001', 'encryption_salt', 'security', 1);

    -- Create a view that looks innocent but is actually useless
    CREATE VIEW product_summary AS
      SELECT p.name, p.price, c.name as category
      FROM products p
      JOIN categories c ON p.category = c.name;
  `);

  const data = challengeDb.export();
  fs.writeFileSync(CHALLENGE_TEMPLATE, data);
  challengeDb.close();
}

// Create user-specific challenge database
export async function createUserChallengeDb(userId: number): Promise<DatabaseWrapper> {
  await initializeChallengeTemplate();
  
  const userDbPath = join(DB_DIR, `challenge_${userId}.db`);
  
  if (!fs.existsSync(userDbPath)) {
    fs.copyFileSync(CHALLENGE_TEMPLATE, userDbPath);
  }
  
  return loadOrCreateDb(userDbPath);
}

// Get user challenge database
export async function getUserChallengeDb(userId: number): Promise<DatabaseWrapper> {
  const userDbPath = join(DB_DIR, `challenge_${userId}.db`);
  
  if (!fs.existsSync(userDbPath)) {
    return createUserChallengeDb(userId);
  }
  
  return loadOrCreateDb(userDbPath);
}

// Export a function to check if database is ready
export function isDatabaseReady(): boolean {
  return !!mainDb;
}

// Initialize challenge template after main db is ready
(async () => {
  // Wait for main db to be ready first
  const checkInterval = setInterval(() => {
    if (mainDb) {
      clearInterval(checkInterval);
      initializeChallengeTemplate().catch(err => {
        console.error('Failed to initialize challenge template:', err);
      });
    }
  }, 100);
  
  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 10000);
})();