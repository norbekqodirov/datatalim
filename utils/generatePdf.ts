import { CourseResult } from '../types';
import { COURSE_NAMES, COURSE_RESULTS } from '../constants';

/**
 * Test natijasini yangi oynada chiroyli HTML sifatida ochib, PDF sifatida chop etish imkoniyatini beradi.
 */
export const generateTestPdf = (results: CourseResult[], userName?: string) => {
    const top1 = results[0];
    const top2 = results[1];
    const date = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

    const topResults = results.slice(0, 5).map(r => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;">${COURSE_NAMES[r.course]}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:center;">
        <div style="background:#f1f5f9;border-radius:20px;padding:4px 16px;display:inline-block;">
          <span style="font-weight:800;color:${r === top1 ? '#0061ff' : r === top2 ? '#0891b2' : '#64748b'};">${r.percentage}%</span>
        </div>
      </td>
    </tr>
  `).join('');

    const html = `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>DATA Ta'lim — Karyera Test Natijasi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Golos Text', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 24px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 2px solid #f1f5f9; }
    .logo { font-size: 28px; font-weight: 900; color: #0061ff; letter-spacing: -1px; }
    .logo span { color: #94a3b8; font-size: 12px; font-weight: 700; }
    .title { font-size: 22px; font-weight: 900; margin-top: 20px; text-transform: uppercase; }
    .meta { color: #94a3b8; font-size: 13px; margin-top: 8px; }
    .top-result { background: linear-gradient(135deg, #eff6ff, #f0f9ff); border: 2px solid #0061ff; border-radius: 20px; padding: 32px; margin-bottom: 24px; text-align: center; }
    .top-result .label { font-size: 11px; font-weight: 800; color: #0061ff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .top-result .name { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
    .top-result .pct { font-size: 48px; font-weight: 900; color: #0061ff; }
    .top-result .desc { color: #64748b; font-size: 14px; margin-top: 12px; line-height: 1.6; }
    .section-title { font-size: 16px; font-weight: 800; margin: 32px 0 16px; text-transform: uppercase; color: #475569; }
    table { width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 2px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
    .footer a { color: #0061ff; text-decoration: none; }
    .print-btn { background: #0061ff; color: white; border: none; padding: 14px 40px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; margin-top: 32px; }
    .print-btn:hover { background: #0047cc; }
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; padding: 24px; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">DATA <span>TA'LIM STANSIYASI</span></div>
      <h1 class="title">Karyera Test Natijasi</h1>
      <p class="meta">${userName ? `${userName} — ` : ''}${date}</p>
    </div>

    <div class="top-result">
      <div class="label">Eng mos yo'nalish</div>
      <div class="name">${COURSE_NAMES[top1.course]}</div>
      <div class="pct">${top1.percentage}%</div>
      <p class="desc">${COURSE_RESULTS[top1.course].description[0]}</p>
    </div>

    <div style="background:#f0fdfa;border:2px solid #0891b2;border-radius:20px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="font-size:11px;font-weight:800;color:#0891b2;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">2-o'rin</div>
      <div style="font-size:22px;font-weight:900;color:#0f172a;margin-bottom:4px;">${COURSE_NAMES[top2.course]}</div>
      <div style="font-size:36px;font-weight:900;color:#0891b2;">${top2.percentage}%</div>
      <p style="color:#64748b;font-size:13px;margin-top:8px;line-height:1.6;">${COURSE_RESULTS[top2.course].description[1]}</p>
    </div>

    <p class="section-title">Barcha yo'nalishlar bo'yicha moslik</p>
    <table>
      <thead>
        <tr>
          <th>Yo'nalish</th>
          <th style="text-align:center;">Moslik</th>
        </tr>
      </thead>
      <tbody>
        ${topResults}
      </tbody>
    </table>

    <div class="footer">
      <p><strong>DATA Ta'lim Stansiyasi</strong></p>
      <p>Xorazm viloyati, Urganch sh., V.Fayozov ko'chasi, 9-uy</p>
      <p>📞 +998 62 227-72-22 | <a href="https://t.me/data_talim_stansiyasi">Telegram</a></p>
    </div>

    <div style="text-align:center;">
      <button class="print-btn" onclick="window.print()">📥 PDF sifatida saqlash</button>
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
};
