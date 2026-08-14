import { Client } from 'ssh2';
import { sshConfig } from './sshConfig.mjs';

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready');
    // Check admin users in the database
    const cmd = `cd /var/www/datatalim && node -e "
import('./server/db.js').then(({ getDB, initDB }) => {
    initDB();
    const db = getDB();
    const users = db.prepare('SELECT id, username, created_at FROM admin_users').all();
    console.log('Admin users:', JSON.stringify(users, null, 2));
    db.close();
}).catch(err => console.error('Error:', err.message));
"`;
    
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => conn.end())
              .on('data', data => console.log(data.toString()))
              .stderr.on('data', data => console.error('STDERR:', data.toString()));
    });
}).connect(sshConfig);
