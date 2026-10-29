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
Hammasi `redesign-v2` branchida commit qilingan. GitHub'ga oxirgi push: `a18e3cf` (2026-10-27); undan keyingi commitlar faqat lokal (`git log origin/redesign-v2..` bilan ko'ring). `main` ga hali merge qilinmagan.

### Keyingi ishlar (backlog)
- [ ] Egasi landingni ko'rib, fikr bersin. Qaysi bo'lim hali yoqmasa, o'shandan davom etiladi.
- [ ] Deploydan oldin `/claude-security` tekshiruvi.
- [ ] `redesign-v2` → `main` merge (PR) va deploy — faqat egasi tasdiqlagach.

### Egasi qilishi kerak (kod emas)
- `.env.local` faylida `JWT_SECRET` ni **32+ belgili** qilib qo'ying. Hozir u yo'q yoki qisqa, shuning uchun har restartdan keyin admin qayta login qiladi.
- Admin parolini Settings bo'limida o'zgartiring va Ish stolidagi `DATA-admin-parol.txt` faylini o'chiring.
- Admin orqali o'zgartiring:
  - placeholder videoni (Boss Baby) almashtiring;
  - jamoa rasmlarini qo'shing;
  - galereya rasmlarini qo'shing.

### Ekspert sikllari natijasi (2026-10-28, 3 sikl yakunlandi — egasi tekshiruvida)
Baholar 1→3-tekshiruv: mijoz 6.5→7.5, biznes 6.5→7.5, marketolog 6→8, dasturchi 7.5→8, dizayner 7→8.2.

### Egasi qarori kerak (ekspertlardan; kodda o'zboshimcha qilinmagan — matn/kontent/qaror)
- **Kontent:** haqiqiy fotolar (asoschi, jamoa, ustozlar + 1 qator bio); Boss Baby videosini almashtirish yoki bo'limni yashirish; sertifikat namunasi va haqiqiy bitiruvchi natijalari.
- **Matn:** hero'ga "Bepul konsultatsiya"/telefon va aniqroq H1 qatori; hero kicker raqamlari ("01/02" uch ma'noda) → nuqtalar; yo'nalish va til kurslari kartalarida narx/davomiylik; FAQ'ga narx/to'lov, guruh vaqti/hajmi, sinov darsi, yosh, qaytarish; "0 so'm"→"Bepul", 250+/1600+ va ish vaqti (Har kuni vs JSON-LD Du–Sha) aniqligi.
- **Kurs ma'lumoti:** keyingi guruh sanasi, dars kunlari, guruh hajmi (yangi admin maydonlari kerak).
- **Karyera testi:** lead'ni test boshida yuborish yoki telefonni natijadan keyin/ixtiyoriy so'rash.
- **Reklama:** Meta havolalarida `utm_source/utm_campaign` (ID bilan); Test Events + Pixel Helper bilan bir marta tekshirish; Ads Manager'da Lead qiymatsiz. Sheets: "Kurs" katagiga endi `kurs | utm` yoziladi, payload'da alohida `utm` ham bor — Apps Script'da alohida ustun qilish ixtiyoriy.
- **Texnik (alohida bosqich):** Conversions API (Meta token), prerender/SSR, `/eski-dizayn` production'da kerakmi, domen pochta, Google Maps havolasi, bitta brend yulduzi uslubi (CSS Star3D yoki shisha render), 375×667 kichik telefonlarda hero stansiyasi.
- **Deploydan oldin:** `server/data.db` zaxirasi; deploydan keyin bitta qo'lda sinov ariza (manba admin/Telegram/Sheets'da ko'rinsinmi).

### Ma'lum kichik muammolar
- Prod nginx `/images/*` ga `max-age=1 yil, immutable` beradi (fayl nomida hash yo'q). Rasmni **shu nom bilan** almashtirsangiz, foydalanuvchilarda 1 yil eski rasm qoladi — yangi nom bering yoki nginx'da `/images` uchun qisqaroq kesh (masalan 7 kun) qo'ying.
- Admin'da muqovasi yo'q kurs kartalari qorong'i rejimda deyarli ko'rinmaydi.

## 6. Jurnal (eng yangisi tepada, har yozuv 1–3 qator)
- **2026-10-29 · Hero gologramma** — Stansiya o'rniga 7 ta 3D zarracha shakli (`shapeScene.ts`: yulduz, AI chip, noutbuk `</>`, kamera, pero, grafik, bitiruv shapkasi), 3 s turadi + 1.35 s morph. Scroll: A shakllar → B "Ma'lumot" butun ekranga tarqoq bulut → C "Bilim" DATA yulduziga yig'iladi (orqaga ham). Shakllar idle'da quriladi; perf avvalgidek (mobil 4x: 58 FPS). Deploy: `deploy.mjs` DB zaxirasi + `deploy_log.txt`, `npm run rollback`.
- **2026-10-29 · Performance audit** — Production build o'lchandi (CDP, mobil 4x CPU): scroll 60 FPS, scroll paytida long task yo'q, CLS 0, xotira oqishi yo'q (8 marta sahifa aylanish), 22 sahifa/holatda JS xato va 404 yo'q. Yagona muammo — bosh sahifa yuklanishidagi birinchi Layout (mobil ~920 ms): `#yonalishlar ~ section` ga `content-visibility:auto` (Campus/Gallery istisno) → mobil 920→620 ms, TBT ~1150→900; desktop 185→138 ms. Skriptlar: scratchpad `perf/`.
- **2026-10-28 · Sikl 3 (yakuniy)** — Buzuq `/kurslar/%` URL endi saytni qulatmaydi; Pixel: in-app/ref/igshid reklama deb aniqlanadi, skript ≤1s kechiktirib yuklanadi, `disablePushState`, Lead dedup telefon bo'yicha 10 daq, atribusiya localStorage 7 kun (`ref | fb | utm`), `CareerTestStart/Complete`; Sheets "Kurs" = `kurs | utm`; admin "Manba / UTM" + Dashboard "Reklama manbasi".
- Hero: kicker halqadan ajraldi, chiqishdagi chok yo'q, H1 tezroq so'nadi, rail grid'da, 30Hz qurilma sekin hisoblanmaydi; Star3D 5 qatlam shisha; `-sm` srcSet; `useScrolledPastHero` keshi; MobileCtaBar `/kurslar` da yashirin. Kurs sahifasi: dars rejasi accordion, "Natija" mobil 2 ustun (mobil −1760px, desktop −1258px); til tadbirlari shisha kafel; Icon3D fallback.
- **2026-10-28 · Sikl 2** — UTM endi `leads.utm` ustunida (additive migratsiya, Sheets o'zgarmagan, admin Leads'da ko'rinadi); Lead value'siz, eventID submitdan oldin, InitiateCheckout faqat enroll. Hero stansiya o'qiladi (kamera, bandX ≥64px H1 dan, light siyoh), perf: glow sprite, adaptiv sifat, zaif qurilma 900 zarracha, mobil FPS ~2x. MobileCtaBar/BackToTop hero'dan keyin. Kurs hero'da narx chip, primary 'Kursga yozilish', test formasi mobil 1-ekranda, `-sm.webp` rasmlar.
- **2026-10-28 · Sikl 1 (5 ekspert → 3 ishchi + hero agent)** — Pixel: Lead (ariza/test/modal/aloqa, eventID), ViewContent, InitiateCheckout, Contact; UTM/fbclid atribusiyasi `courseId` satriga (server/Sheets o'zgarmagan). Ichki sahifalar `.t-hero` yagona H1, yulduzlar kichraydi, 3D ikonka tili (`Icon3D.tsx`). MobileCtaBar global (`MobileCtaBar.tsx`, `[data-hide-mcta]`), footer CTA takrori olib tashlandi, OS reduced-motion, bento mobil ixcham. Hero: DNK → zarrachali kosmik stansiya (`stationScene.ts`). Egasi qarorlari: scratchpad emas — §5 ga qarang.
- **2026-10-28 · Sikl 0 (3 ishchi agent)** — /kurslar kartalari ixcham (desktop 4 ustun ~390px, mobil gorizontal ~215px), katalog/detail hero kichraydi. /jamoa: o'rta ustun ofseti olib tashlandi, kartalar ~690→300px (avatar+matn). Bosh sahifa mobil: 17 194→13 537px (ritm, bento, yo'nalishlar ikonka, stansiya qator kartalar, ScrollText oxirgi so'z xiraligi tuzatildi).
- **2026-10-27 · Footer** — Ustun sarlavhalari ustidagi chiziqlar va Aloqa bo'limi ostidagi takroriy 4 ustunli ma'lumot qatori olib tashlandi (Mo'ljal footer manziliga ko'chdi). Katta «DATA» wordmark (va scroll animatsiyasi) olib tashlandi, havola ritmi desktopda 34px, bo'shliqlar qisqardi: footer ~950 → 565 px (1568 px ekran).
- **2026-10-27 · 3-bosqich yakuni** — Mobil qorong'i rejim tekshirildi (390 px, muammo yo'q). Campus/Directions stacked sarlavhalari `.sec-head` ga o'tdi (Directions: `t-display` → `t-h2`). BackToTop mobilda yashirildi (`hidden lg:flex`). `ParticleStar.tsx` o'chirildi.
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
