import { getDB, initDB } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initialCourses = fs.readFileSync(path.join(__dirname, 'initialData', 'courses.json'), 'utf8');
const initialTeam = fs.readFileSync(path.join(__dirname, 'initialData', 'team.json'), 'utf8');
const initialSiteContent = fs.readFileSync(path.join(__dirname, 'initialData', 'siteContent.json'), 'utf8');
const initialVisibility = fs.readFileSync(path.join(__dirname, 'initialData', 'visibility.json'), 'utf8');

initDB();

const db = getDB();

const upsert = db.prepare(`
  INSERT INTO app_data (key, value, updated_at) 
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
`);

const seed = db.transaction(() => {
  upsert.run('courses', initialCourses);
  upsert.run('team', initialTeam);
  upsert.run('site_content', initialSiteContent);
  upsert.run('visibility', initialVisibility);
});

seed();

console.log('✅ Database seeded successfully!');
db.close();
