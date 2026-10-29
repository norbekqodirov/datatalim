/**
 * Read-only VPS probe: server IPs, nginx sites, web roots, certbot. Changes nothing.
 * Usage: node scripts/deploy/probe.mjs
 */
import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const CMD = [
    'echo "## ip"; hostname -I',
    'echo "## sites-enabled"; ls -1 /etc/nginx/sites-enabled',
    'echo "## www"; ls -1 /var/www',
    'echo "## certbot"; (command -v certbot && certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry") || echo none',
    'echo "## nginx"; nginx -v 2>&1',
].join('; ');

const conn = new Client();
conn.on('ready', () => {
    conn.exec(CMD, (e, stream) => {
        if (e) { console.error(e.message); conn.end(); process.exit(1); }
        stream.on('close', () => conn.end())
            .on('data', (d) => process.stdout.write(d))
            .stderr.on('data', (d) => process.stderr.write(d));
    });
}).on('error', (e) => { console.error('SSH error:', e.message); process.exit(1); }).connect(sshConfig);
