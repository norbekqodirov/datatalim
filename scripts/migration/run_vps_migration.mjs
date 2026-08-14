import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('Uploading migration script...');
        sftp.fastPut('migrate_marketing_links.mjs', '/var/www/datatalim/migrate_marketing_links.mjs', (err1) => {
            if (err1) throw err1;
            console.log('Uploaded! Running migration...');
            conn.exec('cd /var/www/datatalim && node migrate_marketing_links.mjs', (err2, stream) => {
                if (err2) throw err2;
                stream.on('close', () => {
                    console.log('Migration complete!');
                    conn.end();
                }).on('data', d => console.log(d.toString())).stderr.on('data', d => console.error(d.toString()));
            });
        });
    });
}).connect(sshConfig);
