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
        log('Uploading update_tg.zip...');
        sftp.fastPut(path.join(__dirname, 'update_tg.zip'), '/root/update_tg.zip', (err) => {
            if (err) throw err;
            log('Upload complete. Extracting and restarting PM2...');
            conn.exec('apt-get install -y unzip && unzip -o /root/update_tg.zip -d /var/www/datatalim/ && rm /root/update_tg.zip && pm2 restart data-talim-api', (e, s) => {
                s.on('close', () => { log('Deployment Done!'); conn.end(); })
                    .on('data', d => process.stdout.write(d.toString()))
                    .stderr.on('data', d => process.stderr.write(d.toString()));
            });
        });
    });
}).connect({
    host: '188.225.74.65',
    port: 22,
    username: 'root',
    password: 'y,Qx9i6-dWMNCi'
});
