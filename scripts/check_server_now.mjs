import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const conn = new Client();

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let out = '';
            stream.on('close', () => resolve(out))
                .on('data', d => { out += d.toString(); process.stdout.write(d); })
                .stderr.on('data', d => process.stderr.write(d));
        });
    });
}

function uploadFile(sftp, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        console.log(`📤 ${path.basename(localPath)} → ${remotePath}`);
        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) reject(err);
            else { console.log(`  ✅ uploaded`); resolve(); }
        });
    });
}

conn.on('ready', async () => {
    console.log('🔗 SSH Connected\n');
    conn.sftp(async (err, sftp) => {
        if (err) throw err;
        try {
            // 1. Upload backend
            console.log('--- Backend deploy ---');
            await uploadFile(sftp, path.join(projectRoot, 'server/index.js'), '/var/www/datatalim/server/index.js');

            // 2. Restart PM2 (backend restart)
            console.log('\n--- Restarting PM2 ---');
            await exec(conn, 'pm2 restart all 2>&1 | tail -5');

            // 3. Frontend: safe atomic deploy
            console.log('\n--- Frontend deploy ---');
            await uploadFile(sftp, path.join(projectRoot, 'update.tar.gz'), '/var/www/datatalim/update.tar.gz');

            await exec(conn, 'mkdir -p /var/www/datatalim/dist_new && cd /var/www/datatalim/dist_new && tar -xzf ../update.tar.gz');
            await exec(conn, 'ls /var/www/datatalim/dist_new/ | head -3');

            // Atomic swap
            await exec(conn, 'rm -rf /var/www/datatalim/dist_backup && mv /var/www/datatalim/dist /var/www/datatalim/dist_backup && mv /var/www/datatalim/dist_new /var/www/datatalim/dist && rm -f /var/www/datatalim/update.tar.gz');

            console.log('\n✅ Deploy complete!');
            await exec(conn, 'ls /var/www/datatalim/dist/');
        } catch (e) {
            console.error('❌ Error:', e.message);
            // Rollback if dist is missing
            await exec(conn, '[ -d /var/www/datatalim/dist ] || (mv /var/www/datatalim/dist_new /var/www/datatalim/dist 2>/dev/null || mv /var/www/datatalim/dist_backup /var/www/datatalim/dist 2>/dev/null); echo "Rollback done"').catch(() => { });
        }
        conn.end();
    });
}).connect({ host: '188.225.74.65', port: 22, username: 'root', password: 'y,Qx9i6-dWMNCi' });
