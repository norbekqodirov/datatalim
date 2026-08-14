import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_PATH = path.join(__dirname, 'data.db');

export function getDB() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

export function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_data(
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS marketing_links(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ref_code TEXT UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    category TEXT DEFAULT 'IT',
    clicks INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS leads(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    course_id TEXT,
    source_ref TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS admin_users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `);

  // Migrations: add columns if they don't exist
  try {
    db.prepare("SELECT status FROM leads LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new'");
    console.log('  → Added status column to leads');
  }
  try {
    db.prepare("SELECT notes FROM leads LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE leads ADD COLUMN notes TEXT DEFAULT ''");
    console.log('  → Added notes column to leads');
  }
  try {
    db.prepare("SELECT role FROM admin_users LIMIT 1").get();
  } catch {
    db.exec("ALTER TABLE admin_users ADD COLUMN role TEXT DEFAULT 'admin'");
    console.log('  → Added role column to admin_users');
  }

  // FAQs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_uz TEXT NOT NULL DEFAULT '',
      question_ru TEXT DEFAULT '',
      question_en TEXT DEFAULT '',
      answer_uz TEXT NOT NULL DEFAULT '',
      answer_ru TEXT DEFAULT '',
      answer_en TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Testimonials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_uz TEXT NOT NULL DEFAULT '',
      name_ru TEXT DEFAULT '',
      name_en TEXT DEFAULT '',
      role_uz TEXT DEFAULT '',
      role_ru TEXT DEFAULT '',
      role_en TEXT DEFAULT '',
      text_uz TEXT DEFAULT '',
      text_ru TEXT DEFAULT '',
      text_en TEXT DEFAULT '',
      image TEXT DEFAULT '',
      rating INTEGER DEFAULT 5,
      video_id TEXT DEFAULT '',
      type TEXT DEFAULT 'text',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Lead activities table (audit trail)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_activities(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      old_value TEXT DEFAULT '',
      new_value TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Lead scores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_scores(
      lead_id INTEGER PRIMARY KEY,
      score INTEGER DEFAULT 0,
      grade TEXT DEFAULT 'Unqualified',
      factors TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Enrollments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      course_id TEXT NOT NULL,
      payment_status TEXT DEFAULT 'unpaid',
      payment_amount INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT ''
    );
  `);

  // Blog posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_uz TEXT NOT NULL DEFAULT '',
      title_ru TEXT DEFAULT '',
      title_en TEXT DEFAULT '',
      slug TEXT UNIQUE NOT NULL,
      content_uz TEXT DEFAULT '',
      content_ru TEXT DEFAULT '',
      content_en TEXT DEFAULT '',
      excerpt_uz TEXT DEFAULT '',
      excerpt_ru TEXT DEFAULT '',
      excerpt_en TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ===== LEARNING CENTER CORE TABLES =====

  // Students table — full student registry
  db.exec(`
    CREATE TABLE IF NOT EXISTS students(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      birth_date TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      photo TEXT DEFAULT '',
      parent_name TEXT DEFAULT '',
      parent_phone TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      source TEXT DEFAULT '',
      lead_id INTEGER DEFAULT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Groups/Classes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      course_id TEXT NOT NULL,
      teacher TEXT DEFAULT '',
      room TEXT DEFAULT '',
      days TEXT DEFAULT 'Dush,Chor,Juma',
      start_time TEXT DEFAULT '09:00',
      end_time TEXT DEFAULT '11:00',
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      capacity INTEGER DEFAULT 15,
      price_per_month INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Group-Student enrollment (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_students(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      left_at DATETIME DEFAULT NULL,
      status TEXT DEFAULT 'active',
      discount INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      UNIQUE(group_id, student_id)
    );
  `);

  // Attendance tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'present',
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, student_id, date)
    );
  `);

  // Payments — detailed finance tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      group_id INTEGER DEFAULT NULL,
      amount INTEGER NOT NULL,
      payment_type TEXT DEFAULT 'cash',
      purpose TEXT DEFAULT 'tuition',
      month_for TEXT DEFAULT '',
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT '',
      created_by TEXT DEFAULT 'admin'
    );
  `);

  // Expenses — center cost tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT DEFAULT 'other',
      date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ===== HR & STAFF TABLES =====

  // Staff table (general employees)
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      salary_type TEXT DEFAULT 'fixed',
      salary_amount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Teachers table (specific instructors)
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      specialty TEXT DEFAULT '',
      salary_type TEXT DEFAULT 'percentage',
      salary_amount INTEGER DEFAULT 50,
      status TEXT DEFAULT 'active',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Payroll table (salary payments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS payroll(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_type TEXT NOT NULL,
      employee_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      month_for TEXT NOT NULL,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT ''
    );
  `);

  // ===== SCHEDULING TABLES =====

  // Rooms table (physical classrooms)
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER DEFAULT 0
    );
  `);

  // Schedule table (linking groups to rooms, teachers, days, times)
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      room_id INTEGER,
      teacher_id INTEGER,
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    );
  `);

  // ===== ACADEMIC & CERTIFICATE TABLES =====

  // Journal table (grades & homework tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      lesson_topic TEXT DEFAULT '',
      grade INTEGER,
      homework_grade INTEGER,
      notes TEXT DEFAULT ''
    );
  `);

  // Exams table (testing results)
  db.exec(`
    CREATE TABLE IF NOT EXISTS exams(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      exam_name TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER DEFAULT 100,
      notes TEXT DEFAULT ''
    );
  `);

  // Certificates table (issued credentials)
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id TEXT NOT NULL,
      certificate_code TEXT UNIQUE NOT NULL,
      issue_date TEXT NOT NULL,
      grade_average INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    );
  `);

  // Discounts & Promo Codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS discounts(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT DEFAULT NULL,
      type TEXT DEFAULT 'percentage',
      value INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin user if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (adminCount.count === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(defaultPassword, 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('  → Default admin user created (username: admin, password: admin123)');
  }

  // ===== MARKETING PROJECT MANAGEMENT TABLES =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS pm_plans(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      month TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      goals TEXT DEFAULT '[]',
      content_pillars TEXT DEFAULT '[]',
      platforms TEXT DEFAULT '[]',
      created_by TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_content_items(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_type TEXT DEFAULT 'post',
      platform TEXT DEFAULT 'instagram',
      pillar TEXT DEFAULT '',
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT DEFAULT '18:00',
      status TEXT DEFAULT 'idea',
      priority TEXT DEFAULT 'medium',
      caption TEXT DEFAULT '',
      scenario TEXT DEFAULT '',
      script TEXT DEFAULT '',
      visual_notes TEXT DEFAULT '',
      hashtag_set_id INTEGER DEFAULT NULL,
      media_urls TEXT DEFAULT '[]',
      assigned_to TEXT DEFAULT '[]',
      cover_image TEXT DEFAULT '',
      reference_urls TEXT DEFAULT '[]',
      performance_data TEXT DEFAULT '{}',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_item_id INTEGER DEFAULT NULL,
      plan_id INTEGER DEFAULT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      task_type TEXT DEFAULT 'general',
      assigned_to INTEGER DEFAULT NULL,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      due_date TEXT DEFAULT NULL,
      due_time TEXT DEFAULT NULL,
      estimated_hours REAL DEFAULT 0,
      actual_hours REAL DEFAULT 0,
      is_recurring INTEGER DEFAULT 0,
      recurrence_rule TEXT DEFAULT '',
      parent_task_id INTEGER DEFAULT NULL,
      sort_order INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_team_members(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      avatar_color TEXT DEFAULT '#6366f1',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      max_daily_tasks INTEGER DEFAULT 5,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_comments(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_templates(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content_type TEXT DEFAULT 'post',
      platform TEXT DEFAULT 'instagram',
      caption_template TEXT DEFAULT '',
      scenario_template TEXT DEFAULT '',
      script_template TEXT DEFAULT '',
      visual_notes TEXT DEFAULT '',
      hashtag_set_id INTEGER DEFAULT NULL,
      task_checklist TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_hashtag_sets(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hashtags TEXT NOT NULL,
      platform TEXT DEFAULT 'instagram',
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pm_activity_log(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      detail TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default marketing team members if none exist
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM pm_team_members').get();
  if (memberCount.count === 0) {
    const defaultMembers = [
      { name: 'Norbek Qodirov', role: 'lead', avatar_color: '#EC4899', phone: '+998901234567', email: 'norbek@datatalim.uz', max_daily_tasks: 8 },
      { name: 'Lobar Karimova', role: 'copywriter', avatar_color: '#3B82F6', phone: '+998912345678', email: 'lobar@datatalim.uz', max_daily_tasks: 5 },
      { name: 'Sardor Alimov', role: 'designer', avatar_color: '#10B981', phone: '+998933456789', email: 'sardor@datatalim.uz', max_daily_tasks: 6 },
      { name: 'Jasur Bekmirzayev', role: 'videographer', avatar_color: '#F59E0B', phone: '+998944567890', email: 'jasur@datatalim.uz', max_daily_tasks: 4 },
      { name: 'Malika Shodieva', role: 'smm', avatar_color: '#8B5CF6', phone: '+998955678901', email: 'malika@datatalim.uz', max_daily_tasks: 5 }
    ];
    
    const insertMember = db.prepare(`
      INSERT INTO pm_team_members (name, role, avatar_color, phone, email, max_daily_tasks)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const member of defaultMembers) {
      insertMember.run(member.name, member.role, member.avatar_color, member.phone, member.email, member.max_daily_tasks);
    }
    console.log('  → Default marketing team members seeded!');
  }

  // Seed default hashtag sets if none exist
  const hashtagCount = db.prepare('SELECT COUNT(*) as count FROM pm_hashtag_sets').get();
  if (hashtagCount.count === 0) {
    const defaultHashtags = [
      { name: "Ta'lim va IT", hashtags: "#datatalim #itmarkaz #dasturlash #talim #onlinekurs #itkurslar", platform: 'instagram' },
      { name: "SMM & Marketing", hashtags: "#smm #marketing #socialmedia #karyera #biznes #uzbekistan #tashkent", platform: 'instagram' },
      { name: "Reels & Shorts", hashtags: "#reelsuzb #itlife #backstage #reelsinsta #trending #active", platform: 'instagram' }
    ];
    
    const insertHashtag = db.prepare(`
      INSERT INTO pm_hashtag_sets (name, hashtags, platform) VALUES (?, ?, ?)
    `);
    
    for (const h of defaultHashtags) {
      insertHashtag.run(h.name, h.hashtags, h.platform);
    }
    console.log('  → Default hashtag sets seeded!');
  }

  // Seed default templates if none exist
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM pm_templates').get();
  if (templateCount.count === 0) {
    const defaultTemplates = [
      {
        name: "Kurs Promo Reels",
        content_type: "reel",
        platform: "instagram",
        caption_template: "🔥 Yangi kursimizga qabul boshlandi! Batafsil ma'lumot olish uchun izohlarda '+' qoldiring yoki shaxsiy xabarga yozing. \n\n[HASHTAGS]",
        scenario_template: "Scene 1: Hook gapiruvchi (3s) - 'IT-sohasini 0 dan boshlab 6 oyda o'rganish mumkinmi?'\nScene 2: Muammo ko'rsatilishi (5s) - Talaba charchab o'tiribdi, qiynalyapti.\nScene 3: Yechim (7s) - Bizning markaz dars jarayoni va qulayliklar.\nScene 4: CTA (5s) - Ekranda yozuv: Hozir ro'yxatdan o'ting va 20% chegirmani qo'lga kiriting!",
        script_template: "Matn: 'Hozirgi kunda IT sohasi eng daromadli va ommabop sohalardan biri. Lekin ko'pchilik qayerdan boshlashni bilmaydi. DATA Ta'lim markazida biz sizga amaliy loyihalar va tajribali ustozlar yordamida yo'l ko'rsatamiz. Birinchi darsga mutlaqo bepul yoziling!'",
        visual_notes: "Yorqin neon chiroqlar fonda bo'lsin. Matnlar ekranda tez-tez chiqib tursin (pop-up sound effect).",
        task_checklist: JSON.stringify([
          { title: "Senariy va Captionni yakunlash", task_type: "copywriting", priority: "medium" },
          { title: "Video suratga olish (shooting)", task_type: "shooting", priority: "high" },
          { title: "Videomontaj va ovozlashtirish", task_type: "editing", priority: "high" },
          { title: "Muqova dizaynini tayyorlash", task_type: "design", priority: "medium" },
          { title: "Reelsni yuklash va tekshirish", task_type: "publishing", priority: "medium" }
        ])
      },
      {
        name: "Foydali Maslahat Posti",
        content_type: "post",
        platform: "telegram",
        caption_template: "💡 IT sohasini boshlamoqchi bo'lganlar uchun 3 ta asosiy oltin qoida:\n\n1️⃣ Qat'iy maqsad qo'ying.\n2️⃣ Har kuni kamida 2 soat amaliyot qiling.\n3️⃣ Real loyihalar ustida ishlang.\n\nSiz qaysi bosqichdasiz? Izohlarda ulashing 👇\n\n[HASHTAGS]",
        scenario_template: "",
        script_template: "",
        visual_notes: "Karusel post ko'rinishida bo'ladi. Elegant dark neon ko'rinishidagi dizayn. 1-slayd: Sarlavha, 2-4 slaydlar maslahatlar, oxirgi slayd: Call-to-action.",
        task_checklist: JSON.stringify([
          { title: "Post matnini tahrirlash", task_type: "copywriting", priority: "medium" },
          { title: "Karusel dizaynini chizish", task_type: "design", priority: "high" },
          { title: "Kanalga joylash va rejalashtirish", task_type: "publishing", priority: "low" }
        ])
      }
    ];

    const insertTemplate = db.prepare(`
      INSERT INTO pm_templates (name, content_type, platform, caption_template, scenario_template, script_template, visual_notes, task_checklist)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of defaultTemplates) {
      insertTemplate.run(t.name, t.content_type, t.platform, t.caption_template, t.scenario_template, t.script_template, t.visual_notes, t.task_checklist);
    }
    console.log('  → Default templates seeded!');
  }

  console.log('✅ Database initialized at:', DB_PATH);
  db.close();
}
