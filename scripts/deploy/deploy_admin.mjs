import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        log('Uploading update.zip...');
        sftp.fastPut(path.join(__dirname, 'update.zip'), '/root/update.zip', (err) => {
            if (err) throw err;
            log('Upload complete. Extracting and restarting PM2...');
            conn.exec('apt-get install -y unzip && unzip -o /root/update.zip -d /var/www/datatalim/ && rm /root/update.zip && pm2 restart data-talim-api', (e, s) => {
                s.on('close', () => { log('Deployment Done!'); conn.end(); })
                    .on('data', d => process.stdout.write(d.toString()))
                    .stderr.on('data', d => process.stderr.write(d.toString()));
            });
        });
    });
}).connect(sshConfig);
