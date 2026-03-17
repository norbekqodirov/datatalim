import { Client } from 'ssh2';
const conn = new Client();
conn.on('ready', () => {
    console.log('Connected. Deploying fixed build...');
    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('Uploading update.tar.gz...');
        sftp.fastPut('update.tar.gz', '/var/www/datatalim/update.tar.gz', (err1) => {
            if (err1) throw err1;
            console.log('Uploaded! Replacing dist...');
            conn.exec('cd /var/www/datatalim && rm -rf dist_broken && mv dist dist_old_backup && mkdir dist && cd dist && tar -xzf ../update.tar.gz && rm ../update.tar.gz && echo "DONE - files:" && ls | head -10', (err2, stream) => {
                if (err2) throw err2;
                let out = '';
                stream.on('close', () => { console.log(out); console.log('Deploy complete!'); conn.end(); })
                    .on('data', d => { out += d.toString(); })
                    .stderr.on('data', d => { out += d.toString(); });
            });
        });
    });
}).connect({ host: '188.225.74.65', port: 22, username: 'root', password: 'y,Qx9i6-dWMNCi' });
