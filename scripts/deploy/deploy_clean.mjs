import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';
import fs from 'fs';

const REMOTE = '/var/www/datatalim';
const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);
const ts = '20260815';

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
            let code = null;
            stream.on('close', (c) => { code = c; if (code !== 0) reject(new Error(`exit ${code}: ${out}`)); else resolve(out); })
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
            log('\n=== 1. Backup current live dist (safety net for this deploy) ===');
            await exec(conn, `cd ${REMOTE} && rm -rf dist_old_backup dist_backup dist_prev && mv dist dist_prev_${ts}`);

            log('\n=== 2. Upload + extract new frontend ===');
            await uploadFile(sftp, 'D:/Project/data-talim/update.tar.gz', `${REMOTE}/update.tar.gz`);
            await exec(conn, `cd ${REMOTE} && mkdir dist && cd dist && tar -xzf ../update.tar.gz && rm ../update.tar.gz`);
            await exec(conn, `test -f ${REMOTE}/dist/index.html && echo DIST_OK`);

            log('\n=== 3. Backup + upload backend files ===');
            await exec(conn, `cd ${REMOTE} && cp server/index.js server/index.js.pre-deploy-${ts} && cp server/db.js server/db.js.pre-deploy-${ts}`);
            await uploadFile(sftp, 'D:/Project/data-talim/server/index.js', `${REMOTE}/server/index.js`);
            await uploadFile(sftp, 'D:/Project/data-talim/server/db.js', `${REMOTE}/server/db.js`);
            await uploadFile(sftp, 'D:/Project/data-talim/utils/googleSheets.js', `${REMOTE}/utils/googleSheets.js`);

            log('\n=== 4. Backup + upload package.json / package-lock.json ===');
            await exec(conn, `cd ${REMOTE} && cp package.json package.json.pre-deploy-${ts} && cp package-lock.json package-lock.json.pre-deploy-${ts}`);
            await uploadFile(sftp, 'D:/Project/data-talim/package.json', `${REMOTE}/package.json`);
            await uploadFile(sftp, 'D:/Project/data-talim/package-lock.json', `${REMOTE}/package-lock.json`);

            log('\n=== 5. npm install (reconcile deps: add sharp/framer-motion/jspdf, drop unused) ===');
            await exec(conn, `cd ${REMOTE} && npm install --legacy-peer-deps 2>&1 | tail -25`);

            log('\n=== 6. Syntax check before restart ===');
            await exec(conn, `node --check ${REMOTE}/server/index.js && echo SYNTAX_OK`);

            log('\n=== 7. Restart pm2 (data-talim-api only) ===');
            await exec(conn, `pm2 restart data-talim-api --update-env 2>&1`);
            await new Promise(r => setTimeout(r, 3000));
            await exec(conn, `pm2 describe data-talim-api | grep -E "status|restarts|uptime"`);
            await exec(conn, `pm2 logs data-talim-api --lines 15 --nostream 2>&1`);

            log('\n\n✅ Deploy complete!');
        } catch (e) {
            console.error('\n❌ DEPLOY FAILED:', e.message);
            process.exitCode = 1;
        }
        conn.end();
    });
}).on('error', (e) => { console.error('CONN ERR', e.message); process.exitCode = 1; }).connect(sshConfig);
