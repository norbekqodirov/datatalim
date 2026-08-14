import { sshConfig } from './sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Ready');
    // First, let's just run some diagnostic commands
    conn.exec('mkdir -p /var/www/datatalim/dist/images/courses && mkdir -p /var/www/datatalim/dist/images/team && ls -la /var/www/datatalim/dist/images/courses', (err, stream) => {
        if (err) throw err;
        let out = '';
        stream.on('data', d => out += d.toString()).on('close', () => {
            console.log('Remote Execution Result:\\n', out);
            console.log('Directories created. Uploading...');
            conn.sftp((errSftp, sftp) => {
                if (errSftp) throw errSftp;
                // Log local CWD:
                console.log('Local CWD:', process.cwd());

                sftp.fastPut('public/images/courses/videografiya.webp', '/var/www/datatalim/dist/images/courses/videografiya.webp', (err1) => {
                    if (err1) console.error('ERR1:', err1);
                    else console.log('Course image uploaded');

                    sftp.fastPut('public/images/team/murodbek.webp', '/var/www/datatalim/dist/images/team/murodbek.webp', (err2) => {
                        if (err2) console.error('ERR2:', err2);
                        else console.log('Teacher image uploaded');

                        conn.end();
                    });
                });
            });
        }).resume();
    });
}).connect(sshConfig);
