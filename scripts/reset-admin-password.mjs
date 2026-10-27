// Admin parolini tiklash: yangi tasodifiy parol yaratadi, bazaga faqat bcrypt xeshini yozadi,
// parolning o'zini esa terminalga EMAS, Ish stolidagi faylga saqlaydi.
// Ishlatish:  node scripts/reset-admin-password.mjs [username]   (standart: admin)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { getDB } from '../server/db.js';

const username = process.argv[2] || 'admin';

// o'xshash belgilarsiz (0/O, 1/l/I) — qo'lda terish oson bo'lsin
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const chunk = (n) => Array.from({ length: n }, () => ALPHA[crypto.randomInt(ALPHA.length)]).join('');
const password = `Data-${chunk(5)}-${chunk(5)}-${chunk(4)}`;

const db = getDB();
const hash = bcrypt.hashSync(password, 10);
const row = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
if (row) {
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, row.id);
} else {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
}
db.close();

const desktop = path.join(os.homedir(), 'Desktop');
const dir = fs.existsSync(desktop) ? desktop : os.homedir();
const file = path.join(dir, 'DATA-admin-parol.txt');
fs.writeFileSync(
  file,
  [
    'DATA Talim Stansiyasi — admin panel',
    `Login: ${username}`,
    `Parol: ${password}`,
    '',
    "Kirgach Sozlamalar bo'limida o'zingiz bilgan parolga almashtiring va bu faylni o'chiring.",
    '',
  ].join('\r\n'),
  { encoding: 'utf8', mode: 0o600 },
);

console.log(`✅ "${username}" uchun yangi parol o'rnatildi (${row ? 'yangilandi' : 'yaratildi'}).`);
console.log(`📄 Parol shu faylda: ${file}`);
