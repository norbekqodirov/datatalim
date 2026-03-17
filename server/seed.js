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

import bcrypt from 'bcrypt';

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

  // Seed default admin user if none exists
  const existingAdmins = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
  if (existingAdmins === 0) {
    const defaultPassword = 'admin'; // We will use 'admin' for simplicity in this demo, user can change later if needed
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(defaultPassword, saltRounds);

    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (username, password_hash)
      VALUES (?, ?)
    `);
    insertAdmin.run('admin', passwordHash);
    console.log('👤 Default admin user created (Username: admin, Password: admin)');
  }
});

seed();

console.log('✅ Database seeded successfully!');
db.close();
