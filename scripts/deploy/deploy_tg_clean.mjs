import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        log('Uploading update_tg_2.zip...');
        sftp.fastPut('update_tg_2.zip', '/root/update_tg_2.zip', (err) => {
            if (err) throw err;
            log('Upload complete. Emptying old dist folder and extracting new bundles...');
            conn.exec('rm -rf /var/www/datatalim/dist/* && unzip -o /root/update_tg_2.zip -d /var/www/datatalim/ && rm /root/update_tg_2.zip && pm2 restart data-talim-api', (e, s) => {
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
