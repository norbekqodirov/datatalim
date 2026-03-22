import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_PATH = path.join(__dirname, 'data.db');

export function getDB() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

export function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_data(
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS marketing_links(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ref_code TEXT UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    category TEXT DEFAULT 'IT',
    clicks INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS leads(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    course_id TEXT,
    source_ref TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS admin_users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `);

  // Migrations: add columns if they don't exist
  try {
    db.prepare("SELECT status FROM leads LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new'");
    console.log('  → Added status column to leads');
  }
  try {
    db.prepare("SELECT notes FROM leads LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE leads ADD COLUMN notes TEXT DEFAULT ''");
    console.log('  → Added notes column to leads');
  }

  // FAQs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_uz TEXT NOT NULL DEFAULT '',
      question_ru TEXT DEFAULT '',
      question_en TEXT DEFAULT '',
      answer_uz TEXT NOT NULL DEFAULT '',
      answer_ru TEXT DEFAULT '',
      answer_en TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Testimonials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_uz TEXT NOT NULL DEFAULT '',
      name_ru TEXT DEFAULT '',
      name_en TEXT DEFAULT '',
      role_uz TEXT DEFAULT '',
      role_ru TEXT DEFAULT '',
      role_en TEXT DEFAULT '',
      text_uz TEXT DEFAULT '',
      text_ru TEXT DEFAULT '',
      text_en TEXT DEFAULT '',
      image TEXT DEFAULT '',
      rating INTEGER DEFAULT 5,
      video_id TEXT DEFAULT '',
      type TEXT DEFAULT 'text',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Lead activities table (audit trail)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_activities(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      old_value TEXT DEFAULT '',
      new_value TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Lead scores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_scores(
      lead_id INTEGER PRIMARY KEY,
      score INTEGER DEFAULT 0,
      grade TEXT DEFAULT 'Unqualified',
      factors TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Enrollments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      course_id TEXT NOT NULL,
      payment_status TEXT DEFAULT 'unpaid',
      payment_amount INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT ''
    );
  `);

  // Blog posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_uz TEXT NOT NULL DEFAULT '',
      title_ru TEXT DEFAULT '',
      title_en TEXT DEFAULT '',
      slug TEXT UNIQUE NOT NULL,
      content_uz TEXT DEFAULT '',
      content_ru TEXT DEFAULT '',
      content_en TEXT DEFAULT '',
      excerpt_uz TEXT DEFAULT '',
      excerpt_ru TEXT DEFAULT '',
      excerpt_en TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin user if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (adminCount.count === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(defaultPassword, 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('  → Default admin user created (username: admin, password: admin123)');
  }

  console.log('✅ Database initialized at:', DB_PATH);
  db.close();
}
