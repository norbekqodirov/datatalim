import { Client } from 'ssh2';
import * as fs from 'fs';

const conn = new Client();
conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        sftp.fastGet('/etc/nginx/sites-available/datatalim', 'datatalim_nginx.conf', (err) => {
            if (err) console.error(err);
            else console.log('Downloaded Nginx Config!');
            conn.end();
        });
    });
}).connect({
    host: '188.225.74.65',
    port: 22,
    username: 'root',
    password: 'y,Qx9i6-dWMNCi'
});
