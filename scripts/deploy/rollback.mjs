/**
 * Rollback — VPS'ni oxirgi (yoki ko'rsatilgan) deploydan OLDINGI holatga qaytaradi.
 * deploy.mjs har safar dist_backups/dist-<stamp>, server_backups/<fayl>-<stamp> va db_backups/data-<stamp>.db
 * zaxiralarini oladi; bu skript ularni joyiga qo'yadi.
 *
 *   npm run rollback -- --list            zaxiralar ro'yxati (hech narsa o'zgarmaydi)
 *   npm run rollback                      eng oxirgi deploydan oldingi holatga (sayt + server kodi)
 *   npm run rollback -- <stamp>           ko'rsatilgan zaxiraga
 *   npm run rollback -- <stamp> --with-db ma'lumotlar bazasini ham qaytaradi (deploydan keyin kelgan arizalar
 *                                         o'chadi! Joriy baza avval db_backups/data-pre-rollback-*.db ga saqlanadi)
 *
 * Joriy dist ham o'chirilmaydi: dist_backups/dist-pre-rollback-<vaqt> ga ko'chiriladi (rollback'ni ham qaytarish mumkin).
 */
import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';

const REMOTE = '/var/www/datatalim';
const PM2_NAME = 'data-talim-api';
const BACKEND_FILES = ['server/index.js', 'server/db.js', 'utils/googleSheets.js', 'package.json', 'package-lock.json'];
const STAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/;

const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);
const ok = (msg) => console.log('\x1b[32m%s\x1b[0m', msg);
const fail = (msg) => console.error('\x1b[31m%s\x1b[0m', msg);

function exec(conn, cmd, quiet = false) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (e, stream) => {
            if (e) { reject(e); return; }
            let out = '';
            stream.on('close', (code) => {
                if (code !== 0) reject(new Error(`exit ${code}: ${out.slice(-500)}`));
                else resolve(out);
            }).on('data', d => { out += d.toString(); if (!quiet) process.stdout.write(d); })
              .stderr.on('data', d => { out += d.toString(); process.stderr.write(d); });
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    const listOnly = args.includes('--list');
    const withDb = args.includes('--with-db');
    const wanted = args.find(a => !a.startsWith('--'));
    if (wanted && !STAMP_RE.test(wanted)) throw new Error(`Noto'g'ri stamp: ${wanted} (--list bilan ro'yxatni ko'ring)`);

    const conn = new Client();
    await new Promise((resolve, reject) => {
        conn.on('ready', resolve).on('error', reject).connect(sshConfig);
    });
    log('SSH connected');

    try {
        const listing = await exec(conn, `cd ${REMOTE} && ls -1 dist_backups 2>/dev/null; echo ---; ls -1 db_backups 2>/dev/null; echo ---; tail -n 10 deploy_log.txt 2>/dev/null`, true);
        const [distPart, dbPart, logPart] = listing.split('---\n');
        const stamps = distPart.split('\n').map(s => s.replace(/^dist-/, '')).filter(s => STAMP_RE.test(s)).sort();
        const dbStamps = new Set(dbPart.split('\n').map(s => s.replace(/^data-|\.db$/g, '')));
        const commits = Object.fromEntries(logPart.split('\n').filter(Boolean).map(l => l.split(' ')));

        if (!stamps.length) throw new Error('dist_backups/ da zaxira topilmadi — qaytarish uchun hech narsa yo\'q.');
        if (listOnly) {
            log('Zaxiralar (eng yangisi pastda). Har biri — shu vaqtdagi deploydan OLDINGI holat:');
            for (const s of stamps) console.log(`  ${s}  ${dbStamps.has(s) ? '[db]' : '    '}  deploy: ${commits[s] || '?'}`);
            return;
        }

        const stamp = wanted || stamps[stamps.length - 1];
        if (!stamps.includes(stamp)) throw new Error(`Zaxira topilmadi: dist-${stamp}`);
        if (withDb && !dbStamps.has(stamp)) throw new Error(`db_backups/data-${stamp}.db yo'q — --with-db siz ishlating.`);
        const now = new Date().toISOString().replace(/[:.]/g, '-');
        log(`Qaytarilmoqda: ${stamp} (deploy ${commits[stamp] || '?'} dan oldingi holat)${withDb ? ' + MA\'LUMOTLAR BAZASI' : ''}`);

        log('\n=== 1/4 Frontend: dist almashtirish ===');
        await exec(conn,
            `cd ${REMOTE} && (test -d dist && mv dist dist_backups/dist-pre-rollback-${now} || true) && ` +
            `cp -a dist_backups/dist-${stamp} dist && test -f dist/index.html && echo DIST_OK`
        );

        log('\n=== 2/4 Backend: fayllarni qaytarish ===');
        for (const f of BACKEND_FILES) {
            const flat = f.replace(/\//g, '_');
            await exec(conn, `cd ${REMOTE} && if test -f server_backups/${flat}-${stamp}; then cp ${f} server_backups/${flat}-pre-rollback-${now} 2>/dev/null; cp server_backups/${flat}-${stamp} ${f} && echo "restored ${f}"; fi`);
        }
        await exec(conn, `cd ${REMOTE} && npm install --omit=dev --legacy-peer-deps 2>&1 | tail -5`);
        await exec(conn, `node --check ${REMOTE}/server/index.js && node --check ${REMOTE}/server/db.js && node --check ${REMOTE}/utils/googleSheets.js && echo SYNTAX_OK`);

        if (withDb) {
            log('\n=== 3/4 Ma\'lumotlar bazasi: joriyni saqlab, zaxirani qaytarish ===');
            await exec(conn, `pm2 stop ${PM2_NAME}`);
            await exec(conn,
                `cd ${REMOTE} && cp server/data.db db_backups/data-pre-rollback-${now}.db && ` +
                `rm -f server/data.db-wal server/data.db-shm && cp db_backups/data-${stamp}.db server/data.db && echo DB_OK`
            );
        } else {
            log('\n=== 3/4 Ma\'lumotlar bazasi: o\'zgarmaydi (yangi arizalar saqlanadi) ===');
        }

        log('\n=== 4/4 PM2 restart & tekshiruv ===');
        await exec(conn, `pm2 restart ${PM2_NAME} --update-env`);
        await new Promise(r => setTimeout(r, 3000));
        await exec(conn, `pm2 jlist | node -e "` +
            `let d='';process.stdin.on('data',c=>d+=c);` +
            `process.stdin.on('end',()=>{` +
            `const p=JSON.parse(d).find(x=>x.name==='${PM2_NAME}');` +
            `if(!p){console.error('NOT_FOUND');process.exit(1)}` +
            `console.log('status='+p.pm2_env.status+' restarts='+p.pm2_env.restart_time);` +
            `if(p.pm2_env.status!=='online')process.exit(1)` +
            `})"`);
        await exec(conn, `echo "${now} ROLLBACK-TO ${stamp}${withDb ? ' +db' : ''}" >> ${REMOTE}/deploy_log.txt`);

        ok(`\nRollback tayyor: sayt ${stamp} dagi holatda. Rollback'dan oldingi holat: *-pre-rollback-${now}`);
    } catch (e) {
        fail(`\nROLLBACK FAILED: ${e.message}`);
        fail('VPS da `pm2 logs data-talim-api` ni tekshiring; zaxiralar dist_backups/, server_backups/, db_backups/ da.');
        process.exitCode = 1;
    } finally {
        conn.end();
    }
}

main().catch((e) => { fail(e.message); process.exitCode = 1; });
