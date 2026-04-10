import { Client } from 'ssh2';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        sftp.fastGet('/etc/nginx/sites-available/datatalim', 'nginx_datatalim.txt', (err) => {
            if (err) throw err;
            log('Active Nginx config downloaded!');
            conn.end();
        });
    });
}).connect({
    host: '188.225.74.65',
    port: 22,
    username: 'root',
    password: 'y,Qx9i6-dWMNCi'
});
