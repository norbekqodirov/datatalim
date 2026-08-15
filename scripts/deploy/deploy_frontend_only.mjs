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
            log('\n=== Swap frontend dist ===');
            await exec(conn, `cd ${REMOTE} && rm -rf dist_prev_fix && mv dist dist_prev_fix`);
            await uploadFile(sftp, 'D:/Project/data-talim/update.tar.gz', `${REMOTE}/update.tar.gz`);
            await exec(conn, `cd ${REMOTE} && mkdir dist && cd dist && tar -xzf ../update.tar.gz && rm ../update.tar.gz`);
            await exec(conn, `test -f ${REMOTE}/dist/index.html && echo DIST_OK`);
            log('\n✅ Frontend deploy complete!');
        } catch (e) {
            console.error('\n❌ DEPLOY FAILED:', e.message);
            process.exitCode = 1;
        }
        conn.end();
    });
}).on('error', (e) => { console.error('CONN ERR', e.message); process.exitCode = 1; }).connect(sshConfig);
