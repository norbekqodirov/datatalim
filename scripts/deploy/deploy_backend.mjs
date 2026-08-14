import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        log('Uploading server/index.js to fix marketing leads count...');
        sftp.fastPut('server/index.js', '/var/www/datatalim/server/index.js', (err) => {
            if (err) throw err;
            log('Upload complete. Restarting API...');
            conn.exec('pm2 restart data-talim-api', (e, s) => {
                s.on('close', () => { log('Deployment Done!'); conn.end(); })
                    .on('data', d => process.stdout.write(d.toString()))
                    .stderr.on('data', d => process.stderr.write(d.toString()));
            });
        });
    });
}).connect(sshConfig);
