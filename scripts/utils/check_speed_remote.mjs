import { sshConfig } from './sshConfig.mjs';
import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Ready - Running speed test on server...');
    const cmd = `curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\\nTotal: %{time_total}s\\nSize: %{size_download} bytes\\n" https://datatalim.uz`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.error(data.toString());
        });
    });
}).connect(sshConfig);
