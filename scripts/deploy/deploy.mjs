/**
 * Canonical deploy script — uploads the frontend build (dist/) and backend
 * source files to the VPS, installs production deps, syntax-checks, restarts
 * PM2, and verifies the process came back online. Used both locally
 * (`npm run deploy`) and from CI (.github/workflows/deploy.yml).
 *
 * Requires dist/ to already be built (run `npm run build` first — the
 * `predeploy` npm script does this automatically for `npm run deploy`).
 */
import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';
import { execSync } from 'child_process';
import fs from 'fs';

const REMOTE = '/var/www/datatalim';
const PM2_NAME = 'data-talim-api';
const BACKEND_FILES = ['server/index.js', 'server/db.js', 'utils/googleSheets.js', 'package.json', 'package-lock.json'];

const log = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);
const ok = (msg) => console.log('\x1b[32m%s\x1b[0m', msg);
const fail = (msg) => console.error('\x1b[31m%s\x1b[0m', msg);

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

function uploadFile(sftp, local, remote) {
    return new Promise((resolve, reject) => {
        sftp.fastPut(local, remote, (e) => e ? reject(e) : resolve());
    });
}

async function main() {
    if (!fs.existsSync('dist/index.html')) {
        throw new Error('dist/index.html not found — run `npm run build` first.');
    }
    for (const f of BACKEND_FILES) {
        if (!fs.existsSync(f)) throw new Error(`${f} not found — run this from the repo root.`);
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');

    log('Packing frontend build...');
    execSync('tar -czf update.tar.gz -C dist .', { stdio: 'inherit' });

    const conn = new Client();
    await new Promise((resolve, reject) => {
        conn.on('ready', resolve).on('error', reject).connect(sshConfig);
    });
    log('SSH connected');

    const sftp = await new Promise((resolve, reject) => {
        conn.sftp((e, s) => e ? reject(e) : resolve(s));
    });

    try {
        log('\n=== 1/6 Frontend: upload build ===');
        await uploadFile(sftp, 'update.tar.gz', `${REMOTE}/update.tar.gz`);

        log('\n=== 2/6 Frontend: backup current dist & swap in new one ===');
        await exec(conn,
            `cd ${REMOTE} && mkdir -p dist_backups && ` +
            `(test -d dist && mv dist dist_backups/dist-${stamp} || true) && ` +
            `mkdir dist && cd dist && tar -xzf ../update.tar.gz && rm ../update.tar.gz && ` +
            `test -f index.html && echo DIST_OK`
        );

        log('\n=== 3/6 Backend: backup current files ===');
        await exec(conn, `cd ${REMOTE} && mkdir -p server_backups`);
        for (const f of BACKEND_FILES) {
            const flat = f.replace(/\//g, '_');
            await exec(conn, `cp ${REMOTE}/${f} ${REMOTE}/server_backups/${flat}-${stamp} 2>/dev/null || true`);
        }

        log('\n=== 4/6 Backend: upload new files & install deps ===');
        for (const f of BACKEND_FILES) {
            await uploadFile(sftp, f, `${REMOTE}/${f}`);
        }
        await exec(conn, `cd ${REMOTE} && npm install --omit=dev --legacy-peer-deps 2>&1 | tail -10`);

        log('\n=== 5/6 Syntax check ===');
        await exec(conn, `node --check ${REMOTE}/server/index.js && node --check ${REMOTE}/server/db.js && node --check ${REMOTE}/utils/googleSheets.js && echo SYNTAX_OK`);

        log('\n=== 6/6 Restart PM2 & verify ===');
        await exec(conn, `pm2 restart ${PM2_NAME} --update-env`);
        await new Promise(r => setTimeout(r, 3000));
        const statusCheck = `pm2 jlist | node -e "` +
            `let d='';process.stdin.on('data',c=>d+=c);` +
            `process.stdin.on('end',()=>{` +
            `const p=JSON.parse(d).find(x=>x.name==='${PM2_NAME}');` +
            `if(!p){console.error('NOT_FOUND');process.exit(1)}` +
            `console.log('status='+p.pm2_env.status+' restarts='+p.pm2_env.restart_time);` +
            `if(p.pm2_env.status!=='online')process.exit(1)` +
            `})"`;
        await exec(conn, statusCheck);

        ok(`\nDeploy complete. Backups saved as *-${stamp} on the VPS (dist_backups/, server_backups/).`);
    } catch (e) {
        fail(`\nDEPLOY FAILED: ${e.message}`);
        fail('Production may be in a partially-updated state — check `pm2 logs data-talim-api` on the VPS and roll back from dist_backups/ or server_backups/ if needed.');
        process.exitCode = 1;
    } finally {
        if (fs.existsSync('update.tar.gz')) fs.unlinkSync('update.tar.gz');
        conn.end();
    }
}

main().catch((e) => { fail(e.message); process.exitCode = 1; });
