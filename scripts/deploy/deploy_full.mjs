import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

function uploadFile(sftp, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        log(`📤 Uploading ${localPath} -> ${remotePath}`);
        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) reject(err);
            else { log(`  ✅ ${localPath} uploaded`); resolve(); }
        });
    });
}

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) reject(err);
            let out = '';
            stream.on('close', () => resolve(out))
                .on('data', d => { out += d.toString(); process.stdout.write(d); })
                .stderr.on('data', d => process.stderr.write(d));
        });
    });
}

conn.on('ready', () => {
    log('🔗 SSH Connected');
    conn.sftp(async (err, sftp) => {
        if (err) throw err;
        try {
            // 1. Frontend: upload tar.gz and extract
            await uploadFile(sftp, 'update.tar.gz', '/var/www/datatalim/update.tar.gz');
            log('\n📦 Extracting frontend...');
            await exec(conn, 'cd /var/www/datatalim && rm -rf dist_backup && mv dist dist_backup && mkdir dist && cd dist && tar -xzf ../update.tar.gz && rm ../update.tar.gz');

            // 2. Backend: upload server files
            await uploadFile(sftp, 'server/index.js', '/var/www/datatalim/server/index.js');
            await uploadFile(sftp, 'utils/googleSheets.js', '/var/www/datatalim/utils/googleSheets.js');

            // 3. Install express-rate-limit
            log('\n📦 Installing express-rate-limit...');
            await exec(conn, 'cd /var/www/datatalim && npm install express-rate-limit --save 2>&1 | tail -3');

            // 4. Restart PM2
            log('\n🔄 Restarting PM2...');
            await exec(conn, 'cd /var/www/datatalim/server && pm2 restart index 2>&1 || pm2 restart all 2>&1');

            log('\n\n✅ Deploy complete!');
        } catch (e) {
            console.error('❌ Error:', e.message);
        }
        conn.end();
    });
}).connect(sshConfig);
