import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { getDB, initDB } from './db.js';
import { fileURLToPath } from 'url';
import { appendLeadToSheet } from '../utils/googleSheets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env.local for PM2 backward compatibility
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'data-talim-super-secret-key-2026';

// Warn if using default JWT secret
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET environment variable o\'rnatilmagan! Default qiymat ishlatilmoqda. Production uchun .env.local da JWT_SECRET ni o\'rnating.');
}

// Telegram config — faqat server tomonida
const TG_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TG_CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || '';
let lastAssignedManager = 'B'; // Round-robin: alternates between A and B

// Basic input sanitization
const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/<[^>]*>/g, '').substring(0, 500);
};

// Rate limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 5, // max 5 urinish
    message: { error: 'Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring.' },
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

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure DB and Uploads directory exist
initDB();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Database helper
const db = getDB();

// --- AUTHENTICATION API ---
app.post('/api/admin/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = bcrypt.compareSync(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token valid for 8 hours
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });

        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// --- MARKETING LINKS API ---
app.get('/api/marketing-links', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM marketing_links ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/marketing-links', authenticateToken, (req, res) => {
    const name = sanitize(req.body.name);
    const targetUrl = sanitize(req.body.targetUrl);
    const category = sanitize(req.body.category);
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Generate a purely random 6-character ref code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let refCode = '';
    for (let i = 0; i < 6; i++) {
        refCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const finalTargetUrl = targetUrl || '/';

    try {
        const linkCategory = category || 'IT';
        const info = db.prepare('INSERT INTO marketing_links (name, ref_code, target_url, category) VALUES (?, ?, ?, ?)').run(name, refCode, finalTargetUrl, linkCategory);
        const newLink = db.prepare('SELECT * FROM marketing_links WHERE id = ?').get(info.lastInsertRowid);
        res.json(newLink);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/marketing-links/:id', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM marketing_links WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET basic link info (public, used by forms)
app.get('/api/marketing-links/info/:ref', (req, res) => {
    const { ref } = req.params;
    try {
        const link = db.prepare('SELECT name, category FROM marketing_links WHERE ref_code = ?').get(ref);
        if (link) {
            res.json(link);
        } else {
            res.status(404).json({ error: 'Link not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TRACKING API ---
app.post('/api/track/click', (req, res) => {
    const { ref } = req.body;
    if (!ref) return res.status(400).json({ error: 'Ref code required' });

    try {
        db.prepare('UPDATE marketing_links SET clicks = clicks + 1 WHERE ref_code = ?').run(ref);
        const link = db.prepare('SELECT target_url FROM marketing_links WHERE ref_code = ?').get(ref);

        res.json({ success: true, target_url: link ? link.target_url : '/' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUND ROBIN ASSIGNMENT (lastAssignedManager yuqorida aniqlangan) ---

app.get('/api/next-manager', (req, res) => {
    lastAssignedManager = lastAssignedManager === 'A' ? 'B' : 'A';
    res.json({ manager: lastAssignedManager });
});

// --- LEADS API ---
app.get('/api/leads', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/leads', leadsLimiter, (req, res) => {
    const name = sanitize(req.body.name);
    const phone = sanitize(req.body.phone);
    const courseId = sanitize(req.body.courseId);
    const sourceRef = sanitize(req.body.sourceRef);
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const insertLead = db.transaction(() => {
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

        return { lead: newLead, actualSourceRef };
    });

    try {
        const { lead, actualSourceRef: resolvedRef } = insertLead();

        // Use resolvedRef for response instead of arbitrary `sourceRef`
        const finalResult = { ...lead, resolvedSourceRef: resolvedRef || sourceRef };

        // Asynchronously save to Google Sheets
        appendLeadToSheet(finalResult).catch(err => {
            console.error("Failed to append lead to Google Sheet in background:", err);
        });

        res.json(finalResult);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete lead
app.delete('/api/leads/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;

        const lead = db.prepare('SELECT source_ref FROM leads WHERE id = ?').get(id);

        const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Decrement leads count from marketing link if applicable
        if (lead && lead.source_ref) {
            db.prepare('UPDATE marketing_links SET leads_count = MAX(0, leads_count - 1) WHERE name = ? OR ref_code = ?').run(lead.source_ref, lead.source_ref);
        }

        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// API Endpoints for Data Ta'lim Store
const KEYS = ['courses', 'team', 'site_content', 'visibility'];

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
                        if (typeof obj[k] === 'string' && (obj[k].startsWith('data:image') || obj[k].includes('picsum.photos'))) {
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
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT (update) data by key
app.put('/api/:key', authenticateToken, (req, res) => {
    const { key } = req.params;
    if (!KEYS.includes(key)) {
        return res.status(400).json({ error: 'Invalid key' });
    }

    try {
        const value = JSON.stringify(req.body);
        const stmt = db.prepare(`
      INSERT INTO app_data (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);
        stmt.run(key, value);
        res.json({ success: true, message: `${key} updated successfully` });
    } catch (err) {
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
    const webpName = baseName + '.webp';
    const webpPath = path.join(uploadDir, webpName);

    try {
        // Dynamically import sharp (ESM compatible)
        const { default: sharp } = await import('sharp');

        await sharp(originalPath)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(webpPath);

        // Remove original file
        fs.unlinkSync(originalPath);

        const webpSize = fs.statSync(webpPath).size;
        const imageUrl = `/uploads/${webpName}`;
        res.json({ url: imageUrl, originalSize, webpSize });
    } catch (err) {
        // Fallback: keep original if sharp fails
        console.error('WebP konvertatsiya xatosi (fallback):', err);
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ url: imageUrl, originalSize, webpSize: originalSize });
    }
});

// --- TELEGRAM NOTIFICATION API (server-side only, token not exposed to frontend) ---
app.post('/api/notify-telegram', leadsLimiter, async (req, res) => {
    const message = sanitize(req.body.message);
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
        console.warn('Telegram sozlanmagan. Xabar yuborilmadi.');
        return res.json({ success: true, skipped: true });
    }

    try {
        // Round-robin manager assignment
        let assignedManager = 'Menejer';
        try {
            lastAssignedManager = lastAssignedManager === 'A' ? 'B' : 'A';
            assignedManager = `Menejer ${lastAssignedManager}`;
        } catch (e) {
            console.error('Manager assignment error:', e);
        }

        const finalMessage = `${message}\n\n👥 <b>Biriktirildi:</b> ${assignedManager}`;

        const tgResponse = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: finalMessage,
                parse_mode: 'HTML',
            }),
        });

        if (!tgResponse.ok) {
            const data = await tgResponse.json();
            return res.json({ success: false, error: data.description || 'Telegram xatosi' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Telegram send error:', err);
        res.json({ success: false, error: err.message || 'Tarmoq xatosi' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
