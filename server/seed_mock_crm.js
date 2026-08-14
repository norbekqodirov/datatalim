import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.db');

// DB_PATH resolves to the SAME server/data.db the real running app uses —
// there is no separate test database. Without this guard, running this
// script wipes 15 real business tables (students, payments, staff, payroll,
// etc.) with no warning. Require an explicit opt-in every time.
if (!process.argv.includes('--confirm')) {
    console.error(
        '⚠️  This will DELETE all real data in students/groups/attendance/payments/expenses/\n' +
        '   teachers/staff/payroll/rooms/schedule/journal/exams/certificates/discounts\n' +
        `   in ${DB_PATH} and replace it with fake demo data.\n` +
        '   Re-run with --confirm if this is really what you want:\n' +
        '     node server/seed_mock_crm.js --confirm'
    );
    process.exit(1);
}

console.log('🌱 Starting CRM Mock Data Seeder...');

const db = new Database(DB_PATH);

// Helper to run query safely
const run = (sql, ...params) => {
  try {
    return db.prepare(sql).run(...params);
  } catch (e) {
    console.error(`Error executing SQL: ${sql}\nError: ${e.message}`);
  }
};

// Clear existing tables to have clean historical data
db.exec(`
  DELETE FROM students;
  DELETE FROM groups;
  DELETE FROM group_students;
  DELETE FROM attendance;
  DELETE FROM payments;
  DELETE FROM expenses;
  DELETE FROM teachers;
  DELETE FROM staff;
  DELETE FROM payroll;
  DELETE FROM rooms;
  DELETE FROM schedule;
  DELETE FROM journal;
  DELETE FROM exams;
  DELETE FROM certificates;
  DELETE FROM discounts;
`);

console.log('🧹 Cleared existing CRM tables for seeding.');

// 1. Seed Rooms
const rooms = [
  { name: 'Room 1 (Mac Lab)', capacity: 16 },
  { name: 'Room 2 (Theory)', capacity: 24 },
  { name: 'Room 3 (Conference)', capacity: 12 },
  { name: 'Room 4 (English Hub)', capacity: 20 },
];
rooms.forEach(r => run('INSERT INTO rooms (name, capacity) VALUES (?, ?)', r.name, r.capacity));
console.log('✅ Rooms seeded.');

// 2. Seed Teachers
const teachers = [
  { name: 'Anvar Halilov', phone: '+998901234567', specialty: 'Full Stack JavaScript', salary_type: 'percentage', salary_amount: 45 },
  { name: 'Shaxnoza Karimova', phone: '+998932223344', specialty: 'English Language', salary_type: 'fixed', salary_amount: 5000000 },
  { name: 'Rustam Sodiqov', phone: '+998945556677', specialty: 'Python & Data Science', salary_type: 'percentage', salary_amount: 40 },
  { name: 'Dilnoza Aliyeva', phone: '+998978889900', specialty: 'UX/UI Design', salary_type: 'fixed', salary_amount: 4500000 },
];
teachers.forEach(t => run('INSERT INTO teachers (name, phone, specialty, salary_type, salary_amount) VALUES (?, ?, ?, ?, ?)', t.name, t.phone, t.specialty, t.salary_type, t.salary_amount));
console.log('✅ Teachers seeded.');

// 3. Seed Staff
const staff = [
  { name: 'Kamola Umarova', phone: '+998913334455', role: 'Menejer', salary_type: 'fixed', salary_amount: 4000000 },
  { name: 'Javohir Ergashev', phone: '+998991112233', role: 'Administrator', salary_type: 'fixed', salary_amount: 3500000 },
];
staff.forEach(s => run('INSERT INTO staff (name, phone, role, salary_type, salary_amount) VALUES (?, ?, ?, ?, ?)', s.name, s.phone, s.role, s.salary_type, s.salary_amount));
console.log('✅ Staff seeded.');

// 4. Seed Discounts
const discounts = [
  { name: 'Grant O\'quvchi', code: 'GRANT100', type: 'percentage', value: 100 },
  { name: 'Oila Chegirmasi', code: 'FAMILY15', type: 'percentage', value: 15 },
  { name: 'Kuzgi Aksiya', code: 'AUTUMN20', type: 'percentage', value: 20 },
  { name: 'Raqamli Chegirma', code: 'FIXED50K', type: 'fixed', value: 50000 },
];
discounts.forEach(d => run('INSERT INTO discounts (name, code, type, value) VALUES (?, ?, ?, ?)', d.name, d.code, d.type, d.value));
console.log('✅ Discounts seeded.');

// 5. Seed Groups
const groups = [
  { name: 'FS-101 (Full Stack JS)', course_id: 'fullstack-node', teacher: 'Anvar Halilov', room: 'Room 1 (Mac Lab)', days: 'Dush,Chor,Juma', start_time: '14:00', end_time: '16:00', start_date: '2026-01-05', end_date: '2026-07-05', capacity: 16, price_per_month: 800000, status: 'active' },
  { name: 'PY-204 (Python Foundation)', course_id: 'python-dev', teacher: 'Rustam Sodiqov', room: 'Room 3 (Conference)', days: 'Sesh,Pay,Shan', start_time: '09:00', end_time: '11:00', start_date: '2026-02-10', end_date: '2026-06-10', capacity: 12, price_per_month: 750000, status: 'active' },
  { name: 'ENG-302 (IELTS 7.0)', course_id: 'english-ielts', teacher: 'Shaxnoza Karimova', room: 'Room 4 (English Hub)', days: 'Dush,Chor,Juma', start_time: '18:30', end_time: '20:30', start_date: '2026-01-15', end_date: '2026-05-15', capacity: 20, price_per_month: 600000, status: 'active' },
  { name: 'UI-102 (UX/UI Design)', course_id: 'uxui-design', teacher: 'Dilnoza Aliyeva', room: 'Room 1 (Mac Lab)', days: 'Sesh,Pay,Shan', start_time: '16:00', end_time: '18:00', start_date: '2026-03-01', end_date: '2026-08-01', capacity: 15, price_per_month: 900000, status: 'active' },
];
groups.forEach(g => {
  run(`
    INSERT INTO groups (name, course_id, teacher, room, days, start_time, end_time, start_date, end_date, capacity, price_per_month, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, g.name, g.course_id, g.teacher, g.room, g.days, g.start_time, g.end_time, g.start_date, g.end_date, g.capacity, g.price_per_month, g.status);
});
console.log('✅ Groups seeded.');

// 6. Seed Students (30 students with realistic details)
const studentNames = [
  { name: 'Asadbek Toshpo\'latov', phone: '+998901112233', parent_name: 'Ilhom Toshpo\'latov', parent_phone: '+998909998877' },
  { name: 'Nodira Qodirova', phone: '+998912223344', parent_name: 'Shaxnoza Qodirova', parent_phone: '+998919998877' },
  { name: 'Sardor Karimov', phone: '+998933334455', parent_name: 'Davron Karimov', parent_phone: '+998939998877' },
  { name: 'Madina Umarova', phone: '+998944445566', parent_name: 'Aziz Umarov', parent_phone: '+998949998877' },
  { name: 'Diyorbek Sultonov', phone: '+998955556677', parent_name: 'Sherzod Sultonov', parent_phone: '+998959998877' },
  { name: 'Gulnoza Ismailova', phone: '+998977778899', parent_name: 'Lola Ismailova', parent_phone: '+998979998877' },
  { name: 'Javohir Rustamov', phone: '+998998889900', parent_name: 'Botir Rustamov', parent_phone: '+998999998877' },
  { name: 'Zilola G\'ofurova', phone: '+998905554433', parent_name: 'Olim G\'ofurov', parent_phone: '+998909995544' },
  { name: 'Bobur Mansurov', phone: '+998917776655', parent_name: 'Zafar Mansurov', parent_phone: '+998919995544' },
  { name: 'Shahzoda Ergasheva', phone: '+998938887766', parent_name: 'Nodira Ergasheva', parent_phone: '+998939995544' },
  { name: 'Akbar Shodiyev', phone: '+998941113322', parent_name: 'Farrux Shodiyev', parent_phone: '+998949995544' },
  { name: 'Ruhshona Halimova', phone: '+998973335544', parent_name: 'Zebo Halimova', parent_phone: '+998979995544' },
  { name: 'Otabek Yo\'ldoshev', phone: '+998994446655', parent_name: 'Soli Yo\'ldoshev', parent_phone: '+998999995544' },
  { name: 'Sevinch Po\'latova', phone: '+998901239876', parent_name: 'Nargiza Po\'latova', parent_phone: '+998909991122' },
  { name: 'Ulug\'bek Tursunov', phone: '+998913217654', parent_name: 'Akmal Tursunov', parent_phone: '+998919991122' },
  { name: 'Zuhra Solihova', phone: '+998936549876', parent_name: 'Nasiba Solihova', parent_phone: '+998939991122' },
  { name: 'Farhod Mo\'minov', phone: '+998947654321', parent_name: 'Mirza Mo\'minov', parent_phone: '+998949991122' },
  { name: 'Guli Olimova', phone: '+998971235467', parent_name: 'Ravshan Olimov', parent_phone: '+998979991122' },
  { name: 'Mirjalol Sobirov', phone: '+998993215476', parent_name: 'Adham Sobirov', parent_phone: '+998999991122' },
  { name: 'Laylo Karimova', phone: '+998908889911', parent_name: 'Rustam Karimov', parent_phone: '+998909992233' },
];

studentNames.forEach((s, idx) => {
  const gender = idx % 2 === 0 ? 'Erkak' : 'Ayol';
  const birth_date = `200${idx % 8 + 1}-0${idx % 9 + 1}-1${idx % 9}`;
  const address = `Toshkent sh., Chilonzor tumani, ${idx + 1}-daha`;
  run(`
    INSERT INTO students (name, phone, email, address, birth_date, gender, parent_name, parent_phone, status, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
  `, s.name, s.phone, `${s.name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`, address, birth_date, gender, s.parent_name, s.parent_phone, idx % 3 === 0 ? 'Telegram' : idx % 3 === 1 ? 'Instagram' : 'Tavsiya');
});
console.log('✅ Students seeded.');

// 7. Enroll Students into Groups (Many-to-Many)
// Let's retrieve all students and groups
const dbStudents = db.prepare('SELECT id FROM students').all();
const dbGroups = db.prepare('SELECT id, price_per_month FROM groups').all();

// FS-101 (Group 1): students 1 to 8
dbStudents.slice(0, 8).forEach(s => {
  run('INSERT INTO group_students (group_id, student_id, discount, status) VALUES (1, ?, ?, ?)', s.id, s.id === 3 ? 15 : s.id === 5 ? 100 : 0, 'active');
});

// PY-204 (Group 2): students 7 to 14
dbStudents.slice(6, 14).forEach(s => {
  run('INSERT INTO group_students (group_id, student_id, discount, status) VALUES (2, ?, ?, ?)', s.id, s.id === 10 ? 20 : 0, 'active');
});

// ENG-302 (Group 3): students 12 to 20
dbStudents.slice(11, 20).forEach(s => {
  run('INSERT INTO group_students (group_id, student_id, discount, status) VALUES (3, ?, ?, ?)', s.id, 0, 'active');
});

// UI-102 (Group 4): students 1 to 6 and 15 to 20
dbStudents.slice(0, 5).concat(dbStudents.slice(14, 20)).forEach(s => {
  run('INSERT INTO group_students (group_id, student_id, discount, status) VALUES (4, ?, ?, ?)', s.id, 0, 'active');
});
console.log('✅ Group enrollments seeded.');

// 8. Seed Payments (Historical Payments for Jan, Feb, Mar, Apr, May 2026)
// We will generate payments for each month
const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
const paymentTypes = ['cash', 'card', 'click', 'payme'];

months.forEach((m, mIdx) => {
  // Let's fetch enrolled active students in groups
  const enrollments = db.prepare(`
    SELECT gs.student_id, gs.group_id, gs.discount, g.price_per_month
    FROM group_students gs
    JOIN groups g ON g.id = gs.group_id
  `).all();

  enrollments.forEach((e, idx) => {
    // Generate some randomized payments to make graph realistic (e.g. 85% paid, some late, some full)
    const seedRandom = (idx + mIdx * 7) % 10;
    if (seedRandom < 9) { // 90% chance of payment
      const basePrice = e.price_per_month;
      const discountVal = e.discount;
      let finalPrice = basePrice;
      
      if (discountVal === 100) return; // 100% grant, no payment
      if (discountVal > 0 && discountVal < 100) {
        finalPrice = basePrice * (1 - discountVal / 100);
      }
      
      const payType = paymentTypes[(idx + mIdx) % paymentTypes.length];
      const paidDate = `${m}-${10 + (idx % 18)} 14:32:00`;
      
      run(`
        INSERT INTO payments (student_id, group_id, amount, payment_type, purpose, month_for, paid_at, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, e.student_id, e.group_id, finalPrice, payType, 'tuition', m, paidDate, 'Oylik dars to\'lovi', 'kamola');
    }
  });
});
console.log('✅ Payments seeded.');

// 9. Seed Expenses
const expenseCategories = ['rent', 'utility', 'marketing', 'office', 'other'];
months.forEach((m, mIdx) => {
  // Base fixed office expenses
  const rentDate = `${m}-05`;
  const utilDate = `${m}-12`;
  const marketDate = `${m}-18`;
  
  run('INSERT INTO expenses (title, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)', 'Bino ijarasi', 4000000, 'rent', rentDate, 'Oy boshidagi ijara to\'lovi');
  run('INSERT INTO expenses (title, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)', 'Kommunal to\'lovlar (Elektr/Suv/Internet)', 1200000 + (mIdx * 100000), 'utility', utilDate, 'Markaz kommunal to\'lovi');
  run('INSERT INTO expenses (title, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)', 'Instagram reklama (Meta Ads)', 2500000 + ((mIdx % 2) * 500000), 'marketing', marketDate, 'Targeting reklamasi');
  
  // Random micro expense
  if (mIdx % 2 === 0) {
    run('INSERT INTO expenses (title, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)', 'Kanselyariya va qog\'ozlar', 350000, 'office', `${m}-22`, 'O\'quv qurollari');
  }
});
console.log('✅ Operating expenses seeded.');

// 10. Seed Payroll
months.forEach((m) => {
  // Staff payroll (kamola & javohir)
  run('INSERT INTO payroll (employee_type, employee_id, amount, month_for, paid_at, notes) VALUES (?, 1, 4000000, ?, ?, ?)', 'staff', m, `${m}-28 17:00:00`, 'Oylik ish haqi');
  run('INSERT INTO payroll (employee_type, employee_id, amount, month_for, paid_at, notes) VALUES (?, 2, 3500000, ?, ?, ?)', 'staff', m, `${m}-28 17:05:00`, 'Oylik ish haqi');
  
  // Teacher payroll
  run('INSERT INTO payroll (employee_type, employee_id, amount, month_for, paid_at, notes) VALUES (?, 1, 4800000, ?, ?, ?)', 'teacher', m, `${m}-29 16:30:00`, 'Guruh darslari bo\'yicha %');
  run('INSERT INTO payroll (employee_type, employee_id, amount, month_for, paid_at, notes) VALUES (?, 2, 5000000, ?, ?, ?)', 'teacher', m, `${m}-29 16:35:00`, 'Ruxsat etilgan fiks oylik');
  run('INSERT INTO payroll (employee_type, employee_id, amount, month_for, paid_at, notes) VALUES (?, 3, 4200000, ?, ?, ?)', 'teacher', m, `${m}-29 16:40:00`, 'Python darslari bo\'yicha %');
  run('INSERT INTO payroll (employee_type, employee_id, amount, month_for, paid_at, notes) VALUES (?, 4, 4500000, ?, ?, ?)', 'teacher', m, `${m}-29 16:45:00`, 'UX/UI darslari bo\'yicha fiks');
});
console.log('✅ Payroll seeded.');

// 11. Seed Attendance & Journal mock data for today's active groups
const todayDate = new Date().toISOString().slice(0, 10);
const yesterDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

dbStudents.slice(0, 6).forEach(s => {
  // Yesterday attendance
  run('INSERT OR IGNORE INTO attendance (group_id, student_id, date, status, note) VALUES (1, ?, ?, ?, ?)', s.id, yesterDate, s.id === 2 ? 'absent' : 'present', s.id === 2 ? 'Kasal ekan' : '');
  // Today attendance
  run('INSERT OR IGNORE INTO attendance (group_id, student_id, date, status, note) VALUES (1, ?, ?, ?, ?)', s.id, todayDate, 'present', '');
  
  // Journal grades
  run('INSERT INTO journal (group_id, student_id, date, lesson_topic, grade, homework_grade, notes) VALUES (1, ?, ?, \'React Context va Hooks\', ?, ?, \'Darsda faol\')', s.id, todayDate, s.id === 4 ? 4 : 5, s.id === 3 ? 3 : 5);
});
console.log('✅ Attendance and journal grades seeded.');

// 12. Seed Schedule
const scheduleDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
// Match groups to schedule
run('INSERT INTO schedule (group_id, room_id, teacher_id, day_of_week, start_time, end_time) VALUES (1, 1, 1, \'Dush\', \'14:00\', \'16:00\')');
run('INSERT INTO schedule (group_id, room_id, teacher_id, day_of_week, start_time, end_time) VALUES (1, 1, 1, \'Chor\', \'14:00\', \'16:00\')');
run('INSERT INTO schedule (group_id, room_id, teacher_id, day_of_week, start_time, end_time) VALUES (1, 1, 1, \'Juma\', \'14:00\', \'16:00\')');

run('INSERT INTO schedule (group_id, room_id, teacher_id, day_of_week, start_time, end_time) VALUES (2, 3, 3, \'Sesh\', \'09:00\', \'11:00\')');
run('INSERT INTO schedule (group_id, room_id, teacher_id, day_of_week, start_time, end_time) VALUES (2, 3, 3, \'Pay\', \'09:00\', \'11:00\')');
run('INSERT INTO schedule (group_id, room_id, teacher_id, day_of_week, start_time, end_time) VALUES (2, 3, 3, \'Shan\', \'09:00\', \'11:00\')');
console.log('✅ Schedule seeded.');

console.log('🌱 CRM Mock Data Seeding successfully completed!');
db.close();
