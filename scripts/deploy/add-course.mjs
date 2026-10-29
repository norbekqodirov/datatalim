/**
 * Jonli saytga bitta kurs qo'shadi (app_data.courses). Avval DB zaxirasi olinadi; shu id'li kurs bo'lsa, hech narsa o'zgarmaydi.
 * Kurs o'z kategoriyasining oxiriga qo'yiladi. Keyin admin panelda odatdagidek tahrirlash mumkin.
 *
 *   node scripts/deploy/add-course.mjs scripts/deploy/courses/ai-agent.json
 */
import { sshConfig } from '../utils/sshConfig.mjs';
import { Client } from 'ssh2';
import fs from 'fs';

const REMOTE = '/var/www/datatalim';
const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
    console.error('Ishlatish: node scripts/deploy/add-course.mjs <kurs.json>');
    process.exit(1);
}
const course = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!/^[a-z0-9-]{2,40}$/.test(course.id || '') || !course.title?.uz || !course.category) {
    console.error('Kursda id (a-z0-9-), title.uz va category bo\'lishi shart');
    process.exit(1);
}

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (e, stream) => {
            if (e) { reject(e); return; }
            let out = '';
            stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}: ${out.slice(-500)}`)) : resolve(out)))
                .on('data', (d) => { out += d.toString(); process.stdout.write(d); })
                .stderr.on('data', (d) => { out += d.toString(); process.stderr.write(d); });
        });
    });
}

// serverda ishlaydi: kurs JSON'i base64 bilan beriladi (qo'shtirnoq/shell muammosi yo'q)
const REMOTE_JS = `
const D=require('better-sqlite3');const db=new D('server/data.db');
const c=JSON.parse(Buffer.from(process.argv[1],'base64').toString('utf8'));
const row=db.prepare("SELECT value FROM app_data WHERE key='courses'").get();
const list=row&&row.value?JSON.parse(row.value):[];
if(!Array.isArray(list))throw new Error('courses massiv emas');
if(list.some(x=>x.id===c.id)){console.log('EXISTS '+c.id+' — o\\'zgarish yo\\'q');process.exit(0)}
let at=-1;list.forEach((x,i)=>{if(x.category===c.category)at=i});
list.splice(at<0?list.length:at+1,0,c);
db.prepare("INSERT INTO app_data (key,value,updated_at) VALUES ('courses',?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP").run(JSON.stringify(list));
console.log('ADDED '+c.id+' at '+(at<0?list.length-1:at+1)+' / '+list.length);
`;

async function main() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const conn = new Client();
    await new Promise((resolve, reject) => conn.on('ready', resolve).on('error', reject).connect(sshConfig));
    try {
        console.log('=== DB backup ===');
        await exec(conn,
            `cd ${REMOTE} && mkdir -p db_backups && ` +
            `node -e "const D=require('better-sqlite3');const db=new D('server/data.db',{readonly:true,fileMustExist:true});` +
            `db.backup('db_backups/data-${stamp}.db').then(()=>{db.close();console.log('DB_BACKUP_OK')}).catch(e=>{console.error(e.message);process.exit(1)})"`);
        console.log('=== Add course ===');
        const b64 = Buffer.from(JSON.stringify(course)).toString('base64');
        // eval faqat yuqoridagi o'zgarmas REMOTE_JS ni ishga tushiradi; tashqi ma'lumot (kurs) faqat base64 argument sifatida keladi
        const js = Buffer.from(REMOTE_JS).toString('base64');
        await exec(conn, `cd ${REMOTE} && node -e "eval(Buffer.from('${js}','base64').toString())" ${b64}`);
        console.log(`Zaxira: ${REMOTE}/db_backups/data-${stamp}.db`);
    } finally {
        conn.end();
    }
}

main().catch((e) => { console.error(`Xato: ${e.message}`); process.exit(1); });
