import Database from 'better-sqlite3';

const db = new Database('/var/www/datatalim/server/data.db');

const links = db.prepare('SELECT id, name, ref_code, clicks, leads_count FROM marketing_links').all();
console.log(JSON.stringify(links, null, 2));

db.close();
