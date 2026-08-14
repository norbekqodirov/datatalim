import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Ready');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('Uploading update.tar.gz...');
        sftp.fastPut('update.tar.gz', '/var/www/datatalim/update.tar.gz', (err1) => {
            if (err1) throw err1;
            console.log('Uploaded! Extracting...');
            conn.exec('cd /var/www/datatalim && rm -rf dist_backup && mv dist dist_backup && tar -xzf update.tar.gz && rm update.tar.gz', (err2, stream) => {
                if (err2) throw err2;
                stream.on('close', () => {
                    console.log('Extraction complete! Deploy successful.');
                    conn.end();
                }).on('data', console.log).stderr.on('data', console.error);
            });
        });
    });
}).connect(sshConfig);
