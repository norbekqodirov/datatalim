import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
    conn.exec(`curl -X POST http://localhost:4000/api/leads -H "Content-Type: application/json" -d '{"name": "Local Test", "phone": "+998901112233", "sourceRef": "app_script_test"}' && echo "\\nLogs:" && tail -n 5 ~/.pm2/logs/data-talim-api-out.log ~/.pm2/logs/data-talim-api-error.log`, (err, stream) => {
        stream.on('close', () => conn.end())
            .on('data', d => process.stdout.write(d.toString()))
            .stderr.on('data', d => process.stderr.write(d.toString()));
    });
}).connect({
    host: '188.225.74.65',
    port: 22,
    username: 'root',
    password: 'y,Qx9i6-dWMNCi'
});
