import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Ready for backend deploy');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('Uploading server/index.js...');
        sftp.fastPut('server/index.js', '/var/www/datatalim/server/index.js', (err1) => {
            if (err1) throw err1;
            console.log('Uploading server/db.js...');
            sftp.fastPut('server/db.js', '/var/www/datatalim/server/db.js', (err2) => {
                if (err2) throw err2;
                console.log('Uploaded! Restarting PM2...');
                conn.exec('cd /var/www/datatalim/server && pm2 restart index', (err3, stream) => {
                    if (err3) throw err3;
                    stream.on('close', () => {
                        console.log('PM2 restarted successfully.');
                        conn.end();
                    }).on('data', d => console.log(d.toString())).stderr.on('data', d => console.error(d.toString()));
                });
            });
        });
    });
}).connect(sshConfig);
