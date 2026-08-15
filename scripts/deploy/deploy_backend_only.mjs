import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const REMOTE = '/var/www/datatalim';
const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

function uploadFile(sftp, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) reject(err);
            else { log(`  uploaded -> ${remotePath}`); resolve(); }
        });
    });
}

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) { reject(err); return; }
            let out = '';
            stream.on('close', (code) => { if (code !== 0) reject(new Error(`exit ${code}: ${out}`)); else resolve(out); })
                .on('data', d => { out += d.toString(); process.stdout.write(d); })
                .stderr.on('data', d => { out += d.toString(); process.stderr.write(d); });
        });
    });
}

conn.on('ready', () => {
    log('SSH connected');
    conn.sftp(async (err, sftp) => {
        if (err) throw err;
        try {
            log('\n=== Backup + upload server/index.js + package.json ===');
            await exec(conn, `cp ${REMOTE}/server/index.js ${REMOTE}/server/index.js.pre-fix-$(date +%H%M%S)`);
            await uploadFile(sftp, 'D:/Project/data-talim/server/index.js', `${REMOTE}/server/index.js`);
            await uploadFile(sftp, 'D:/Project/data-talim/package.json', `${REMOTE}/package.json`);
            await uploadFile(sftp, 'D:/Project/data-talim/package-lock.json', `${REMOTE}/package-lock.json`);

            log('\n=== npm install ===');
            await exec(conn, `cd ${REMOTE} && npm install --legacy-peer-deps 2>&1 | tail -10`);

            log('\n=== Syntax check ===');
            await exec(conn, `node --check ${REMOTE}/server/index.js && echo SYNTAX_OK`);

            log('\n=== Restart pm2 ===');
            await exec(conn, `pm2 restart data-talim-api --update-env`);
            await new Promise(r => setTimeout(r, 2500));
            await exec(conn, `pm2 describe data-talim-api | grep -E "status|restarts|uptime"`);

            log('\n✅ Backend deploy complete!');
        } catch (e) {
            console.error('\n❌ DEPLOY FAILED:', e.message);
            process.exitCode = 1;
        }
        conn.end();
    });
}).on('error', (e) => { console.error('CONN ERR', e.message); process.exitCode = 1; }).connect(sshConfig);
