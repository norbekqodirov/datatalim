import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        sftp.fastPut(path.join(__dirname, 'utils/googleSheets.js'), '/var/www/datatalim/utils/googleSheets.js', (err) => {
            if (err) throw err;
            log('googleSheets.js uploaded successfully! Restarting PM2...');
            conn.exec('cd /var/www/datatalim && pm2 restart data-talim-api', (e, s) => {
                s.on('close', () => { log('Done!'); conn.end(); })
                    .on('data', d => process.stdout.write(d.toString()))
                    .stderr.on('data', d => process.stderr.write(d.toString()));
            });
        });
    });
}).connect(sshConfig);
