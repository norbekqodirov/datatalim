import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        log('Uploading update_speed.zip...');
        sftp.fastPut('update_speed.zip', '/root/update_speed.zip', (err) => {
            if (err) throw err;
            log('Upload complete. Purging old front-end files and extracting optimized chunks...');
            conn.exec('rm -rf /var/www/datatalim/dist/* && unzip -o /root/update_speed.zip -d /var/www/datatalim/ && rm /root/update_speed.zip && pm2 restart data-talim-api', (e, s) => {
                s.on('close', () => { log('Deployment Done!'); conn.end(); })
                    .on('data', d => process.stdout.write(d.toString()))
                    .stderr.on('data', d => process.stderr.write(d.toString()));
            });
        });
    });
}).connect(sshConfig);
