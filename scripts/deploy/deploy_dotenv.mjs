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
        const putP = (local, remote) => new Promise(res => sftp.fastPut(local, remote, () => res()));

        Promise.all([
            putP(path.join(__dirname, 'server/index.js'), '/var/www/datatalim/server/index.js'),
            putP(path.join(__dirname, 'package.json'), '/var/www/datatalim/package.json')
        ]).then(() => {
            log('Files uploaded successfully! Installing dotenv on VPS...');
            // IMPORTANT: Adding --legacy-peer-deps to fix the react-helmet-async issue
            conn.exec('cd /var/www/datatalim && npm install dotenv --legacy-peer-deps && pm2 restart data-talim-api', (e, s) => {
                s.on('close', () => { log('Done!'); conn.end(); })
                    .on('data', d => process.stdout.write(d.toString()))
                    .stderr.on('data', d => process.stderr.write(d.toString()));
            });
        });
    });
}).connect(sshConfig);
