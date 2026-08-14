import { Client } from 'ssh2';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { sshConfig } from './sshConfig.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempFilePath = path.join(__dirname, 'temp_reset_script.mjs');

// A fresh random password every run — never hardcoded, never committed anywhere.
// Pass ADMIN_RESET_PASSWORD=... yourself if you need a specific value.
const newPassword = process.env.ADMIN_RESET_PASSWORD || crypto.randomBytes(9).toString('base64url');

const remoteScriptCode = `
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = '/var/www/datatalim/server/data.db';
const db = new Database(dbPath);

const users = db.prepare('SELECT id, username FROM admin_users').all();
console.log('Current admin users:', JSON.stringify(users));

const newPassword = ${JSON.stringify(newPassword)};
const hash = bcrypt.hashSync(newPassword, 10);

if (users.length === 0) {
    db.prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?)").run(hash);
    console.log('Created new admin user');
} else {
    db.prepare("UPDATE admin_users SET username='admin', password_hash=? WHERE id=1").run(hash);
    console.log('Updated admin password');
}

const updated = db.prepare('SELECT id, username FROM admin_users').all();
console.log('Result:', JSON.stringify(updated));
db.close();
console.log('Done! Login: admin / ' + newPassword);
`;

fs.writeFileSync(tempFilePath, remoteScriptCode);

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    
    conn.sftp((err, sftp) => {
        if (err) {
            cleanup();
            throw err;
        }
        
        const readStream = fs.createReadStream(tempFilePath);
        const writeStream = sftp.createWriteStream('/var/www/datatalim/reset_password.mjs');
        
        writeStream.on('close', () => {
            console.log('Script uploaded successfully. Executing...');
            conn.exec('cd /var/www/datatalim && node reset_password.mjs', (err, stream) => {
                if (err) {
                    cleanup();
                    throw err;
                }
                stream.on('close', () => {
                    console.log('Execution finished.');
                    cleanup();
                    conn.end();
                })
                .on('data', data => console.log(data.toString()))
                .stderr.on('data', data => console.error('STDERR:', data.toString()));
            });
        });
        
        readStream.pipe(writeStream);
    });
}).connect(sshConfig);

function cleanup() {
    try {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('Cleaned up local temporary reset script.');
        }
    } catch (e) {
        console.error('Failed to cleanup temporary file:', e.message);
    }
}
