const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

let dbInterface = null;

if (DB_TYPE === 'mysql') {
  const mysql = require('mysql2/promise');
  
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'form_builder_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  dbInterface = {
    type: 'mysql',
    async init() {
      console.log('Connected to MySQL database.');
    },
    async query(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    async get(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },
    async run(sql, params = []) {
      const [result] = await pool.execute(sql, params);
      return { lastInsertRowid: result.insertId, changes: result.affectedRows };
    }
  };
} else {
  // Built-in Node.js SQLite
  const { DatabaseSync } = require('node:sqlite');
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'forms.db');
  const sqlite = new DatabaseSync(dbPath);

  // Initialize SQLite tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT 'Creator',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT 'Untitled Form',
      description TEXT DEFAULT '',
      fields_json TEXT NOT NULL,
      theme_json TEXT DEFAULT '{}',
      settings_json TEXT DEFAULT '{}',
      public_slug TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(public_slug);
    CREATE INDEX IF NOT EXISTS idx_responses_form ON responses(form_id);
  `);

  dbInterface = {
    type: 'sqlite',
    async init() {
      console.log(`Connected to SQLite database at ${dbPath}`);
    },
    async query(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      return stmt.all(...params);
    },
    async get(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      return stmt.get(...params) || null;
    },
    async run(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      const info = stmt.run(...params);
      return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
    }
  };
}

module.exports = dbInterface;
