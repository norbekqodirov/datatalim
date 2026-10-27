# PROJECT STATUS — DATA Taʼlim Stansiyasi (data-talim)

> **AI uchun:** ish boshlashdan oldin shu faylni o'qi, keyin faqat kerakli fayllarni och.
> Bu fayl **joriy holat** haqida: uni ustidan yangila, tarixni git log saqlaydi.
> Har ish bosqichi tugagach §6 (Jurnal) ga 1–3 qator qo'sh va §5 (Keyingi ishlar) ni yangila.
> Oxirgi yangilanish: **2026-10-27** · branch `redesign-v2` · oxirgi commit `7e4e8f4`

---

## 1. Loyiha bir qarashda
- **Nima:** DATA Taʼlim Stansiyasi (Urganch, 2019-yildan) o'quv markazining sayti: landing, kurslar, karyera testi, blog va admin panel.
- **Maqsad:** tashrif buyuruvchini **konsultatsiya arizasi**ga olib kelish (lead → Google Sheets + Telegram).
- **Egasi:** dasturchi emas (vibe coding, biznes, marketing). Javob **o'zbekcha (lotin)**, qisqa va oddiy tilda.
- **Stack:** Vite 6 · React 19 · TypeScript · Tailwind 4 · framer-motion 12 · zustand · react-router 7 | backend: Express 5 · better-sqlite3 · bcrypt · JWT.
- **Deploy:** `npm run deploy` buyrug'i `dist/` va backendni VPS'ga yuklaydi (`/var/www/datatalim`, PM2 `data-talim-api`, nginx: `datatalim_nginx.conf`). `vercel.json` ham bor. **Push va deploy faqat egasi tasdiqlagandan keyin.**

## 2. Ishga tushirish
| Nima | Buyruq / manzil |
|---|---|
| Dev (backend + frontend) | `npm run dev` → frontend **:3000**, API **:4000** (Vite `/api` ni proxy qiladi) |
| Port 3000 band bo'lsa | `npx concurrently "npm run dev:backend" "npx vite --port 3002 --strictPort"` → **http://localhost:3002** |
| Tekshiruv | `npx tsc --noEmit -p .` va `npx vite build` |
| Admin panel | `/paneladmindata/login`, login `admin`. Parolni tiklash: `node scripts/reset-admin-password.mjs` (parol Ish stolidagi `DATA-admin-parol.txt` fayliga yoziladi, terminalga chiqmaydi) |
| Eski dizayn | `/eski-dizayn` (HomeClassic) |

**Windows bo'yicha eslatma:** TaskStop node bola-jarayonlarini o'ldirmaydi. Port band qolsa: `netstat -ano` → PID → `ProcessName` node ekanini va buyruq qatori data-talim'ga tegishli ekanini tekshirib, keyin to'xtat. Boshqa loyihalarning node jarayonlariga (masalan reels-test/Remotion) tegma.

## 3. ⚠️ Qat'iy qoidalar (buzilmasin)
1. `.env` / `.env.local` fayllarini **o'qima**, kalit va parolni kodga yozma, commit qilma, chatga chiqarma.
2. API (:4000) **haqiqiy** Google Sheet va Telegram'ga yozadi. Formani haqiqatda yuborma: testda `fetch`ni stub qil va `window.__stubbed === true` ekanini tekshir. Admin previewlar ham stub bilan ishlaydi.
3. `?ref=` havolalarini ochma: ular marketing statistikasiga click yozib qo'yadi.
4. **Bosh sahifa MATNLARI o'zgarmaydi.** Faqat layout, o'lcham va tartib o'zgaradi. To'qib chiqarilgan da'vo yozilmaydi: raqam va faktlar faqat saytda bor matnlardan olinadi.
5. Workflow yoki 3 tadan ortiq subagent faqat egasi so'rasa ishlatiladi (avval narxini ayt). Standart subagent: Sonnet `medium`.
6. Bir yondashuv 2 marta ishlamasa, to'xta va sababini ayt.
7. Har ishlaydigan bosqichdan keyin commit qilishni **taklif qil** (o'zing commit qilma).

## 4. Dizayn tizimi (v2 «DATA · Signal»)
- **Brend:** ko'k `#0061ff` · moviy `#60efff` · yashil `#00b26b`. Qorong'i rejim **sof qora**, yorug' rejim ham bor (`localStorage 'data-talim-theme'`). Shrift: Poppins (+ JetBrains Mono kicker va raqamlar uchun). Belgi: 4 qirrali yulduz.
- **Uslub:** kinematografik, scroll-storytelling, shaffof **3D ikonkalar** (`public/images/v2/icons/*.webp`) va emoji. Bo'limlar `NN — Nom` kicker bilan raqamlanadi.
- **Kod:** hammasi `.v2` scope ichida, `components/v2/v2.css`.
  - Tokenlar: `--bg --bg-2 --bg-3 --fg --fg-2 --fg-3 --line --line-2 --blue --cyan --green --*-ink --grad --gutter --maxw:1280px --radius:28px`.
  - **Ritm:** `--sec-y: clamp(72px,8.5vw,120px)` va `.sec` klassi barcha oddiy bo'limlarda; `--head-gap`.
  - `.sec-head`: 12 ustunli sarlavha qatori. Chapda kicker va h2 (7 ustun), o'ngda izoh yoki havola (4 ustun), pastki chiziqqa tekislanadi.
  - **Tipografika shkalasi:** `t-mega t-display t-caption t-h2(≈49px desktop) t-h3 t-lead t-body t-kicker`. Har bo'lim sarlavhasi `t-h2`, yangi o'lcham kiritma.
  - `.btn` (min-height 48px), `btn-primary`, `.panel`, `.wrap`, `ink-grad`, `ink-blue/cyan/green`.
- **Tamoyillar:** bitta spacing shkalasi, bo'lim ichida o'ng va chap tomon teng og'irlikda, har bo'limda bitta focal element, ortiqcha bezakni olib tashlash, grid bo'yicha qat'iy tekislash.
- **Pin (scroll-sahna) bo'limlar** desktopda faqat 3 ta: Hero, Yo'nalishlar, Stansiya. Har biri taxminan 2 ekran.
  - Gorizontal turlar: `TRAVEL = 0.55`, ya'ni bo'lim balandligi `100vh + dist*0.55`.
  - Mobil va `prefers-reduced-motion` holatida oddiy stacked versiya ko'rsatiladi.

## 5. Joriy holat
### Bosh sahifa tartibi (`pages/Home.tsx`, `v.*` = admin'dagi ko'rinish sozlamalari)
| # | Bo'lim | Komponent | Holat |
|---|---|---|---|
| 01 | Hero: DNK spiral → galaktika → yulduz zarrachalari (4200 desktop / 2000 mobil) | `HeroSignal.tsx` + `particleField.ts` | ✅ pin 230vh |
| 02 | DATA raqamlarda (bento) | `Sales.tsx › ProofBento` | ✅ ixchamlashtirildi |
| — | Kurslar lentasi (marquee) | `Sales.tsx › CourseMarquee` | ✅ |
| 03 | Yo'nalishlar: «metro xaritasi», gorizontal tur | `Directions.tsx` | ✅ |
| 04 | Yondashuv: statement + natija orbitasi | `Manifesto.tsx` | ✅ |
| 05 | Karyera laboratoriyasi: 3 savollik mini test | `CareerLab.tsx` | ✅ |
| 06 | Stansiya: gorizontal tur, qat'iy grid kartalar, video | `Campus.tsx` | ✅ |
| — | Galereya (admin'da yoqilsa) | `Gallery.tsx` | — |
| 07 | Ovozlar: chapda iqtibos + CTA, o'ngda 3 video | `People.tsx › Voices` | ✅ 2 ustun |
| 08 | Jamoa: «chipta» kartalar | `People.tsx › TeamStrip` | ✅ `.sec-head` |
| 09 | Savollar: sticky chap ustun + yordam kartasi | `Closing.tsx › FaqV2` | ✅ |
| 10 | Boshlash / Aloqa: 3 qadam ↔ forma (6/6) | `Closing.tsx › ContactV2` | ✅ |
| — | Footer: kompas va CTA (CTA bosh sahifada yashirin) | `FooterV2.tsx` | ✅ |

**O'lchovlar (desktop 1440):** sahifa balandligi 18 925 → **13 700 px**. Mobil (390): 20 073 → ~17 700 px. Gorizontal scroll yo'q.

### Admin panel
- Yangi UI kit: `components/admin/ui/kit.tsx`, `ui.css`, `admin.css`.
- Barcha Manage* sahifalari, Settings va Login yangilandi.
- **Arizalar (Leads)** sahifasi: `pages/admin/ManageLeads.tsx`. API: `GET /api/leads` (q, source, status, from, to, limit, offset) va `PATCH /api/leads/:id` (status, notes).

### Commit holati
Hammasi `7e4e8f4` da commit qilingan (2026-10-27) va GitHub `origin/redesign-v2` ga push qilingan. `main` ga hali merge qilinmagan.

### Keyingi ishlar (backlog)
- [ ] Egasi landingni ko'rib, fikr bersin. Qaysi bo'lim hali yoqmasa, o'shandan davom etiladi.
- [ ] Mobil **qorong'i** rejimni to'liq tekshirish (yorug' rejim tekshirilgan).
- [ ] `.sec-head` ni qolgan sarlavhalarga ham qo'llash, agar mos kelsa (Campus stacked, Directions stacked).
- [ ] Mobilda «↑» (BackToTop) tugmasi kontent ustiga chiqib turadi. MobileCtaBar bor ekan, mobilda uni yashirishni ko'rib chiqish.
- [ ] `components/v2/ParticleStar.tsx` ishlatilmayapti: o'chirish yoki ishlatish.
- [ ] Deploydan oldin `/claude-security` tekshiruvi.

### Egasi qilishi kerak (kod emas)
- `.env.local` faylida `JWT_SECRET` ni **32+ belgili** qilib qo'ying. Hozir u yo'q yoki qisqa, shuning uchun har restartdan keyin admin qayta login qiladi.
- Admin parolini Settings bo'limida o'zgartiring va Ish stolidagi `DATA-admin-parol.txt` faylini o'chiring.
- Admin orqali o'zgartiring:
  - placeholder videoni (Boss Baby) almashtiring;
  - jamoa rasmlarini qo'shing;
  - galereya rasmlarini qo'shing.

### Ma'lum kichik muammolar
- Admin'da muqovasi yo'q kurs kartalari qorong'i rejimda deyarli ko'rinmaydi.

## 6. Jurnal (eng yangisi tepada, har yozuv 1–3 qator)
- **2026-10-27** — Status fayli va `scripts/qa/` yaratildi. Dev server :3002 da, chunki :3000 ni boshqa loyiha band qilgan.
- **2026-10-26 · 2-bosqich** —
  - Voices 3 qavatdan 2 ustunga o'tdi (1541 → 799 px); mobilda iqtibos ekrandan chiqib ketishi tuzatildi.
  - Bento ixchamlashtirildi va «02» kicker qo'shildi. Team sarlavhasi `.sec-head` ga o'tdi.
  - Aloqa bo'limidagi kesilgan Star3D olib tashlandi.
- **2026-10-26 · 1-bosqich (ritm)** —
  - `--sec-y` va `.sec` hamma joyga qo'llandi, yangi bo'lim tartibi kiritildi, StarSeam olib tashlandi.
  - Pin bo'limlar taxminan 2 ekranga qisqartirildi (`TRAVEL`), shrift shkalasi kichraytirildi.
  - Bosh sahifadagi footer CTA takrori yashirildi, kicker raqamlari qayta tartiblandi.
- **2026-10-26** — Admin:
  - qayta dizayn va Leads boshqaruvi qo'shildi (2 ta agent ishi, ko'rib chiqilgan);
  - parolni tiklash skripti yaratildi, login limiter yechildi.
- **2026-10-25/26** —
  - Hero globus DNK spiralga almashtirildi, zarrachalar ko'paytirildi.
  - Directions «metro» gorizontal turga aylantirildi (oldingi 2 varianti egasiga yoqmagan).
  - Campus: gorizontal tur va qat'iy grid kartalar; 3 ta yangi 3D ikonka.
  - Contact bo'limi 6/6 ga muvozanatlandi; FAQ'ga yordam kartasi qo'shildi; Team «chipta» kartalarga o'tdi; CareerLab qo'shildi.
- **c4d7ea7 va undan oldin** (git log) —
  - v2 «DATA · Signal» redesign: 3D zarracha hero, scroll storytelling, 3D ikonkalar, consult oqimi.
  - Ichki sahifalar, galereya, serverda lead xabarnomalari.
  - Xavfsizlik bo'yicha 3 raund review: rate limit, upload filtri, DOMPurify, JWT pv.
  - Karyera testi v2 va PDF hisobot.

## 7. Qarorlar (nima uchun shunday)
- **3 ta pin bo'lim qoldi** (Hero, Yo'nalishlar, Stansiya), lekin qisqartirildi. Egasi tanlovi: «3 tasi ham qolsin».
- **Tartib:** va'da → isbot → nima o'rganiladi → qanday → menga qaysi biri mos → qayerda → kimlar → savollar → harakat. Kurslar endi 2-ekranda.
- **Footer kompasi qoladi**, egasiga yoqadi. «Yer shari» deganda hero nazarda tutilgan edi, u DNK spiralga almashtirildi.
- **Bosh sahifada yakuniy CTA bitta:** Aloqa bo'limi. Footer CTA faqat ichki sahifalarda chiqadi.

## 8. Asboblar va tekshiruv usuli
- **Headless skrinshot:** `scripts/qa/*.py`. Ular `~/.claude/skills/design-forge/scripts/_browser.py` dan foydalanadi (Playwright bo'lmasa Chrome DevTools). `BASE` env bilan manzilni ber (standart `http://localhost:3002`), oldidan `PYTHONIOENCODING=utf-8` qo'y.
  - `python scripts/qa/measure.py 1440 900` — bo'limlar tartibi, balandligi, padding, h2 o'lchami.
  - `python scripts/qa/audit.py 1440 900 dark out/d [route]` — 12 ustunli grid overlay bilan to'liq sahifa varaqlari (sheet).
  - `python scripts/qa/sec.py <url> out 390 844 light "<selector>:offset,..."` — tanlangan bo'limlar skrinshoti.
- Python skriptni heredoc bilan emas, **faylga yozib** ishga tushir (qo'shtirnoqlar heredocni buzadi). `_browser.evaluate` uchun IIFE emas, arrow function ber.
- Natijani har doim o'zing ko'r: desktop 1440 qorong'i rejim va mobil 390 yorug' rejim.
