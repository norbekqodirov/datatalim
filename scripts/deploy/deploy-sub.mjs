/**
 * Kurs landinglari uchun subdomen deploy: <sub>.datatalim.uz — statik sayt (boshqa loyihaning dist/ papkasi).
 * Har deployda joriy papka zaxiralanadi; nginx sozlamasi va HTTPS (certbot) faqat birinchi marta yaratiladi.
 *
 *   node scripts/deploy/deploy-sub.mjs ai D:/Project/data-ai-kurs/dist     # deploy
 *   node scripts/deploy/deploy-sub.mjs ai --rollback                       # oxirgi zaxiraga qaytish
 *
 * Talab: subdomen DNS A yozuvi VPS'ga qaragan bo'lishi kerak (certbot shuni tekshiradi).
 */
import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const [sub, arg] = process.argv.slice(2);
if (!sub || !/^[a-z0-9-]{1,32}$/.test(sub) || !arg) {
    console.error('Ishlatish: node scripts/deploy/deploy-sub.mjs <sub> <dist papkasi> | --rollback');
    process.exit(1);
}
const DOMAIN = `${sub}.datatalim.uz`;
const ROOT = `/var/www/${DOMAIN}`;
const BACKUPS = `/var/www/${DOMAIN}_backups`;
const CONF = `/etc/nginx/sites-available/${DOMAIN}`;
const rollback = arg === '--rollback';

const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);
const ok = (msg) => console.log('\x1b[32m%s\x1b[0m', msg);

// HTTP (80) blok; certbot --nginx unga 443 blokini va https'ga yo'naltirishni o'zi qo'shadi
const NGINX_CONF = `server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    root ${ROOT};
    index index.html;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Vite fayllari nomida hash bor — uzoq keshlash xavfsiz
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff" always;
        try_files $uri =404;
    }

    # HTML har safar yangidan: deploydan keyin eski sahifa qolib ketmasin
    location = /index.html {
        add_header Cache-Control "no-cache";
        add_header X-Content-Type-Options "nosniff" always;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (e, stream) => {
            if (e) { reject(e); return; }
            let out = '';
            stream.on('close', (code) => {
                if (code !== 0) reject(new Error(`exit ${code}: ${out.slice(-500)}`));
                else resolve(out);
            }).on('data', d => { out += d.toString(); process.stdout.write(d); })
              .stderr.on('data', d => { out += d.toString(); process.stderr.write(d); });
        });
    });
}

async function main() {
    let tarball = null;
    if (!rollback) {
        if (!fs.existsSync(path.join(arg, 'index.html'))) throw new Error(`${arg}/index.html topilmadi — avval build qiling.`);
        // arxiv nomi nisbiy: GNU tar "D:/..." ni masofaviy xost deb tushunadi (-C esa oddiy papka, muammo yo'q)
        tarball = `${DOMAIN}.tar.gz`;
        log(`Packing ${arg} ...`);
        execFileSync('tar', ['-czf', tarball, '-C', arg, '.'], { stdio: 'inherit' });
    }

    const conn = new Client();
    await new Promise((resolve, reject) => conn.on('ready', resolve).on('error', reject).connect(sshConfig));
    log(`SSH connected → ${DOMAIN}`);

    try {
        if (rollback) {
            log('\n=== Rollback: oxirgi zaxiraga qaytish ===');
            const now = new Date().toISOString().replace(/[:.]/g, '-');
            await exec(conn,
                `LAST=$(ls -1d ${BACKUPS}/site-* 2>/dev/null | grep -v pre-rollback | tail -1) && test -n "$LAST" && ` +
                `mv ${ROOT} ${BACKUPS}/site-pre-rollback-${now} && cp -a "$LAST" ${ROOT} && ` +
                `echo "ROLLBACK_OK → $LAST"`);
            ok(`\n${DOMAIN} oldingi holatga qaytarildi.`);
            return;
        }

        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        log('\n=== 1/4 Upload ===');
        const sftp = await new Promise((resolve, reject) => conn.sftp((e, s) => e ? reject(e) : resolve(s)));
        await new Promise((resolve, reject) => sftp.fastPut(tarball, `/tmp/${DOMAIN}.tar.gz`, (e) => e ? reject(e) : resolve()));

        log('\n=== 2/4 Backup current site & swap in new one ===');
        const hadSite = (await exec(conn, `test -d ${ROOT} && echo yes || echo no`)).trim() === 'yes';
        await exec(conn,
            `mkdir -p ${BACKUPS} && (test -d ${ROOT} && mv ${ROOT} ${BACKUPS}/site-${stamp} || true) && ` +
            `mkdir -p ${ROOT} && tar -xzf /tmp/${DOMAIN}.tar.gz -C ${ROOT} && rm /tmp/${DOMAIN}.tar.gz && ` +
            `chmod -R a+rX ${ROOT} && test -f ${ROOT}/index.html && echo SITE_OK && ` +
            // faqat oxirgi 5 ta zaxira qoladi
            `(ls -1d ${BACKUPS}/site-2* 2>/dev/null | head -n -5 | xargs -r rm -rf)`);

        log('\n=== 3/4 Nginx (faqat birinchi marta) ===');
        const hasConf = (await exec(conn, `test -f ${CONF} && echo yes || echo no`)).trim() === 'yes';
        if (!hasConf) {
            const b64 = Buffer.from(NGINX_CONF).toString('base64');
            await exec(conn,
                `echo ${b64} | base64 -d > ${CONF} && ln -sf ${CONF} /etc/nginx/sites-enabled/${DOMAIN} && ` +
                `(nginx -t 2>&1 && systemctl reload nginx && echo NGINX_OK) || ` +
                `(rm -f /etc/nginx/sites-enabled/${DOMAIN} ${CONF}; echo NGINX_FAIL; exit 1)`);
        } else {
            console.log('mavjud sozlama qoldirildi');
        }

        log('\n=== 4/4 HTTPS (certbot, faqat birinchi marta) ===');
        const hasCert = (await exec(conn, `test -d /etc/letsencrypt/live/${DOMAIN} && echo yes || echo no`)).trim() === 'yes';
        if (!hasCert) {
            await exec(conn, `certbot --nginx -d ${DOMAIN} --non-interactive --redirect 2>&1 | tail -6 && nginx -t 2>&1 | tail -1 && echo CERT_OK`);
        } else {
            console.log('sertifikat bor');
        }

        ok(`\nTayyor: https://${DOMAIN}` + (hadSite ? ` (oldingi versiya zaxirasi: ${BACKUPS}/site-${stamp})` : ' (birinchi deploy — zaxira yo\'q)'));
        ok(`Muammo bo'lsa: node scripts/deploy/deploy-sub.mjs ${sub} --rollback`);
    } finally {
        conn.end();
        if (tarball) fs.rmSync(tarball, { force: true });
    }
}

main().catch((e) => { console.error('\x1b[31m%s\x1b[0m', `Xato: ${e.message}`); process.exit(1); });
