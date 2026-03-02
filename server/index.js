import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDB, initDB } from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
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

// --- MARKETING LINKS API ---
app.get('/api/marketing-links', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM marketing_links ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/marketing-links', (req, res) => {
    const { name, targetUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Generate a unique ref code based on the name and timestamp
    const baseCode = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const refCode = `${baseCode}-${Date.now().toString().slice(-4)}`;
    const finalTargetUrl = targetUrl || '/';

    try {
        const info = db.prepare('INSERT INTO marketing_links (name, ref_code, target_url) VALUES (?, ?, ?)').run(name, refCode, finalTargetUrl);
        const newLink = db.prepare('SELECT * FROM marketing_links WHERE id = ?').get(info.lastInsertRowid);
        res.json(newLink);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/marketing-links/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM marketing_links WHERE id = ?').run(req.params.id);
        res.json({ success: true });
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

// --- LEADS API ---
app.get('/api/leads', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/leads', (req, res) => {
    const { name, phone, courseId, sourceRef } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const insertLead = db.transaction(() => {
        const info = db.prepare('INSERT INTO leads (name, phone, course_id, source_ref) VALUES (?, ?, ?, ?)').run(name, phone, courseId || null, sourceRef || null);
        const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(info.lastInsertRowid);

        if (sourceRef) {
            // Increment leads_count for the matching marketing link
            db.prepare('UPDATE marketing_links SET leads_count = leads_count + 1 WHERE ref_code = ?').run(sourceRef);
        }
        return newLead;
    });

    try {
        const result = insertLead();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
            res.json(JSON.parse(row.value));
        } else {
            res.json(null);
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT (update) data by key
app.put('/api/:key', (req, res) => {
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

// POST to upload an image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the public URL path
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
