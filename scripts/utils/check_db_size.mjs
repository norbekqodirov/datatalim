import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
    conn.exec("sqlite3 /var/www/datatalim/server/data.db 'SELECT length(value) FROM app_data;'", (err, stream) => {
        stream.on('data', d => console.log('DB Lengths:', d.toString()))
            .on('close', () => conn.end());
    });
}).connect({ host: '188.225.74.65', port: 22, username: 'root', password: 'y,Qx9i6-dWMNCi' });
