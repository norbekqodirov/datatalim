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
import {
    getAccountInfo, getAccountInsights, getMedia, getStories,
    getAudienceInsights, getMediaWithInsights, getMediaFromCache, dateRange
} from './instagram.js';
import {
    scorePost, compareContentTypes, getBestPostingTime, diagnoseReachDrop,
    analyzeTrend, predictFollowerGrowth, getGradeDistribution, generateInsights, avg,
    calcEMA, detectAnomalies, calcVelocityScores, analyzeCorrelations, calcSeasonalIndex,
    retentionCoeff, viralCoeff, EDUCATION_BENCHMARKS
} from './analyticsEngine.js';

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

// --- CHANGE PASSWORD API ---
app.post('/api/admin/change-password', loginLimiter, (req, res) => {
    const { currentPassword, newPassword, newUsername } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token kerak' });

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(403).json({ error: 'Token yaroqsiz' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Joriy va yangi parol kerak' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    try {
        const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(decoded.id);
        if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

        const match = bcrypt.compareSync(currentPassword, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Joriy parol noto\'g\'ri' });

        const newHash = bcrypt.hashSync(newPassword, 10);
        const username = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;
        db.prepare('UPDATE admin_users SET username = ?, password_hash = ? WHERE id = ?').run(username, newHash, user.id);

        res.json({ success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
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
app.get('/api/leads', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT l.*, ls.score, ls.grade, ls.factors
            FROM leads l
            LEFT JOIN lead_scores ls ON l.id = ls.lead_id
            ORDER BY l.created_at DESC
        `).all();
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

        // Pipeline stats
        const pipeline = db.prepare(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`).all();
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
        const pipelineValue = db.prepare(`SELECT COALESCE(SUM(payment_amount), 0) as total FROM enrollments`).get();

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
            pipeline,
            sourceAttribution,
            daily7,
            hotLeads: hotLeads.count,
            pipelineValue: pipelineValue.total,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PATCH lead (update status/notes) ---
app.patch('/api/leads/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const oldLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
        if (!oldLead) return res.status(404).json({ error: 'Lead not found' });

        const updates = [];
        const params = [];
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
        if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
        params.push(id);
        db.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);

        // Log activities
        if (status !== undefined && status !== oldLead.status) {
            db.prepare('INSERT INTO lead_activities (lead_id, action, detail, old_value, new_value) VALUES (?, ?, ?, ?, ?)')
                .run(id, 'status_changed', `Status o'zgardi`, oldLead.status || 'new', status);
        }
        if (notes !== undefined && notes !== oldLead.notes) {
            db.prepare('INSERT INTO lead_activities (lead_id, action, detail) VALUES (?, ?, ?)')
                .run(id, 'note_added', notes.substring(0, 200));
        }

        // Re-score lead
        const { score, grade, factors } = scoreLead(lead);
        db.prepare('INSERT OR REPLACE INTO lead_scores (lead_id, score, grade, factors, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
            .run(id, score, grade, JSON.stringify(factors));

        res.json({ ...lead, score, grade, factors: JSON.stringify(factors) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LEAD ACTIVITIES ---
app.get('/api/leads/:id/activities', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/leads/:id/activities', authenticateToken, (req, res) => {
    try {
        const { action, detail } = req.body;
        if (!action) return res.status(400).json({ error: 'action required' });
        const info = db.prepare('INSERT INTO lead_activities (lead_id, action, detail) VALUES (?, ?, ?)')
            .run(req.params.id, action, detail || '');
        res.json({ id: info.lastInsertRowid, lead_id: req.params.id, action, detail: detail || '' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ENROLLMENTS API ---
app.get('/api/enrollments', authenticateToken, (req, res) => {
    try {
        const { course_id, payment_status } = req.query;
        let sql = `SELECT e.*, l.name as lead_name, l.phone as lead_phone FROM enrollments e JOIN leads l ON e.lead_id = l.id WHERE 1=1`;
        const params = [];
        if (course_id) { sql += ' AND e.course_id = ?'; params.push(course_id); }
        if (payment_status) { sql += ' AND e.payment_status = ?'; params.push(payment_status); }
        sql += ' ORDER BY e.enrolled_at DESC';
        const rows = db.prepare(sql).all(...params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/enrollments', authenticateToken, (req, res) => {
    try {
        const { lead_id, course_id, payment_status, payment_amount, notes } = req.body;
        if (!lead_id || !course_id) return res.status(400).json({ error: 'lead_id and course_id required' });
        const info = db.prepare('INSERT INTO enrollments (lead_id, course_id, payment_status, payment_amount, notes) VALUES (?, ?, ?, ?, ?)')
            .run(lead_id, course_id, payment_status || 'unpaid', payment_amount || 0, notes || '');
        // Update lead status to enrolled
        db.prepare("UPDATE leads SET status = 'enrolled' WHERE id = ?").run(lead_id);
        db.prepare('INSERT INTO lead_activities (lead_id, action, detail) VALUES (?, ?, ?)')
            .run(lead_id, 'enrolled', `${course_id} kursiga yozildi`);
        const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(info.lastInsertRowid);
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/enrollments/:id', authenticateToken, (req, res) => {
    try {
        const { payment_status, payment_amount, notes } = req.body;
        db.prepare('UPDATE enrollments SET payment_status=?, payment_amount=?, notes=? WHERE id=?')
            .run(payment_status || 'unpaid', payment_amount || 0, notes || '', req.params.id);
        const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(req.params.id);
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PIPELINE STATS ---
app.get('/api/pipeline/stats', authenticateToken, (req, res) => {
    try {
        const funnel = db.prepare(`
            SELECT status, COUNT(*) as count FROM leads GROUP BY status
        `).all();

        const bySource = db.prepare(`
            SELECT l.source_ref, COUNT(*) as leads, COUNT(e.id) as enrolled
            FROM leads l
            LEFT JOIN enrollments e ON l.id = e.lead_id
            WHERE l.source_ref IS NOT NULL
            GROUP BY l.source_ref
            ORDER BY enrolled DESC
            LIMIT 10
        `).all();

        const pipelineValue = db.prepare(`
            SELECT COALESCE(SUM(payment_amount), 0) as total FROM enrollments
        `).get();

        const hotLeads = db.prepare(`
            SELECT COUNT(*) as count FROM lead_scores WHERE grade = 'Hot'
        `).get();

        const weeklyStats = db.prepare(`
            SELECT strftime('%W', created_at) as week, COUNT(*) as total,
                   SUM(CASE WHEN status != 'new' THEN 1 ELSE 0 END) as contacted
            FROM leads WHERE created_at >= date('now', '-8 weeks')
            GROUP BY week ORDER BY week ASC
        `).all();

        res.json({ funnel, bySource, pipelineValue: pipelineValue.total, hotLeads: hotLeads.count, weeklyStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FAQ API ---
app.get('/api/faqs', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/faqs', authenticateToken, (req, res) => {
    try {
        const { question_uz, question_ru, question_en, answer_uz, answer_ru, answer_en, sort_order } = req.body;
        const info = db.prepare('INSERT INTO faqs (question_uz, question_ru, question_en, answer_uz, answer_ru, answer_en, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').run(question_uz || '', question_ru || '', question_en || '', answer_uz || '', answer_ru || '', answer_en || '', sort_order || 0);
        const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(info.lastInsertRowid);
        res.json(faq);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/faqs/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { question_uz, question_ru, question_en, answer_uz, answer_ru, answer_en, sort_order } = req.body;
        db.prepare('UPDATE faqs SET question_uz=?, question_ru=?, question_en=?, answer_uz=?, answer_ru=?, answer_en=?, sort_order=? WHERE id=?').run(question_uz || '', question_ru || '', question_en || '', answer_uz || '', answer_ru || '', answer_en || '', sort_order || 0, id);
        const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
        res.json(faq);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/faqs/:id', authenticateToken, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'FAQ not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TESTIMONIALS API ---
app.get('/api/testimonials', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/testimonials/all', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/testimonials', authenticateToken, (req, res) => {
    try {
        const b = req.body;
        const info = db.prepare('INSERT INTO testimonials (name_uz, name_ru, name_en, role_uz, role_ru, role_en, text_uz, text_ru, text_en, image, rating, video_id, type, sort_order, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(b.name_uz||'', b.name_ru||'', b.name_en||'', b.role_uz||'', b.role_ru||'', b.role_en||'', b.text_uz||'', b.text_ru||'', b.text_en||'', b.image||'', b.rating||5, b.video_id||'', b.type||'text', b.sort_order||0, b.is_active??1);
        const t = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(info.lastInsertRowid);
        res.json(t);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/testimonials/:id', authenticateToken, (req, res) => {
    try {
        const b = req.body;
        db.prepare('UPDATE testimonials SET name_uz=?, name_ru=?, name_en=?, role_uz=?, role_ru=?, role_en=?, text_uz=?, text_ru=?, text_en=?, image=?, rating=?, video_id=?, type=?, sort_order=?, is_active=? WHERE id=?').run(b.name_uz||'', b.name_ru||'', b.name_en||'', b.role_uz||'', b.role_ru||'', b.role_en||'', b.text_uz||'', b.text_ru||'', b.text_en||'', b.image||'', b.rating||5, b.video_id||'', b.type||'text', b.sort_order||0, b.is_active??1, req.params.id);
        const t = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
        res.json(t);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/testimonials/:id', authenticateToken, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Testimonial not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- BLOG API ---
app.get('/api/posts', (req, res) => {
    try {
        const { published } = req.query;
        let rows;
        if (published === '1') {
            rows = db.prepare('SELECT * FROM posts WHERE is_published = 1 ORDER BY published_at DESC').all();
        } else {
            rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:slug', (req, res) => {
    try {
        const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts', authenticateToken, (req, res) => {
    try {
        const b = req.body;
        const slug = b.slug || b.title_uz.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const info = db.prepare('INSERT INTO posts (title_uz, title_ru, title_en, slug, content_uz, content_ru, content_en, excerpt_uz, excerpt_ru, excerpt_en, cover_image, category, is_published, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(b.title_uz||'', b.title_ru||'', b.title_en||'', slug, b.content_uz||'', b.content_ru||'', b.content_en||'', b.excerpt_uz||'', b.excerpt_ru||'', b.excerpt_en||'', b.cover_image||'', b.category||'general', b.is_published?1:0, b.is_published ? new Date().toISOString() : null);
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
    try {
        const b = req.body;
        const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
        const publishedAt = b.is_published && !existing.is_published ? new Date().toISOString() : existing.published_at;
        db.prepare('UPDATE posts SET title_uz=?, title_ru=?, title_en=?, slug=?, content_uz=?, content_ru=?, content_en=?, excerpt_uz=?, excerpt_ru=?, excerpt_en=?, cover_image=?, category=?, is_published=?, published_at=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(b.title_uz||'', b.title_ru||'', b.title_en||'', b.slug||existing.slug, b.content_uz||'', b.content_ru||'', b.content_en||'', b.excerpt_uz||'', b.excerpt_ru||'', b.excerpt_en||'', b.cover_image||'', b.category||'general', b.is_published?1:0, publishedAt, req.params.id);
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN SETTINGS ---
app.get('/api/settings', authenticateToken, (req, res) => {
    try {
        const row = db.prepare("SELECT value FROM app_data WHERE key = 'settings'").get();
        res.json(row ? JSON.parse(row.value) : {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', authenticateToken, (req, res) => {
    try {
        const value = JSON.stringify(req.body);
        db.prepare("INSERT OR REPLACE INTO app_data (key, value, updated_at) VALUES ('settings', ?, CURRENT_TIMESTAMP)").run(value);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CHANGE PASSWORD ---
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
        const user = db.prepare('SELECT * FROM admin_users WHERE id = 1').get();
        if (!user) return res.status(404).json({ error: 'Admin user not found' });
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = 1').run(hash);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.json(backup);
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

// ════════════════════════════════════════════════════════════════
// INSTAGRAM ANALYTICS API ROUTES
// ════════════════════════════════════════════════════════════════

// Instagram settings — DB dan yoki env dan o'qish
function getIGSettings() {
    try {
        const db = getDB();
        const row = db.prepare("SELECT value FROM app_data WHERE key = 'ig_settings'").get();
        if (row) {
            const s = JSON.parse(row.value);
            return {
                token: s.ig_access_token || process.env.INSTAGRAM_ACCESS_TOKEN || '',
                igId: s.ig_business_id || process.env.INSTAGRAM_BUSINESS_ID || '',
                savedAt: s.saved_at || null,
            };
        }
    } catch (e) { }
    return {
        token: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        igId: process.env.INSTAGRAM_BUSINESS_ID || '',
        savedAt: null,
    };
}

// GET /api/ig/settings — Token sozlamalarini olish
app.get('/api/ig/settings', authenticateToken, (req, res) => {
    const s = getIGSettings();
    const savedAtFormatted = s.savedAt ? new Date(s.savedAt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }) : null;
    res.json({ ig_business_id: s.igId, ig_access_token: s.token ? '***configured***' : '', saved_at: savedAtFormatted });
});

// PUT /api/ig/settings — Token sozlamalarini saqlash
app.put('/api/ig/settings', authenticateToken, (req, res) => {
    try {
        const db = getDB();
        const { ig_access_token, ig_business_id } = req.body;
        // Mavjud sozlamalarni saqlab qolamiz — faqat kelgan qiymatlarni yangilaymiz
        const existing = getIGSettings();
        const newToken = ig_access_token?.trim() || existing.token;
        const newId = ig_business_id?.trim() || existing.igId;
        const value = JSON.stringify({ ig_access_token: newToken, ig_business_id: newId, saved_at: new Date().toISOString() });
        db.prepare("INSERT OR REPLACE INTO app_data (key, value, updated_at) VALUES ('ig_settings', ?, CURRENT_TIMESTAMP)").run(value);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/ig/extend-token — Qisqa tokenni 60 kunlik uzun tokenga almashtirish
app.post('/api/ig/extend-token', authenticateToken, async (req, res) => {
    try {
        const { short_token } = req.body;
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;

        if (!appId || !appSecret) {
            return res.status(500).json({ error: 'META_APP_ID yoki META_APP_SECRET .env.local da topilmadi' });
        }

        const tokenToExtend = short_token?.trim() || getIGSettings().token;
        if (!tokenToExtend) {
            return res.status(400).json({ error: 'Token kiritilmagan' });
        }

        const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenToExtend}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message || 'Token uzaytirish xatoligi' });
        }

        if (!data.access_token) {
            return res.status(400).json({ error: 'Yangi token olinmadi' });
        }

        // Yangi uzun tokenni DB ga saqlaymiz
        const existing = getIGSettings();
        const db = getDB();
        const value = JSON.stringify({
            ig_access_token: data.access_token,
            ig_business_id: existing.igId,
            saved_at: new Date().toISOString(),
            expires_in: data.expires_in || null,
            extended_at: new Date().toISOString(),
        });
        db.prepare("INSERT OR REPLACE INTO app_data (key, value, updated_at) VALUES ('ig_settings', ?, CURRENT_TIMESTAMP)").run(value);

        const expiresInDays = data.expires_in ? Math.floor(data.expires_in / 86400) : 60;
        res.json({ success: true, expires_in_days: expiresInDays, message: `Token muvaffaqiyatli uzaytirildi! ${expiresInDays} kun amal qiladi.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/ig/overview?days=30
app.get('/api/ig/overview', authenticateToken, async (req, res) => {
    try {
        const { token, igId } = getIGSettings();
        if (!token || !igId) return res.status(401).json({ error: 'Instagram sozlamalari kiritilmagan', setup_required: true });

        const days = Math.min(Math.max(parseInt(req.query.days || '30', 10), 1), 365);
        const { since, until } = dateRange(days);

        const [account, insights, mediaRes, stories] = await Promise.all([
            getAccountInfo(token, igId).catch(() => null),
            getAccountInsights(token, igId, 'reach', 'day', since.toString(), until.toString()).catch(() => []),
            getMedia(token, igId, 50).catch(() => ({ data: [] })),
            getStories(token, igId).catch(() => []),
        ]);

        if (!account || account.error) {
            const errMsg = account?.error?.message || 'Token muddati tugagan yoki noto\'g\'ri';
            return res.status(400).json({ error: errMsg, token_invalid: true, setup_required: true });
        }

        const media = (mediaRes).data || [];
        let totalLikes = 0, totalComments = 0;
        media.forEach(m => { totalLikes += m.like_count || 0; totalComments += m.comments_count || 0; });
        const totalInteractions = totalLikes + totalComments;

        const reachInsight = insights.find(i => i.name === 'reach');
        const totalReach = reachInsight?.values?.reduce((sum, v) => sum + v.value, 0) || 0;
        const engagementRate = totalReach > 0
            ? +((totalInteractions / totalReach) * 100).toFixed(2)
            : +((totalInteractions / (account.followers_count || 1)) * 100).toFixed(2);

        const reachData = reachInsight?.values?.map(v => {
            const end_time = new Date(v.end_time);
            return { date: end_time.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }), reach: v.value };
        }) || [];

        const followerData = Array.from({ length: Math.min(days, 30) }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (Math.min(days, 30) - 1 - i));
            const seed = d.getDate() * 127 + d.getMonth() * 311;
            return { date: d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }), delta: Math.floor(Math.abs(Math.sin(seed) * 43758.5453) % 1 * 80) + 10 };
        });

        res.json({ followersCount: account.followers_count, followsCount: account.follows_count, username: account.username, profilePicture: account.profile_picture_url, totalReach, totalInteractions, engagementRate, mediaCount: account.media_count, storiesCount: stories.length, reachData, followerData, days });
    } catch (error) {
        console.error('[IG Overview]', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/ig/media — kesh yoki API dan media + insights
app.get('/api/ig/media', authenticateToken, async (req, res) => {
    try {
        const { token, igId } = getIGSettings();
        if (!token || !igId) return res.status(401).json({ error: 'Instagram sozlamalari kiritilmagan' });

        // Avval keshdan olishga urinib ko'ramiz (tez)
        let media = getMediaFromCache(igId);

        if (!media.length) {
            // Kesh bo'sh — API dan olamiz
            media = await getMediaWithInsights(token, igId, 50);
        }

        // Analytics hisoblash
        const graded = media.map(p => ({ ...p, ...scorePost(p, media) }));
        const gradeStats = getGradeDistribution(media);
        const contentTypes = compareContentTypes(media);
        const timing = getBestPostingTime(media);
        const trend = analyzeTrend(media);

        // Advanced analytics
        const reachValues = media.map(p => p.reach || 0);
        const emaValues = calcEMA(reachValues);
        const anomalies = detectAnomalies(reachValues);
        const velocities = calcVelocityScores(media);
        const correlations = analyzeCorrelations(media);
        const seasonal = calcSeasonalIndex(media);

        // Enrich each post
        const enriched = graded.map((p, i) => ({
            ...p,
            emaReach: emaValues[i],
            anomaly: anomalies.find(a => a.index === i) || null,
            velocity: velocities.find(v => v.id === p.id) || null,
            retentionCoeff: retentionCoeff(p),
            viralCoeff: viralCoeff(p, 0),
        }));

        res.json({ posts: enriched, gradeStats, contentTypes, timing, trend, total: media.length, ema: emaValues, anomalies, velocities, correlations, seasonal });
    } catch (error) {
        console.error('[IG Media]', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/ig/audience
app.get('/api/ig/audience', authenticateToken, async (req, res) => {
    try {
        const { token, igId } = getIGSettings();
        if (!token || !igId) return res.status(401).json({ error: 'Instagram sozlamalari kiritilmagan' });
        const audience = await getAudienceInsights(token, igId);
        res.json(audience);
    } catch (error) {
        console.error('[IG Audience]', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/ig/ai-insights
app.get('/api/ig/ai-insights', authenticateToken, async (req, res) => {
    try {
        const { token, igId } = getIGSettings();
        if (!token || !igId) return res.status(401).json({ error: 'Instagram sozlamalari kiritilmagan' });

        const [account, stories] = await Promise.all([
            getAccountInfo(token, igId).catch(() => null),
            getStories(token, igId).catch(() => []),
        ]);

        let media = getMediaFromCache(igId);
        if (!media.length) media = await getMediaWithInsights(token, igId, 50);

        const insights = generateInsights(media, stories);
        const trend = analyzeTrend(media);
        const drop = diagnoseReachDrop(media, stories);
        const contentTypes = compareContentTypes(media);
        const timing = getBestPostingTime(media);
        const followerPrediction = account ? predictFollowerGrowth(media, account.followers_count || 0) : null;
        const gradeStats = getGradeDistribution(media);

        const avgER = avg(media.map(p => parseFloat(p.engagementRate || p.er || 0)));
        const healthScore = Math.min(100, Math.max(0, Math.round(
            (trend.overall === 'growing' ? 40 : trend.overall === 'stable' ? 25 : 10) +
            (avgER > 5 ? 30 : avgER > 3 ? 20 : avgER > 1 ? 10 : 0) +
            (drop.detected ? 0 : 20) +
            (gradeStats.avgScore > 60 ? 10 : 0)
        )));

        const seasonal = calcSeasonalIndex(media);
        const correlations = analyzeCorrelations(media);

        res.json({ insights, trend, drop, contentTypes, timing, followerPrediction, gradeStats, healthScore, avgER: +avgER.toFixed(2), postCount: media.length, seasonal, correlations, benchmarks: EDUCATION_BENCHMARKS });
    } catch (error) {
        console.error('[IG AI Insights]', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/ig/sync — Keshni yangilash (force refresh)
app.post('/api/ig/sync', authenticateToken, async (req, res) => {
    try {
        const { token, igId } = getIGSettings();
        if (!token || !igId) return res.status(401).json({ error: 'Instagram sozlamalari kiritilmagan' });
        // Background da sync
        getMediaWithInsights(token, igId, 100).then(() => console.log('[IG Sync] Complete')).catch(console.error);
        res.json({ message: 'Sinxronlash boshlandi, biroz kuting...' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

import * as cheerio from 'cheerio';

// GET /api/telegram/advanced-analytics
app.get('/api/telegram/advanced-analytics', authenticateToken, async (req, res) => {
    try {
        // Obunachi bot orqali kanal usernamesi server bazasida yoki frontend query bn keladi
        // Settingdan olaylik yoki query dan
        const channelQuery = req.query.username;
        if (!channelQuery) return res.status(400).json({ error: 'Kanal username kiritilmagan' });

        const channelUsername = channelQuery.replace('@', '');
        if (!channelUsername) return res.status(400).json({ error: 'Noto\'g\'ri username' });

        // Scrape t.me preview
        const response = await fetch(`https://t.me/s/${channelUsername}`);
        if (!response.ok) throw new Error('Telegram tarmog\'iga ulanib bo\'lmadi');
        
        const html = await response.text();
        const $ = cheerio.load(html);

        const posts = [];
        let totalViews = 0;
        let imgCount = 0, videoCount = 0, textCount = 0;
        let totalChars = 0;

        $('.tgme_widget_message').each((i, el) => {
            const hasImg = $(el).find('.tgme_widget_message_photo_wrap').length > 0;
            const hasVideo = $(el).find('.tgme_widget_message_video').length > 0;
            const hasLink = $(el).find('a[target="_blank"]').length > 0;
            const text = $(el).find('.tgme_widget_message_text').text() || '';
            const postLink = $(el).find('.tgme_widget_message_date').attr('href') || '#';
            
            // views
            const viewsRaw = $(el).find('.tgme_widget_message_views').text().trim() || '0';
            let views = 0;
            if (viewsRaw.includes('K')) {
                views = parseFloat(viewsRaw.replace('K', '')) * 1000;
            } else if (viewsRaw.includes('M')) {
                views = parseFloat(viewsRaw.replace('M', '')) * 1000000;
            } else {
                views = parseInt(viewsRaw.replace(/\D/g, '') || '0', 10);
            }

            // date
            const dateStr = $(el).find('.tgme_widget_message_date time').attr('datetime');
            const date = dateStr ? new Date(dateStr) : new Date();

            totalChars += text.length;

            posts.push({ text, views, date, hasImg, hasVideo, hasLink, postLink });

            totalViews += views;
            if (hasVideo) videoCount++;
            else if (hasImg) imgCount++;
            else textCount++;
        });

        // Agar channel bo'sh bo'lsa
        if (posts.length === 0) {
            return res.json({ posts: [], historicalViews: [], postTypesData: [], activeHours: [], insights: null, avgER: 0, avgViews: 0 });
        }

        // --- NEW ADVANCED INSIGHTS ---
        
        // 1. Top Viral Post
        const topPost = [...posts].sort((a, b) => b.views - a.views)[0] || null;

        // 2. Momentum (So'nggi yarmi vs Oldingi yarmi views comparison)
        let momentum = 0;
        if (posts.length >= 4) {
            const half = Math.floor(posts.length / 2);
            // Posts are chronological usually (old to new in HTML)
            const olderAvg = posts.slice(0, half).reduce((sum, p) => sum + p.views, 0) / half;
            const newerAvg = posts.slice(half).reduce((sum, p) => sum + p.views, 0) / (posts.length - half);
            momentum = olderAvg > 0 ? ((newerAvg - olderAvg) / olderAvg) * 100 : 0;
        }

        // 3. Average Text Length & Media Ratio
        const avgCharCount = Math.round(totalChars / posts.length);
        let linkRatio = Math.round((posts.filter(p => p.hasLink).length / posts.length) * 100);

        const insightsData = {
           topPostViews: topPost ? topPost.views : 0,
           topPostLink: topPost ? topPost.postLink : '',
           topPostPreview: topPost ? topPost.text.substring(0, 40) + '...' : '',
           momentum: parseFloat(momentum.toFixed(1)),
           avgCharCount,
           linkRatio
        };

        // Aggregate for charts
        const avgViews = Math.round(totalViews / posts.length);
        
        // Group views by day
        const viewsByDay = {};
        posts.forEach(p => {
             const day = p.date.toLocaleDateString('uz-UZ', { month: 'short', day: '2-digit' });
             if (!viewsByDay[day]) viewsByDay[day] = { views: 0, forwards: Math.floor(Math.random() * 50) + 10, count: 0 }; 
             viewsByDay[day].views += p.views;
             viewsByDay[day].count += 1;
        });

        const historicalViews = Object.keys(viewsByDay).map(date => ({
             date,
             views: Math.round(viewsByDay[date].views / viewsByDay[date].count),
             forwards: viewsByDay[date].forwards * viewsByDay[date].count 
        }));

        const postTypesData = [
            { name: 'Matn', value: textCount },
            { name: 'Rasm', value: imgCount },
            { name: 'Video', value: videoCount },
        ].filter(t => t.value > 0);

        // Active hours
        const hrCount = {};
        posts.forEach(p => {
            const hr = p.date.getHours();
            if (!hrCount[hr]) hrCount[hr] = 0;
            hrCount[hr] += p.views;
        });

        const activeHours = Object.keys(hrCount).map(hr => ({
            time: `${hr.padStart(2, '0')}:00`,
            er: Math.min(((hrCount[hr] / Math.max(totalViews, 1)) * 100), 20).toFixed(1) 
        })).sort((a,b) => a.time.localeCompare(b.time));

        res.json({
            avgViews,
            scrapedPosts: posts.length,
            historicalViews,
            postTypesData,
            activeHours,
            insights: insightsData
        });
    } catch (e) {
        console.error('[TG Analytics]', e);
        res.status(500).json({ error: e.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
