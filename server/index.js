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
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
initDB();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadDir), filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random()*1E9) + path.extname(file.originalname)) });
const upload = multer({ storage });
const db = getDB();
try { db.exec("ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new'"); } catch (_) {}

// STATS
app.get('/api/stats', (req, res) => { try { const l = db.prepare('SELECT COUNT(*) as count FROM leads').get(); const m = db.prepare('SELECT COUNT(*) as count FROM marketing_links').get(); const c = db.prepare('SELECT SUM(clicks) as total FROM marketing_links').get(); const t = db.prepare("SELECT COUNT(*) as count FROM leads WHERE date(created_at) = date('now')").get(); res.json({ leads: l.count, marketing: m.count, totalClicks: c.total||0, todayLeads: t.count }); } catch(e){ res.status(500).json({error:e.message}); } });

// COURSES LIGHT
app.get('/api/courses-light', (req, res) => { try { const row = db.prepare('SELECT value FROM app_data WHERE key = ?').get('courses'); if (row && row.value) { const courses = JSON.parse(row.value); res.json(courses.map(c => ({id:c.id, title:c.title}))); } else { res.json([]); } } catch(e){ res.status(500).json({error:e.message}); } });

// MARKETING LINKS
app.get('/api/marketing-links', (req, res) => { try { res.json(db.prepare('SELECT * FROM marketing_links ORDER BY created_at DESC').all()); } catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/marketing-links', (req, res) => { const {name, targetUrl} = req.body; if(!name) return res.status(400).json({error:'Name required'}); const rc = name.toLowerCase().replace(/[^a-z0-9]/g,'-')+'-'+Date.now().toString().slice(-4); try { const info = db.prepare('INSERT INTO marketing_links (name,ref_code,target_url) VALUES(?,?,?)').run(name,rc,targetUrl||'/'); res.json(db.prepare('SELECT * FROM marketing_links WHERE id=?').get(info.lastInsertRowid)); } catch(e){ res.status(500).json({error:e.message}); } });
app.delete('/api/marketing-links/:id', (req, res) => { try { db.prepare('DELETE FROM marketing_links WHERE id=?').run(req.params.id); res.json({success:true}); } catch(e){ res.status(500).json({error:e.message}); } });

// TRACKING
app.post('/api/track/click', (req, res) => { const {ref} = req.body; if(!ref) return res.status(400).json({error:'Ref required'}); try { db.prepare('UPDATE marketing_links SET clicks=clicks+1 WHERE ref_code=?').run(ref); const link = db.prepare('SELECT target_url FROM marketing_links WHERE ref_code=?').get(ref); res.json({success:true, target_url: link?link.target_url:'/'}); } catch(e){ res.status(500).json({error:e.message}); } });

// LEADS
app.get('/api/leads', (req, res) => { try { const {status, course} = req.query; let q='SELECT * FROM leads'; const cond=[]; const p=[]; if(status&&status!=='all'){cond.push('status=?');p.push(status);} if(course){cond.push('course_id LIKE ?');p.push('%'+course+'%');} if(cond.length) q+=' WHERE '+cond.join(' AND '); q+=' ORDER BY created_at DESC'; res.json(db.prepare(q).all(...p)); } catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/leads', (req, res) => { const {name,phone,courseId,sourceRef} = req.body; if(!name||!phone) return res.status(400).json({error:'Name and phone required'}); const ins = db.transaction(() => { const i = db.prepare('INSERT INTO leads(name,phone,course_id,source_ref) VALUES(?,?,?,?)').run(name,phone,courseId||null,sourceRef||null); const nl = db.prepare('SELECT * FROM leads WHERE id=?').get(i.lastInsertRowid); if(sourceRef) db.prepare('UPDATE marketing_links SET leads_count=leads_count+1 WHERE ref_code=?').run(sourceRef); return nl; }); try { res.json(ins()); } catch(e){ res.status(500).json({error:e.message}); } });
app.delete('/api/leads/:id', (req, res) => { try { db.prepare('DELETE FROM leads WHERE id=?').run(req.params.id); res.json({success:true}); } catch(e){ res.status(500).json({error:e.message}); } });
app.patch('/api/leads/:id', (req, res) => { const {status} = req.body; if(!['new','contacted','enrolled','rejected'].includes(status)) return res.status(400).json({error:'Invalid status'}); try { db.prepare('UPDATE leads SET status=? WHERE id=?').run(status,req.params.id); res.json({success:true}); } catch(e){ res.status(500).json({error:e.message}); } });

// GENERIC STORE
const KEYS = ['courses','team','site_content','visibility'];
app.get('/api/:key', (req,res) => { const {key}=req.params; if(!KEYS.includes(key)) return res.status(400).json({error:'Invalid key'}); try { const row=db.prepare('SELECT value FROM app_data WHERE key=?').get(key); res.json(row&&row.value?JSON.parse(row.value):null); } catch(e){ res.status(500).json({error:'DB error'}); } });
app.put('/api/:key', (req,res) => { const {key}=req.params; if(!KEYS.includes(key)) return res.status(400).json({error:'Invalid key'}); try { const val=JSON.stringify(req.body); db.prepare('INSERT INTO app_data(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP').run(key,val); res.json({success:true}); } catch(e){ res.status(500).json({error:'DB error'}); } });
app.post('/api/upload', upload.single('image'), (req,res) => { if(!req.file) return res.status(400).json({error:'No file'}); res.json({url:'/uploads/'+req.file.filename}); });

app.listen(PORT, () => console.log('Backend running at http://localhost:'+PORT));