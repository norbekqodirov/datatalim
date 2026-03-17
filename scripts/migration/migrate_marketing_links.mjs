import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'server', 'data.db');

try {
    const db = new Database(DB_PATH);
    // Check if column exists
    const tableInfo = db.pragma("table_info(marketing_links)");
    const hasCategory = tableInfo.some(col => col.name === 'category');

    if (!hasCategory) {
        db.exec(`ALTER TABLE marketing_links ADD COLUMN category TEXT DEFAULT 'IT'`);
        console.log("Migration successful: Added 'category' column to 'marketing_links'.");
    } else {
        console.log("Migration skipped: 'category' column already exists.");
    }
    db.close();
} catch (e) {
    console.error("Migration failed:", e);
}
