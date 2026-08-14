import { sshConfig } from './sshConfig.mjs';
import { Client } from 'ssh2';
import * as fs from 'fs';

const conn = new Client();
const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

conn.on('ready', () => {
    log('Client :: ready');
    conn.exec('cat /etc/nginx/sites-available/default', (err, stream) => {
        let configStr = '';
        stream.on('data', d => configStr += d.toString());
        stream.on('close', () => {
            if (configStr.includes('Cache-Control')) {
                log('Cache-Control already set.');
                conn.end();
                return;
            }

            const newConfig = configStr.replace(
                'location / {',
                `location ~* \\.html$ {\n        add_header Cache-Control "no-cache, no-store, must-revalidate";\n        add_header Pragma "no-cache";\n        add_header Expires "0";\n        try_files $uri $uri/ /index.html;\n    }\n\n    location / {`
            );

            fs.writeFileSync('nginx.tmp', newConfig);

            conn.sftp((e, sftp) => {
                sftp.fastPut('nginx.tmp', '/etc/nginx/sites-available/default', (e) => {
                    conn.exec('systemctl restart nginx', (err, st) => {
                        st.on('close', () => {
                            log('Nginx updated & restarted.');
                            conn.end();
                        });
                    });
                });
            });
        });
    });
}).connect(sshConfig);
