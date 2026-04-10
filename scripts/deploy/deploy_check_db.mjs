import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        sftp.fastPut('check_db.mjs', '/var/www/datatalim/server/check_db.mjs', (err) => {
            if (err) throw err;
            conn.exec('cd /var/www/datatalim/server && node check_db.mjs', (e, s) => {
                s.on('close', () => { conn.end(); })
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
