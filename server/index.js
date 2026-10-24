import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Agent as UndiciAgent } from 'undici';
import { getDB, initDB } from './db.js';
import { fileURLToPath } from 'url';
import { appendLeadToSheet, appendCareerTestToSheet } from '../utils/googleSheets.js';

// Serverning ba'zi tarmoq muhitlarida IPv4 orqali api.telegram.org'ga ulanish osilib qoladi/vaqti
// tugaydi (masalan Telegram IP-diapazonlari filtrlanganda), boshqalarida esa IPv6 umuman mavjud emas.
// Qaysi marshrut mavjud/ishlashi vaqt bilan o'zgarishi mumkinligi uchun ikkalasini ham (avval IPv6,
// keyin standart/IPv4) sinab ko'ramiz — qaysi biri tiklansa, kodni o'zgartirmasdan o'shanga o'tadi.
const telegramDispatcherV6 = new UndiciAgent({ connect: { family: 6 } });

async function sendTelegramMessage(text) {
    const routes = [
        { label: 'IPv6', dispatcher: telegramDispatcherV6 },
        { label: 'default', dispatcher: undefined },
    ];
    let lastError;
    for (const route of routes) {
        try {
            const fetchOpts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' }),
                signal: AbortSignal.timeout(4000),
            };
            if (route.dispatcher) fetchOpts.dispatcher = route.dispatcher;

            const tgResponse = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, fetchOpts);
            if (!tgResponse.ok) {
                const data = await tgResponse.json().catch(() => ({}));
                return { success: false, error: data.description || 'Telegram xatosi' };
            }
            return { success: true };
        } catch (err) {
            console.error(`Telegram send error (${route.label} marshrut):`, err.message);
            lastError = err;
        }
    }
    return { success: false, error: lastError?.message || 'Tarmoq xatosi' };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env.local for PM2 backward compatibility
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 4000;
const IS_PROD = process.env.NODE_ENV === 'production';

// JWT: kuchli maxfiy kalit kerak. Yo'q yoki qisqa (<32 belgi) bo'lsa server YIQILMAYDI —
// ishga tushganda tasodifiy kalit yaratiladi (restartda barcha admin tokenlari bekor bo'ladi).
const JWT_ALGORITHM = 'HS256';
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    JWT_SECRET = crypto.randomBytes(64).toString('hex');
    console.warn('⚠️  JWT_SECRET o\'rnatilmagan yoki 32 belgidan qisqa! Vaqtinchalik tasodifiy kalit yaratildi: server qayta ishga tushganda admin tokenlari bekor bo\'ladi (qayta kirish kerak). Doimiy ishlashi uchun .env.local da kamida 32 belgili JWT_SECRET o\'rnating.');
}

// Telegram config — faqat server tomonida
const TG_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TG_CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || '';
let lastAssignedManager = 'B'; // Round-robin: alternates between A and B

// Basic input sanitization
const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    // eslint-disable-next-line no-control-regex
    // Avval uzunlikni cheklaymiz: yopilmagan '<' ko'p bo'lsa `<[^>]*>` O(n^2) ishlaydi (ReDoS).
    return str.substring(0, 2000).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().replace(/<[^>]*>/g, '').substring(0, 500);
};

// sanitize() faqat satr uchun ishlaydi; satr bo'lmagan qiymat (obyekt, massiv) bo'sh satr bo'ladi
const cleanText = (v) => (typeof v === 'string' ? sanitize(v) : '');

// Ichki xatoni logga yozib, mijozga umumiy javob qaytaradi (err.message mijozga chiqmaydi)
const serverError = (res, err, ctx = '') => {
    console.error(`[API xato]${ctx ? ' ' + ctx + ':' : ''}`, err);
    if (res.headersSent) return;
    res.status(500).json({ error: 'Internal server error' });
};

// Telegram (parse_mode=HTML) uchun escape. Frontend xabarlarda faqat oddiy <b>...</b> ishlatadi,
// shuning uchun avval hammasini escape qilamiz, so'ng FAQAT to'g'ri juftlangan <b></b> ni qaytaramiz
// (juft bo'lmasa — to'liq escape qilingan matn yuboriladi, Telegram parse xatosi bermasligi uchun).
const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toTelegramHtml = (raw) => {
    const escaped = escapeHtml(raw);
    const withBold = escaped.replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>');
    let depth = 0;
    for (const m of withBold.matchAll(/<(\/?)b>/g)) {
        depth += m[1] ? -1 : 1;
        if (depth < 0 || depth > 1) return escaped;
    }
    return depth === 0 ? withBold : escaped;
};

// Telefonni tekshirish va "+998XXXXXXXXX" ko'rinishiga keltirish. Yaroqsiz bo'lsa null.
const normalizePhone = (value) => {
    if (typeof value !== 'string') return null;
    let digits = value.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1); // 0901234567
    if (digits.length === 9) digits = '998' + digits;
    if (digits.length < 9 || digits.length > 13) return null;
    // O'zbekiston raqami: 998 + 9 raqam, operator kodi 2-9 dan boshlanadi
    if (digits.startsWith('998') && !/^998[2-9]\d{8}$/.test(digits)) return null;
    return '+' + digits;
};

const REF_CODE_RE = /^[A-Za-z0-9]{6}$/; // /api/marketing-links yaratadigan ref kod formati (6 belgi)
const SOURCE_REF_RE = /^[A-Za-z0-9_-]{1,40}$/; // ref kod yoki 'Karyera_Testi', 'Aloqa' kabi ichki manba nomlari
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // bir xil telefon + kurs uchun takroriy ariza oynasi

// Rate limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 5, // max 5 urinish
    message: { error: 'Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // faqat muvaffaqiyatsiz urinishlar sanaladi
});

const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Juda ko\'p urinish. Keyinroq qayta urinib ko\'ring.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const notifyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10, // Telegram xabarlari uchun qattiqroq chegara
    message: { error: 'Juda ko\'p so\'rov. Biroz kutib qayta urinib ko\'ring.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const leadsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 daqiqa
    max: 20, // max 20 so'rov
    message: { error: 'Juda ko\'p so\'rov. Biroz kutib qayta urinib ko\'ring.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const analyticsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 daqiqa
    max: 60, // max 60 so'rov
    message: { error: 'Juda ko\'p so\'rov.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
// nginx orqasida turamiz: haqiqiy mijoz IP'si X-Forwarded-For'dan olinadi (rate limit har IP uchun alohida)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Oddiy xavfsizlik headerlari (helmet'siz). HSTS va keshni nginx beradi.
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// Ruxsat etilgan origin'lar: datatalim.uz / www.datatalim.uz, dev'da localhost / 127.0.0.1 (istalgan port),
// same-origin va ixtiyoriy CORS_ORIGINS env (vergul bilan). Same-origin so'rovlar uchun CORS baribir kerak emas.
const ALLOWED_HOSTS = new Set(['datatalim.uz', 'www.datatalim.uz']);
const EXTRA_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const isLocalHost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
const isAllowedOrigin = (origin, req) => {
    if (EXTRA_ORIGINS.includes(origin)) return true;
    let url;
    try { url = new URL(origin); } catch { return false; }
    if (ALLOWED_HOSTS.has(url.hostname)) return true;
    if (!IS_PROD && isLocalHost(url.hostname)) return true;
    return url.host === req.get('host'); // same-origin
};
app.use(cors((req, callback) => {
    const origin = req.headers.origin;
    callback(null, { origin: !origin || isAllowedOrigin(origin, req) });
}));
// Ochiq (autentifikatsiyasiz) POST yo'llari uchun kichik limit; katta (5 MB) limit faqat admin kontenti uchun.
const jsonSmall = express.json({ limit: '32kb' });
const jsonLarge = express.json({ limit: '5mb' });
const SMALL_BODY_PATHS = /^\/api\/(leads|career-test-result|notify-telegram|track\/click|analytics\/track|admin\/login|admin\/change-password)\/?$/i; // Express yo'llari katta-kichik harfni farqlamaydi
app.use((req, res, next) => (SMALL_BODY_PATHS.test(req.path) ? jsonSmall : jsonLarge)(req, res, next));
app.use((req, res, next) => { if (req.body === undefined) req.body = {}; next(); }); // Express 5: body yo'q bo'lsa undefined
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    index: false,
    setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 kun (fayl nomlari noyob)
        // Eski/begona fayl (svg, html) to'g'ridan-to'g'ri ochilsa ham skript ishlamasin
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
    },
}));

// Ensure DB and Uploads directory exist
initDB();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for image uploads
const UPLOAD_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_TYPES = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'], 'image/gif': ['.gif'] };
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Nom va kengaytma serverda yaratiladi (mijoz bergan nomdan foydalanilmaydi)
        const ext = UPLOAD_TYPES[file.mimetype][0];
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: UPLOAD_MAX_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
        // Faqat MIME ruxsat ro'yxati: kengaytmani qat'iy tekshirmaymiz (frontend base64'dan 'image.png' nomli File yasaydi,
        // turi esa jpeg/webp bo'lishi mumkin). Fayl nomini server o'zi yaratadi, mazmunni esa sharp tekshiradi.
        if (!UPLOAD_TYPES[file.mimetype]) {
            return cb(Object.assign(new Error('Faqat JPG, PNG, WebP yoki GIF rasm yuklash mumkin'), { status: 415, expose: true }));
        }
        cb(null, true);
    },
});

// Database helper
const db = getDB();

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();
        res.set('Cache-Control', 'no-store');
        res.json({ ok: true, uptime: Math.round(process.uptime()) });
    } catch (err) {
        console.error('[health] DB xatosi:', err);
        res.status(503).json({ ok: false });
    }
});

// --- AUTHENTICATION API ---
// Noma'lum foydalanuvchi uchun ham bcrypt ishlasin (javob vaqti orqali username aniqlanmasligi uchun)
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(8).toString('hex'), 10);

app.post('/api/admin/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password required' });
    }
    if (username.length > 100 || password.length > 200) return res.status(401).json({ error: 'Invalid credentials' });

    try {
        const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

        const passwordMatch = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

        if (!user || !passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token valid for 8 hours (pv — parol izi: parol o'zgarsa eski tokenlar bekor bo'ladi)
        const token = signAdminToken(user);

        res.json({ success: true, token });
    } catch (err) {
        serverError(res, err, 'login');
    }
});

// Parol xeshidan qisqa iz: tokenga yoziladi va har so'rovda bazadagi joriy parol bilan solishtiriladi
const passwordVersion = (hash) => crypto.createHash('sha256').update(String(hash)).digest('hex').slice(0, 16);
const signAdminToken = (user) => jwt.sign(
    { id: user.id, username: user.username, pv: passwordVersion(user.password_hash) },
    JWT_SECRET, { algorithm: JWT_ALGORITHM, expiresIn: '8h' }
);
// Token hali ham amaldagi admin va amaldagi parolga tegishlimi (o'chirilgan admin / almashtirilgan parol -> yo'q)
const isTokenCurrent = (payload) => {
    const row = payload && db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(payload.id);
    return !!row && payload.pv === passwordVersion(row.password_hash);
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    res.set('Cache-Control', 'no-store'); // admin javoblari brauzer/proksi keshida qolmasin
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }, (err, user) => {
        if (err || !isTokenCurrent(user)) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Ochiq endpoint'lar uchun: yaroqli admin tokeni bormi (yo'q bo'lsa — oddiy tashrifchi, xato qaytarilmaydi)
const isAdminRequest = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return false;
    try {
        return isTokenCurrent(jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }));
    } catch {
        return false;
    }
};

// --- MARKETING LINKS API ---
app.get('/api/marketing-links', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM marketing_links ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        serverError(res, err, 'marketing-links');
    }
});

app.post('/api/marketing-links', authenticateToken, (req, res) => {
    const name = cleanText(req.body.name);
    const targetUrl = cleanText(req.body.targetUrl);
    const category = cleanText(req.body.category);
    if (!name) return res.status(400).json({ error: 'Name is required' });
    // Faqat saytning ichki yo'li ("/ariza", "/ariza?x=1"): "//host", "javascript:", "https://..." qabul qilinmaydi (open redirect himoyasi)
    if (targetUrl && !/^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/.test(targetUrl)) {
        return res.status(400).json({ error: 'targetUrl must be a site path starting with "/"' });
    }
    if (category && !['IT', 'Language'].includes(category)) return res.status(400).json({ error: 'Invalid category' });
    const finalTargetUrl = targetUrl || '/';
    const linkCategory = category || 'IT';

    // Kriptografik tasodifiy 6 belgili ref kod; UNIQUE to'qnashuvida qayta uriniladi
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    try {
        for (let attempt = 0; attempt < 5; attempt++) {
            let refCode = '';
            for (let i = 0; i < 6; i++) refCode += chars.charAt(crypto.randomInt(chars.length));
            try {
                const info = db.prepare('INSERT INTO marketing_links (name, ref_code, target_url, category) VALUES (?, ?, ?, ?)').run(name, refCode, finalTargetUrl, linkCategory);
                return res.json(db.prepare('SELECT * FROM marketing_links WHERE id = ?').get(info.lastInsertRowid));
            } catch (err) {
                if (!isUniqueViolation(err)) throw err;
            }
        }
        res.status(503).json({ error: 'Could not generate a unique ref code, try again' });
    } catch (err) {
        serverError(res, err, 'marketing-links create');
    }
});

app.delete('/api/marketing-links/:id', authenticateToken, (req, res) => {
    const id = parsePostId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    try {
        db.prepare('DELETE FROM marketing_links WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        serverError(res, err, 'marketing-links delete');
    }
});

// GET basic link info (public, used by forms)
app.get('/api/marketing-links/info/:ref', (req, res) => {
    const { ref } = req.params;
    if (!REF_CODE_RE.test(ref)) return res.status(404).json({ error: 'Link not found' });
    try {
        const link = db.prepare('SELECT name, category FROM marketing_links WHERE ref_code = ?').get(ref);
        if (link) {
            res.json(link);
        } else {
            res.status(404).json({ error: 'Link not found' });
        }
    } catch (err) {
        serverError(res, err, 'marketing-links info');
    }
});

// --- TRACKING API ---
app.post('/api/track/click', analyticsLimiter, (req, res) => {
    const { ref } = req.body;
    if (!ref) return res.status(400).json({ error: 'Ref code required' });
    if (typeof ref !== 'string' || !REF_CODE_RE.test(ref)) return res.status(400).json({ error: 'Invalid ref code' });

    try {
        db.prepare('UPDATE marketing_links SET clicks = clicks + 1 WHERE ref_code = ?').run(ref);
        const link = db.prepare('SELECT target_url FROM marketing_links WHERE ref_code = ?').get(ref);

        res.json({ success: true, target_url: link ? link.target_url : '/' });
    } catch (err) {
        serverError(res, err, 'track click');
    }
});

const TRACKABLE_EVENT_TYPES = ['site_visit', 'ariza_view', 'career_test_complete'];

app.post('/api/analytics/track', analyticsLimiter, (req, res) => {
    const { type } = req.body;
    if (!TRACKABLE_EVENT_TYPES.includes(type)) {
        return res.status(400).json({ error: 'Invalid event type' });
    }
    try {
        db.prepare('INSERT INTO analytics_events (type) VALUES (?)').run(type);
        res.json({ success: true });
    } catch (err) {
        serverError(res, err, 'analytics track');
    }
});

// --- LEAD SCORING ---
function scoreLead(lead) {
    let score = 0;
    const factors = [];

    if (lead.course_id) { score += 20; factors.push({ label: 'Kurs tanlagan', points: 20 }); }
    if (lead.source_ref) { score += 15; factors.push({ label: 'Marketing orqali', points: 15 }); }
    if (/^\+998\d{9}$/.test(lead.phone || '')) { score += 10; factors.push({ label: 'To\'g\'ri telefon formati', points: 10 }); }
    if (['contacted', 'enrolled'].includes(lead.status)) { score += 20; factors.push({ label: 'Aktiv status', points: 20 }); }
    if (lead.notes && lead.notes.trim()) { score += 15; factors.push({ label: 'Eslatma mavjud', points: 15 }); }

    // Time-based scoring
    const created = new Date(lead.created_at || Date.now());
    const hour = created.getHours();
    const day = created.getDay();
    if (hour >= 9 && hour <= 18) { score += 10; factors.push({ label: 'Ish vaqtida ariza', points: 10 }); }
    if (day >= 1 && day <= 5) { score += 10; factors.push({ label: 'Ish kunida ariza', points: 10 }); }

    let grade = 'Unqualified';
    if (score >= 70) grade = 'Hot';
    else if (score >= 50) grade = 'Warm';
    else if (score >= 30) grade = 'Cold';

    return { score, grade, factors };
}

// --- LEADS API ---
app.post('/api/leads', leadsLimiter, (req, res) => {
    const name = cleanText(req.body.name);
    const courseId = cleanText(req.body.courseId).slice(0, 300); // karyera testida 3 ta kurs nomi birga keladi
    const rawSourceRef = cleanText(req.body.sourceRef);
    const sourceRef = SOURCE_REF_RE.test(rawSourceRef) ? rawSourceRef : '';
    if (!name || !req.body.phone) return res.status(400).json({ error: 'Name and phone are required' });
    if (name.length > 80) return res.status(400).json({ error: 'Name is too long (max 80 characters)' });
    const phone = normalizePhone(typeof req.body.phone === 'string' ? req.body.phone : '');
    if (!phone) return res.status(400).json({ error: 'Invalid phone number' });

    const insertLead = db.transaction(() => {
        // Takroriy ariza: bir xil telefon + kurs oxirgi 10 daqiqada kelgan bo'lsa — yangisini yaratmay, mavjudini qaytaramiz
        const dup = db.prepare(
            "SELECT * FROM leads WHERE phone = ? AND COALESCE(course_id, '') = ? AND created_at >= datetime('now', ?) ORDER BY id DESC LIMIT 1"
        ).get(phone, courseId, `-${DEDUP_WINDOW_MS / 60000} minutes`);
        if (dup) {
            const sc = db.prepare('SELECT score, grade, factors FROM lead_scores WHERE lead_id = ?').get(dup.id);
            return {
                duplicate: true,
                lead: { ...dup, score: sc?.score ?? 0, grade: sc?.grade ?? 'Unqualified', factors: sc?.factors ?? '[]' },
                actualSourceRef: dup.source_ref,
            };
        }

        let actualSourceRef = sourceRef || null;

        if (sourceRef) {
            // Find the human-readable name of the marketing link and its category
            const linkRow = db.prepare('SELECT name, category FROM marketing_links WHERE ref_code = ?').get(sourceRef);
            if (linkRow) {
                // If it's a Language link, append _language to actualSourceRef so Google sheets pushes it to the right tab
                actualSourceRef = linkRow.category === 'Language' ? `${linkRow.name}_language` : linkRow.name;
            }

            // Increment leads_count for the matching marketing link
            db.prepare('UPDATE marketing_links SET leads_count = leads_count + 1 WHERE ref_code = ?').run(sourceRef);
        }

        const info = db.prepare('INSERT INTO leads (name, phone, course_id, source_ref) VALUES (?, ?, ?, ?)').run(name, phone, courseId || null, actualSourceRef);
        const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(info.lastInsertRowid);

        // Auto-score lead
        const { score, grade, factors } = scoreLead(newLead);
        db.prepare('INSERT OR REPLACE INTO lead_scores (lead_id, score, grade, factors, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
            .run(newLead.id, score, grade, JSON.stringify(factors));

        // Log activity
        db.prepare('INSERT INTO lead_activities (lead_id, action, detail) VALUES (?, ?, ?)')
            .run(newLead.id, 'created', `${name} - ${phone}`);

        return { lead: { ...newLead, score, grade, factors: JSON.stringify(factors) }, actualSourceRef };
    });

    try {
        const { lead, actualSourceRef: resolvedRef, duplicate } = insertLead();

        // Use resolvedRef for response instead of arbitrary `sourceRef`
        const finalResult = { ...lead, resolvedSourceRef: resolvedRef || sourceRef };
        // Public javob: saqlangan qator va scoring ma'lumoti tashqariga chiqmaydi
        const publicResult = { success: true, resolvedSourceRef: finalResult.resolvedSourceRef };

        if (duplicate) {
            // Takroriy ariza: Sheets'ga qayta yozilmaydi, faqat muvaffaqiyat javobi qaytadi
            return res.json({ ...publicResult, duplicate: true });
        }

        try { notifyNewLead(finalResult); } catch (e) { console.error('notifyNewLead:', e); } // xabar xatosi arizani buzmasin

        // Asynchronously save to Google Sheets; yozilmasa ariza yo'qolmasin — Telegram'ga zaxira xabar
        appendLeadToSheet(finalResult)
            .then(r => { if (!r?.success) throw new Error(r?.error || 'Sheet sync failed'); })
            .catch(err => {
                console.error("Failed to append lead to Google Sheet in background:", err?.message || err);
                if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
                const text = `⚠️ <b>Ariza Sheet'ga yozilmadi</b>
${escapeHtml(lead.name)} — ${escapeHtml(lead.phone)}
` +
                    `Kurs: ${escapeHtml(lead.course_id || '-')}
Manba: ${escapeHtml(finalResult.resolvedSourceRef || '-')}`;
                sendTelegramMessage(text).catch(e => console.error('Fallback Telegram failed:', e?.message || e));
            });

        res.json(publicResult);
    } catch (err) {
        serverError(res, err, 'leads');
    }
});

// --- CAREER TEST RESULT -> GOOGLE SHEETS (alohida tab) ---
// Lead o'zi /api/leads orqali allaqachon CRM'ga va umumiy Sheetga tushadi;
// bu endpoint faqat karyera testiga xos maydonlarni (jins, yosh, top-3 kurs)
// "Karyera Testi" tabiga qo'shimcha yozish uchun ishlatiladi.
const recentCareerTests = new Map(); // phone|hollandCode -> vaqt (takroriy yozuvni to'sish uchun)
app.post('/api/career-test-result', leadsLimiter, async (req, res) => {
    const name = cleanText(req.body.name);
    const gender = ['male', 'female'].includes(req.body.gender) ? req.body.gender : '';
    const age = /^\d{1,3}$/.test(String(req.body.age ?? '').trim()) ? String(req.body.age).trim() : '';
    const hollandCode = typeof req.body.hollandCode === 'string' && /^[A-Za-z]{1,6}$/.test(req.body.hollandCode) ? req.body.hollandCode : '';
    const courses = Array.isArray(req.body.courses) ? req.body.courses.slice(0, 3).map(c => cleanText(c).slice(0, 120)) : [];

    if (!name || !req.body.phone) return res.status(400).json({ error: 'Name and phone are required' });
    if (name.length > 80) return res.status(400).json({ error: 'Name is too long (max 80 characters)' });
    const phone = normalizePhone(typeof req.body.phone === 'string' ? req.body.phone : '');
    if (!phone) return res.status(400).json({ error: 'Invalid phone number' });

    // Bir xil telefon + natija 10 daqiqa ichida takrorlansa Sheet'ga qayta yozmaymiz
    const now = Date.now();
    for (const [k, t] of recentCareerTests) if (now - t > DEDUP_WINDOW_MS) recentCareerTests.delete(k);
    const dedupKey = `${phone}|${hollandCode}`;
    if (recentCareerTests.has(dedupKey)) return res.json({ success: true, duplicate: true });

    // Kalit await'dan OLDIN qo'yiladi: bir vaqtdagi ikkita bir xil so'rov Sheet'ga ikki marta yozmasin
    recentCareerTests.set(dedupKey, now);
    try {
        const result = await appendCareerTestToSheet({ name, phone, gender, age, hollandCode, courses });
        if (!result?.success) {
            recentCareerTests.delete(dedupKey); // yozilmadi — qayta urinishga ruxsat
            console.error('Career test sheet sync failed:', result?.error);
        }
        if (result?.success) res.json({ success: true });
        else res.status(502).json({ success: false, error: 'Sheet sync failed' }); // klient qayta urinadi
    } catch (err) {
        recentCareerTests.delete(dedupKey);
        console.error('Career test sheet sync error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// --- STATS API ---
app.get('/api/stats', authenticateToken, (req, res) => {
    try {
        const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
        const todayLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE date(created_at) = date('now')").get();
        const yesterdayLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE date(created_at) = date('now', '-1 day')").get();
        const totalMarketing = db.prepare('SELECT COUNT(*) as count FROM marketing_links').get();
        const totalClicks = db.prepare('SELECT COALESCE(SUM(clicks), 0) as total FROM marketing_links').get();
        const newLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'new' OR status IS NULL").get();
        const coursesData = db.prepare("SELECT value FROM app_data WHERE key = 'courses'").get();
        const teamData = db.prepare("SELECT value FROM app_data WHERE key = 'team'").get();
        const totalCourses = coursesData ? JSON.parse(coursesData.value).length : 0;
        const totalTeam = teamData ? JSON.parse(teamData.value).length : 0;

        // Leads per day (last 30 days)
        const leadsPerDay = db.prepare(`
            SELECT date(created_at) as date, COUNT(*) as count
            FROM leads
            WHERE created_at >= date('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY date ASC
        `).all();

        // Leads by course
        const leadsByCourse = db.prepare(`
            SELECT course_id, COUNT(*) as count
            FROM leads
            WHERE course_id IS NOT NULL AND course_id != ''
            GROUP BY course_id
            ORDER BY count DESC
        `).all();

        // Top marketing links
        const topLinks = db.prepare(`
            SELECT name, ref_code, clicks, leads_count
            FROM marketing_links
            ORDER BY clicks DESC
            LIMIT 5
        `).all();

        const sourceAttribution = db.prepare(`
            SELECT source_ref, COUNT(*) as count FROM leads
            WHERE source_ref IS NOT NULL GROUP BY source_ref ORDER BY count DESC LIMIT 8
        `).all();
        const daily7 = db.prepare(`
            SELECT date(created_at) as date, COUNT(*) as count FROM leads
            WHERE created_at >= date('now', '-7 days')
            GROUP BY date(created_at) ORDER BY date ASC
        `).all();
        const hotLeads = db.prepare(`SELECT COUNT(*) as count FROM lead_scores WHERE grade = 'Hot'`).get();

        // Site activity funnel (site_visit / ariza_view / career_test_complete)
        const eventCount = (type, dateFilter = '') => db.prepare(
            `SELECT COUNT(*) as count FROM analytics_events WHERE type = ?${dateFilter}`
        ).get(type).count;
        const siteVisits = eventCount('site_visit');
        const todaySiteVisits = db.prepare(`SELECT COUNT(*) as count FROM analytics_events WHERE type = 'site_visit' AND date(created_at) = date('now')`).get().count;
        const yesterdaySiteVisits = db.prepare(`SELECT COUNT(*) as count FROM analytics_events WHERE type = 'site_visit' AND date(created_at) = date('now', '-1 day')`).get().count;
        const arizaViews = eventCount('ariza_view');
        const careerTestCompletions = eventCount('career_test_complete');
        const siteVisitsPerDay = db.prepare(`
            SELECT date(created_at) as date, COUNT(*) as count
            FROM analytics_events
            WHERE type = 'site_visit' AND created_at >= date('now', '-30 days')
            GROUP BY date(created_at)
            ORDER BY date ASC
        `).all();

        res.json({
            totalLeads: totalLeads.count,
            todayLeads: todayLeads.count,
            yesterdayLeads: yesterdayLeads.count,
            totalLinks: totalMarketing.count,
            newLeads: newLeads.count,
            totalMarketing: totalMarketing.count,
            totalClicks: totalClicks.total,
            totalCourses,
            totalTeam,
            leadsPerDay,
            leadsByCourse,
            topLinks,
            sourceAttribution,
            daily7,
            hotLeads: hotLeads.count,
            siteVisits,
            todaySiteVisits,
            yesterdaySiteVisits,
            arizaViews,
            careerTestCompletions,
            siteVisitsPerDay,
        });
    } catch (err) {
        serverError(res, err, 'stats');
    }
});

// --- FAQ API ---
app.get('/api/faqs', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC').all();
        res.json(rows);
    } catch (err) {
        serverError(res, err, 'faqs');
    }
});

// --- BLOG API ---
const POST_SLUG_RE = /^[a-z0-9-]{1,100}$/;
const POST_FIELD_LIMITS = {
    title_uz: 300, title_ru: 300, title_en: 300,
    content_uz: 200000, content_ru: 200000, content_en: 200000,
    excerpt_uz: 1000, excerpt_ru: 1000, excerpt_en: 1000,
    cover_image: 1000, category: 100,
};

// Sarlavha/slug'dan xavfsiz slug yasaydi: faqat a-z, 0-9 va "-" (maks 100 belgi)
const toSlug = (value) => String(value || '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100).replace(/-+$/g, '');

const parsePostId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// Post body'sini tekshiradi. Muvaffaqiyatda { data }, xatoda { error } qaytaradi.
function parsePostBody(b) {
    if (!b || typeof b !== 'object' || Array.isArray(b)) return { error: 'Invalid request body' };
    const data = {};
    for (const [field, max] of Object.entries(POST_FIELD_LIMITS)) {
        const v = b[field] ?? '';
        if (typeof v !== 'string') return { error: `${field} must be a string` };
        if (v.length > max) return { error: `${field} is too long (max ${max})` };
        data[field] = v;
    }
    if (!data.title_uz.trim()) return { error: 'title_uz is required' };
    data.category = data.category || 'general';
    data.is_published = b.is_published === true || b.is_published === 1 || b.is_published === '1' || b.is_published === 'true' ? 1 : 0;
    data.slug = b.slug === undefined || b.slug === null ? '' : toSlug(b.slug);
    if (typeof b.slug !== 'string' && b.slug !== undefined && b.slug !== null) return { error: 'slug must be a string' };
    return { data };
}

app.get('/api/posts', (req, res) => {
    try {
        // Qoralamalar faqat yaroqli admin tokeni bilan ko'rinadi (admin panel shu endpointdan foydalanadi)
        const includeDrafts = isAdminRequest(req) && req.query.published !== '1';
        if (includeDrafts) res.set('Cache-Control', 'no-store');
        const rows = includeDrafts
            ? db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all()
            : db.prepare('SELECT * FROM posts WHERE is_published = 1 ORDER BY published_at DESC').all();
        res.json(rows);
    } catch (err) {
        serverError(res, err, 'posts list');
    }
});

app.get('/api/posts/:slug', (req, res) => {
    const { slug } = req.params;
    if (!POST_SLUG_RE.test(slug)) return res.status(400).json({ error: 'Invalid slug' });
    try {
        const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
        // Nashr qilinmagan post oddiy tashrifchiga mavjud emas (404), admin ko'ra oladi
        if (!post || (!post.is_published && !isAdminRequest(req))) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        serverError(res, err, 'posts get');
    }
});

const POST_COLUMNS = 'title_uz, title_ru, title_en, slug, content_uz, content_ru, content_en, excerpt_uz, excerpt_ru, excerpt_en, cover_image, category, is_published, published_at';
const isUniqueViolation = (err) => err && typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT');

app.post('/api/posts', authenticateToken, (req, res) => {
    const { data, error } = parsePostBody(req.body);
    if (error) return res.status(400).json({ error });
    const slug = data.slug || toSlug(data.title_uz) || `post-${Date.now()}`;
    try {
        if (db.prepare('SELECT 1 FROM posts WHERE slug = ?').get(slug)) {
            return res.status(409).json({ error: 'Slug already exists' });
        }
        const info = db.prepare(`INSERT INTO posts (${POST_COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
            data.title_uz, data.title_ru, data.title_en, slug,
            data.content_uz, data.content_ru, data.content_en,
            data.excerpt_uz, data.excerpt_ru, data.excerpt_en,
            data.cover_image, data.category, data.is_published,
            data.is_published ? new Date().toISOString() : null
        );
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
        res.json(post);
    } catch (err) {
        if (isUniqueViolation(err)) return res.status(409).json({ error: 'Slug already exists' });
        serverError(res, err, 'posts create');
    }
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
    const id = parsePostId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid post id' });
    const { data, error } = parsePostBody(req.body);
    if (error) return res.status(400).json({ error });
    try {
        const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
        if (!existing) return res.status(404).json({ error: 'Post not found' });
        const slug = data.slug || existing.slug;
        if (db.prepare('SELECT 1 FROM posts WHERE slug = ? AND id != ?').get(slug, id)) {
            return res.status(409).json({ error: 'Slug already exists' });
        }
        const publishedAt = data.is_published && !existing.is_published ? new Date().toISOString() : existing.published_at;
        db.prepare('UPDATE posts SET title_uz=?, title_ru=?, title_en=?, slug=?, content_uz=?, content_ru=?, content_en=?, excerpt_uz=?, excerpt_ru=?, excerpt_en=?, cover_image=?, category=?, is_published=?, published_at=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(
            data.title_uz, data.title_ru, data.title_en, slug,
            data.content_uz, data.content_ru, data.content_en,
            data.excerpt_uz, data.excerpt_ru, data.excerpt_en,
            data.cover_image, data.category, data.is_published, publishedAt, id
        );
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
        res.json(post);
    } catch (err) {
        if (isUniqueViolation(err)) return res.status(409).json({ error: 'Slug already exists' });
        serverError(res, err, 'posts update');
    }
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const id = parsePostId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid post id' });
    try {
        const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
        if (result.changes === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ success: true });
    } catch (err) {
        serverError(res, err, 'posts delete');
    }
});

// --- CHANGE PASSWORD ---
app.post('/api/admin/change-password', authenticateToken, passwordLimiter, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return res.status(400).json({ error: 'Both passwords required' });
        }
        if (newPassword.length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
        // bcrypt faqat birinchi 72 baytni hisobga oladi: undan uzun parol "yashirin" qirqilmasin
        if (Buffer.byteLength(newPassword, 'utf8') > 72) return res.status(400).json({ error: 'Password is too long (max 72 bytes)' });
        // Token egasining o'z yozuvi (avval doim id = 1 o'zgarardi)
        const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ error: 'Admin user not found' });
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, user.id);
        // Boshqa qurilmalardagi eski sessiyalar bekor bo'ladi; joriy sessiya uchun yangi token
        res.json({ success: true, token: signAdminToken({ ...user, password_hash: hash }) });
    } catch (err) {
        serverError(res, err, 'change-password');
    }
});

// --- BACKUP/RESTORE ---
app.get('/api/admin/backup', authenticateToken, (req, res) => {
    try {
        const backup = {};
        const tables = ['app_data', 'marketing_links', 'leads', 'faqs', 'testimonials', 'posts'];
        tables.forEach(t => {
            backup[t] = db.prepare(`SELECT * FROM ${t}`).all();
        });
        res.set('Cache-Control', 'no-store'); // mijoz telefonlari bor — brauzer/proksi keshlamasin
        res.json(backup);
    } catch (err) {
        serverError(res, err, 'backup');
    }
});

// API Endpoints for Data Ta'lim Store
const KEYS = ['courses', 'team', 'site_content', 'visibility'];
const ARRAY_KEYS = ['courses', 'team'];

// Ochiq GET base64 (data:image) va picsum rasmlarini '' ga almashtirib beradi (tezlik uchun).
// Admin shu javobni o'zgartirib qayta PUT qilganda bo'sh qiymat bazadagi asl rasmni o'chirib yubormasligi uchun,
// PUT paytida shunday bo'sh qiymatlar bazadagi saqlangan qiymat bilan qayta to'ldiriladi.
const isStrippable = (v) => typeof v === 'string' && (v.startsWith('data:image') || v.includes('picsum.photos'));
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function restoreStripped(incoming, stored) {
    if (Array.isArray(incoming) && Array.isArray(stored)) {
        // id'si bor obyektlar id bo'yicha, qolganlari tartib raqami bo'yicha solishtiriladi
        const byId = new Map();
        for (const o of stored) if (isPlainObject(o) && o.id !== undefined) byId.set(o.id, o);
        incoming.forEach((item, i) => {
            if (typeof item === 'string') {
                if (item === '' && isStrippable(stored[i])) incoming[i] = stored[i];
            } else if (item && typeof item === 'object') {
                const counterpart = isPlainObject(item) && item.id !== undefined ? byId.get(item.id) : stored[i];
                if (counterpart && typeof counterpart === 'object') restoreStripped(item, counterpart);
            }
        });
    } else if (isPlainObject(incoming) && isPlainObject(stored)) {
        for (const k of Object.keys(incoming)) {
            const v = incoming[k];
            if (v === '' && isStrippable(stored[k])) incoming[k] = stored[k];
            else if (v && typeof v === 'object' && stored[k] && typeof stored[k] === 'object') restoreStripped(v, stored[k]);
        }
    }
}

// GET data by key
app.get('/api/:key', (req, res) => {
    const { key } = req.params;
    if (!KEYS.includes(key)) {
        return res.status(400).json({ error: 'Invalid key' });
    }

    try {
        const row = db.prepare('SELECT value FROM app_data WHERE key = ?').get(key);
        if (row && row.value) {
            let data = JSON.parse(row.value);

            // Yuklanish tezligini oshirish: backendda base64 va picsum rasmlarini tozalash
            const cleanObj = (obj) => {
                if (Array.isArray(obj)) {
                    obj.forEach(cleanObj);
                } else if (typeof obj === 'object' && obj !== null) {
                    for (const k in obj) {
                        if (isStrippable(obj[k])) {
                            obj[k] = '';
                        } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                            cleanObj(obj[k]);
                        }
                    }
                }
            };
            cleanObj(data);

            res.json(data);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error('[API xato] GET', key, err);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT (update) data by key
app.put('/api/:key', authenticateToken, (req, res) => {
    const { key } = req.params;
    if (!KEYS.includes(key)) {
        return res.status(400).json({ error: 'Invalid key' });
    }

    const body = req.body;
    if (ARRAY_KEYS.includes(key) ? !Array.isArray(body) : !isPlainObject(body)) {
        return res.status(400).json({ error: ARRAY_KEYS.includes(key) ? 'Expected a JSON array' : 'Expected a JSON object' });
    }

    try {
        const row = db.prepare('SELECT value FROM app_data WHERE key = ?').get(key);
        if (row && row.value) {
            try {
                restoreStripped(body, JSON.parse(row.value));
            } catch (e) {
                console.error('[API] saqlangan qiymatni tiklashda xato (', key, '):', e.message);
            }
        }
        const value = JSON.stringify(body);
        const stmt = db.prepare(`
      INSERT INTO app_data (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);
        stmt.run(key, value);
        res.json({ success: true, message: `${key} updated successfully` });
    } catch (err) {
        console.error('[API xato] PUT', key, err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST to upload an image (auto-convert to WebP via sharp)
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalPath = req.file.path;
    const originalSize = req.file.size;
    const baseName = req.file.filename.replace(/\.[^.]+$/, '');
    // Asl fayl ham .webp bo'lsa, sharp o'sha faylning o'ziga yozolmaydi — boshqa nom beramiz
    const webpName = req.file.filename.endsWith('.webp') ? baseName + '-c.webp' : baseName + '.webp';
    const webpPath = path.join(uploadDir, webpName);
    const removeQuietly = (p) => fs.promises.unlink(p).catch(() => { });

    try {
        // Dynamically import sharp (ESM compatible)
        const { default: sharp } = await import('sharp');

        // Faylni buferga o'qib beramiz (<= 8 MB): Windows'da libvips faylni band qilib qo'yib, o'chirishga xalaqit bermasligi uchun
        await sharp(await fs.promises.readFile(originalPath), { limitInputPixels: 50_000_000 }) // dekompressiya-bomba himoyasi
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(webpPath);

        // Remove original file
        await removeQuietly(originalPath);

        const webpSize = (await fs.promises.stat(webpPath)).size;
        const imageUrl = `/uploads/${webpName}`;
        res.json({ url: imageUrl, originalSize, webpSize });
    } catch (err) {
        // Rasm sifatida o'qilmadi: xom faylni (va yarim yozilgan webp'ni) saqlamaymiz
        console.error('Rasm qayta ishlash (sharp) xatosi:', err.message);
        await removeQuietly(originalPath);
        await removeQuietly(webpPath);
        res.status(400).json({ error: 'Invalid or unsupported image file' });
    }
});

// --- TELEGRAM NOTIFICATION API (server-side only, token not exposed to frontend) ---
const TELEGRAM_MAX_RAW = 2500;
const TELEGRAM_HOURLY_CAP = 300; // butun sayt bo'yicha soatiga (spam bo'lsa ham chat to'lib ketmasin)
const TELEGRAM_RESPONSE_DEADLINE_MS = 7000;
let telegramWindowStart = Date.now();
let telegramWindowCount = 0;

// So'rov saytning o'z sahifasidan (yoki dev'da localhost'dan) kelganini Origin/Referer bo'yicha tekshiradi.
// Brauzerdagi begona saytlardan foydalanishni to'sadi; curl kabi vositalar bu headerni soxtalashtirishi mumkin,
// shuning uchun haqiqiy himoya — notifyLimiter va soatlik umumiy chegara.
const isSameSiteRequest = (req) => {
    const source = req.headers.origin || req.headers.referer;
    if (!source) return false;
    try {
        return isAllowedOrigin(new URL(source).origin, req);
    } catch {
        return false;
    }
};

// Yangi ariza haqida menejerlarga Telegram xabari — brauzer emas, server o'zi yuboradi
// (ariza bazaga tushgan zahoti; karyera testi arizalari ham shu yerdan xabar beradi)
const LEAD_KIND = {
    Kursga_Yozilish: ['📝', 'Kursga yozilish'],
    Konsultatsiya: ['💡', 'Bepul konsultatsiya'],
    Aloqa: ['📩', 'Aloqa formasi'],
    Karyera_Testi: ['🧭', 'Karyera testi'],
};
const notifyNewLead = (lead) => {
    if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
    const now = Date.now();
    if (now - telegramWindowStart > 60 * 60 * 1000) { telegramWindowStart = now; telegramWindowCount = 0; }
    if (++telegramWindowCount > TELEGRAM_HOURLY_CAP) { console.warn('Telegram soatlik chegarasi oshdi — xabar yuborilmadi.'); return; }
    lastAssignedManager = lastAssignedManager === 'A' ? 'B' : 'A';
    const [emoji, label] = LEAD_KIND[lead.source_ref] || ['🎯', 'Yangi ariza (Marketing)'];
    const ref = lead.resolvedSourceRef || lead.source_ref || 'Organik';
    const text =
        `${emoji} <b>${label} — DATA Ta'lim Stansiyasi</b>

` +
        `👤 <b>Ism:</b> ${escapeHtml(lead.name)}
` +
        `📞 <b>Telefon:</b> ${escapeHtml(lead.phone)}
` +
        `📚 <b>Kurs:</b> ${escapeHtml(lead.course_id || '—')}
` +
        `🔗 <b>Manba (ref):</b> ${escapeHtml(ref)}

` +
        `🕐 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
` +
        `👥 <b>Biriktirildi:</b> Menejer ${lastAssignedManager}`;
    sendTelegramMessage(text)
        .then((r) => { if (!r?.success) console.error('Lead Telegram xabari yuborilmadi:', r?.error); })
        .catch((e) => console.error('Lead Telegram xatosi:', e?.message || e));
};

app.post('/api/notify-telegram', leadsLimiter, notifyLimiter, async (req, res) => {
    if (!isSameSiteRequest(req)) return res.status(403).json({ error: 'Forbidden' });

    if (typeof req.body.message !== 'string') return res.status(400).json({ error: 'Message is required' });
    // eslint-disable-next-line no-control-regex
    const raw = req.body.message.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, TELEGRAM_MAX_RAW);
    if (!raw) return res.status(400).json({ error: 'Message is required' });

    if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
        console.warn('Telegram sozlanmagan. Xabar yuborilmadi.');
        return res.json({ success: true, skipped: true });
    }

    const now = Date.now();
    if (now - telegramWindowStart > 60 * 60 * 1000) {
        telegramWindowStart = now;
        telegramWindowCount = 0;
    }
    if (++telegramWindowCount > TELEGRAM_HOURLY_CAP) {
        console.warn('Telegram soatlik chegarasi oshdi — xabar yuborilmadi.');
        return res.status(429).json({ success: false, error: 'Too many requests' });
    }

    // Round-robin manager assignment
    let assignedManager = 'Menejer';
    try {
        lastAssignedManager = lastAssignedManager === 'A' ? 'B' : 'A';
        assignedManager = `Menejer ${lastAssignedManager}`;
    } catch (e) {
        console.error('Manager assignment error:', e);
    }

    const finalMessage = `${toTelegramHtml(raw)}\n\n👥 <b>Biriktirildi:</b> ${assignedManager}`;
    if (finalMessage.length > 4096) return res.status(400).json({ error: 'Message is too long' });

    // Telegram sekin/ishlamasa ham HTTP javobni TELEGRAM_RESPONSE_DEADLINE_MS dan ortiq kutdirmaymiz
    // (yuborish fonda davom etadi; frontend uchun Telegram faqat qo'shimcha bildirishnoma kanali).
    const sendPromise = sendTelegramMessage(finalMessage)
        .then((r) => {
            if (!r.success) console.error('Telegram xabari yuborilmadi:', r.error);
            return r;
        })
        .catch((err) => {
            console.error('Telegram yuborish xatosi:', err);
            return { success: false, error: 'Telegram xatosi' };
        });
    let deadline;
    const timeout = new Promise((resolve) => {
        deadline = setTimeout(() => resolve({ success: false, error: 'Telegram javobi kechikdi' }), TELEGRAM_RESPONSE_DEADLINE_MS);
    });
    const result = await Promise.race([sendPromise, timeout]);
    clearTimeout(deadline);
    res.json(result.success ? { success: true } : { success: false, error: 'Telegram xabari yuborilmadi' });
});

// Noma'lum /api yo'llari uchun JSON 404
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Yagona xato handler: ichki tafsilotlar mijozga chiqmaydi, serverda loglanadi
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof multer.MulterError) {
        const tooBig = err.code === 'LIMIT_FILE_SIZE';
        return res.status(tooBig ? 413 : 400).json({ error: tooBig ? `Fayl hajmi ${UPLOAD_MAX_BYTES / 1024 / 1024} MB dan oshmasin` : 'Invalid upload' });
    }
    if (err.status === 415 && err.expose) return res.status(415).json({ error: err.message });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    // Boshqa mijoz xatolari (masalan /uploads/%E0%A4 -> 400, noto'g'ri charset -> 415): 500 emas, mos 4xx
    const clientStatus = err.statusCode || err.status;
    if (Number.isInteger(clientStatus) && clientStatus >= 400 && clientStatus < 500) return res.status(clientStatus).json({ error: 'Bad request' });
    console.error('[API xato]', req.method, req.originalUrl, err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
// Productionda faqat loopback'da tinglaymiz: nginx orqali kirilsin, :4000 to'g'ridan-to'g'ri ochiq bo'lmasin
// (aks holda X-Forwarded-For soxtalashtirilib rate limit aylanib o'tilishi mumkin). HOST env bilan o'zgartiriladi.
const HOST = process.env.HOST || (IS_PROD ? '127.0.0.1' : undefined);
const onListen = () => console.log(`✅ Backend server running at http://${HOST || 'localhost'}:${PORT}`);
const server = HOST ? app.listen(PORT, HOST, onListen) : app.listen(PORT, onListen);

// Tutilmagan promise rad etilishi jarayonni yiqitmasin (log qilinadi)
process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});

// Graceful shutdown (pm2 restart / SIGTERM): yangi so'rovlarni to'xtatib, bazani yopamiz
const shutdown = (signal) => {
    console.log(`${signal} qabul qilindi, server to'xtatilmoqda...`);
    server.close(() => {
        try { db.close(); } catch { /* ignore */ }
        process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
