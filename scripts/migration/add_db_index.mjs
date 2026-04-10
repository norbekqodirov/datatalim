import Database from 'better-sqlite3';

console.log('Opening database...');
const db = new Database('data.db');

try {
    console.log('Creating index on ref_code...');
    db.prepare('CREATE INDEX IF NOT EXISTS idx_marketing_links_ref_code ON marketing_links(ref_code);').run();
    console.log('Index created successfully!');
} catch (e) {
    console.error('Error creating index:', e);
}

db.close();
