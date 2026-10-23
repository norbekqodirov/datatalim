# DATA Ta'lim: yaxshilash rejasi (redesign-v2)

**Tekshiruv natijasi.** Audit topilmalaridan eng og'ir 10 tasi uchun koddagi joyni o'qib tekshirdim (`.env` fayllarga tegmadim). Hammasi tasdiqlandi, hech biri yolg'on chiqmadi.

| # | Da'vo | Natija |
|---|---|---|
| 1 | JWT_SECRET uchun qattiq yozilgan zaxira qiymat | Tasdiqlandi, `server/index.js:59-64` |
| 2 | Standart admin parol `admin123`, logga chiqariladi | Tasdiqlandi, `server/db.js:178-181` (audit 176-182 degan edi). `seed.js` ni alohida tekshirmadim |
| 3 | Rate limit bitta umumiy chelak (`trust proxy` yo'q, nginx `X-Forwarded-For` bermaydi) | Tasdiqlandi, `index.js:78-100` va `datatalim_nginx.conf:33-41` |
| 4 | `/api/notify-telegram` ochiq, auth yo'q | Tasdiqlandi, `index.js:664-685` |
| 5 | Upload'da `fileFilter` va hajm limiti yo'q, sharp xato bersa asl fayl qoladi | Tasdiqlandi, `index.js:115-124`, `629-661` |
| 6 | helmet va security header yo'q | Tasdiqlandi. nginx'da faqat `Cache-Control` bor, `package.json`'da helmet yo'q |
| 7 | Blog HTML tozalanmasdan chiqariladi | Tasdiqlandi, `pages/BlogPost.tsx:82,160`, DOMPurify ishlatilmagan |
| 8 | `GET /api/posts` qoralamalarni ham beradi | Tasdiqlandi, `index.js:475-498` |
| 9 | Ochiq GET rasmlarni bo'shatadi, admin shuni qayta saqlaydi (rasmlar yo'qolishi sababi) | Tasdiqlandi, `index.js:582-596` va `608-626` |
| 10 | VPS paroli va `data.db` git tarixida | Tasdiqlandi: eski commitlarda `root` login va parol bor (`5ff6b24`, `932193f`), `server/data.db` tarixda (`4dc53b4`, `f8bb654`) |

Qo'shimcha tasdiqlanganlar:
- `change-password` har doim `id = 1` ni yangilaydi (`index.js:541,546`).
- `/api/track/click` da limiter yo'q (`index.js:235`).
- `transfer/` papkasi (105 MB) git'da turibdi.
- `vite.config.ts:24-27` da `define` bilan secret'lar bundle'ga tushib ketish xavfi bor. Hozir kodda ishlatilmaydi.

**Tekshirilmagan:** `ManageBlog.tsx` dagi markdown XSS (faqat `dangerouslySetInnerHTML` borligini ko'rdim) va `localStorage` auth tafsilotlari. Bular admin ichida, shuning uchun xavf past.

**Belgilar:** `[SAFE]` degani biznes mantiq va deploy sozlamasiga tegmay avtomatik tuzatsa bo'ladi. `[TASDIQ KERAK]` degani server, parol yoki biznes qarori kerak.

---

## 1) Kritik xavfsizlik (hozir tuzatish)

**1.1 JWT sirli kaliti kodda yozilgan** `[SAFE: kod, lekin serverda JWT_SECRET borligini tekshirib]` (S)
- Muammo: `JWT_SECRET` bo'lmasa server `'data-talim-super-secret-key-2026'` bilan ishga tushadi. Bu satr git'da ochiq.
- Nega muhim: istalgan odam o'zi admin token yasab, saytni tahrirlay oladi va barcha lead telefonlarini yuklab oladi.
- Yechim: kalit yo'q yoki 32 belgidan qisqa bo'lsa server ishga tushmasin. `jwt.verify` va `sign` da `HS256` ni belgilang. Serverda kalitni yangilang.
- Joy: `server/index.js:59-64`, `150`, `167`

**1.2 Standart admin `admin123`** `[TASDIQ KERAK]` (S)
- Muammo: admin jadvali bo'sh bo'lsa `admin` / `admin123` yaratiladi va parol logga chiqadi.
- Nega muhim: yangi kompyuterga ko'chirishda yoki bazani tiklashda sayt taxmin qilsa bo'ladigan parol bilan qolishi mumkin.
- Yechim: parolni env'dan oling yoki tasodifiy yarating va bir marta ko'rsating. Logdan parolni olib tashlang. Eng kam uzunlikni 12 qiling. Serverdagi hozirgi parol `admin123` emasligini tekshiring.
- Joy: `server/db.js:175-182`, `server/seed.js`

**1.3 VPS paroli va mijoz bazasi git tarixida** `[TASDIQ KERAK, kodni o'zgartirmaydi]` (M)
- Muammo: eski commitlarda serverga kirish paroli va `data.db` (ismlar, telefonlar) bor.
- Nega muhim: repo'ning har bir nusxasida bu ma'lumotlar bor. Tarixni tozalash ularni qaytarib ololmaydi.
- Yechim: VPS parolini, JWT kalitini va Telegram bot tokenini (BotFather `/revoke`) hoziroq almashtiring. SSH'ni kalitga o'tkazing va parol bilan kirishni o'chiring. Repo private bo'lib qolsin. Keyin xohlasangiz `git filter-repo` bilan tarixni tozalang.
- Joy: git tarixi (`5ff6b24`, `932193f`, `4dc53b4`, `f8bb654`), `scripts/utils/sshConfig.mjs:24`

**1.4 Rate limit hamma uchun bitta** `[TASDIQ KERAK: nginx]` (S)
- Muammo: Express nginx orqasida turibdi, lekin tashrifchining IP'sini ko'rmaydi. Hamma `127.0.0.1` bo'lib ko'rinadi.
- Nega muhim: bitta yomon odam 5 ta noto'g'ri login bilan admin'ni 15 daqiqaga bloklaydi. 20 ta bo'sh so'rov bilan haqiqiy o'quvchilarning arizalari ham to'xtaydi.
- Yechim: nginx `/api/` ga `proxy_set_header X-Real-IP $remote_addr;` va `X-Forwarded-For $proxy_add_x_forwarded_for;` qo'shing. Express'da `app.set('trust proxy', 1)`. Login limiterni IP va username bo'yicha qiling.
- Joy: `server/index.js:78-100`, `datatalim_nginx.conf:33-41`

**1.5 `/api/notify-telegram` ochiq** `[TASDIQ KERAK: lead oqimiga tegadi]` (M)
- Muammo: istalgan odam sizning Telegram chatingizga bot nomidan xabar yubora oladi.
- Nega muhim: spam, firibgarlik, soxta lead. Limit esa umumiy (1.4).
- Yechim: endpointni olib tashlang. Xabarni `POST /api/leads` ichida serverda, tekshirilgan maydonlardan va HTML escape bilan yuboring.
- Joy: `server/index.js:664-685`

**1.6 Blog HTML tozalanmaydi (stored XSS)** `[SAFE]` (S)
- Muammo: `dangerouslySetInnerHTML={{ __html: content }}` bazadagi matnni to'g'ridan-to'g'ri sahifaga qo'yadi.
- Nega muhim: postga zararli skript tushsa, u har bir tashrifchida ishlaydi va admin tokenini o'g'irlashi mumkin.
- Yechim: render paytida `DOMPurify.sanitize(...)`. Keyin saqlashda ham serverda tozalang (`sanitize-html`).
- Joy: `pages/BlogPost.tsx:82,160`; `pages/admin/ManageBlog.tsx:362` (tekshirilmagan, o'sha usulda tuzating)

**1.7 Upload xavfsiz emas** `[SAFE]` (S)
- Muammo: fayl turi va hajmi tekshirilmaydi. Kengaytma mijoz nomidan olinadi. sharp xato bersa asl fayl (`.html`, `.svg`) saytning o'z domenidan beriladi.
- Nega muhim: o'z domeningizda zararli sahifa yoki skript joylash mumkin. Disk ham to'lib ketishi mumkin.
- Yechim: `limits.fileSize` (8 MB), `fileFilter` (faqat jpeg, png, webp, avif, gif), sharp xato bersa faylni o'chirib 415 qaytarish. `/uploads` ga `X-Content-Type-Options: nosniff`.
- Joy: `server/index.js:115-124`, `629-661`, `105`

**1.8 Security header va CSP yo'q** `[SAFE: Express; nginx uchun TASDIQ KERAK]` (S)
- Muammo: `helmet`, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, CSP yo'q. Admin panel iframe ichiga joylanishi mumkin.
- Nega muhim: bu XSS ga qarshi asosiy himoya qatlami.
- Yechim: Express'da `helmet()` va `x-powered-by` o'chirish. nginx server blokida headerlar. CSP'ni avval `Report-Only` rejimida sinang (Meta Pixel, Google Fonts, YouTube ishlashi kerak).
- Joy: `server/index.js`, `datatalim_nginx.conf`, `vercel.json`

**1.9 Qoralama postlar hammaga ochiq** `[SAFE]` (S)
- Muammo: `?published=1` bo'lmasa hamma postlar, shu jumladan chala yozilganlari ham qaytadi.
- Yechim: ochiq yo'llar doim `is_published = 1` bilan. Admin ro'yxati uchun alohida himoyalangan yo'l.
- Joy: `server/index.js:475-498`

**1.10 `change-password` doim 1-foydalanuvchini o'zgartiradi** `[SAFE]` (S)
- Muammo: `req.user.id` o'rniga `id = 1`. Limiter yo'q. Parol almashgach eski tokenlar 8 soat ishlayveradi.
- Yechim: `req.user.id` ni ishlating, limiter qo'shing, `token_version` ustuni bilan eski tokenlarni bekor qiling.
- Joy: `server/index.js:536-551`

**1.11 `transfer/` (105 MB shifrlangan nusxa) git'da** `[TASDIQ KERAK]` (S)
- Muammo: ichida `.env`, bazalar va rasmlar bor, shifr kaliti esa README'da nomi bilan ko'rsatilgan.
- Yechim: arxivni git'dan chiqarib, shaxsiy xotiraga (yopiq bulut yoki USB) o'tkazing. `.gitignore` ga `transfer/*.enc` qo'shing. Ko'chirgach ichidagi sirlarni almashtiring.

**1.12 Boshqa xavfsizlik ishlari** (kichikroq)
- `[SAFE]` CORS'ni faqat `datatalim.uz` va `www.datatalim.uz` ga cheklash (`index.js:103`). Lokal ishlab chiqishda `localhost:3000` ni `NODE_ENV !== 'production'` bo'lganda ruxsat bering. (S)
- `[SAFE]` `/api/track/click` ga limiter va `ref` formatini tekshirish (`/^[A-Za-z0-9]{6}$/`) (`index.js:235`). (S)
- `[SAFE]` Xato matnlarini mijozga bermaslik (`res.status(500).json({ error: err.message })` ko'p joyda: `index.js:154,182,206,230,...`) va umumiy xato handler qo'shish. (S)
- `[SAFE]` `vite.config.ts:24-27` dagi `define` ichidagi `GEMINI_API_KEY` va `VITE_ADMIN_PASSWORD` ni olib tashlash. Hozir ishlatilmaydi, lekin kelajakda sirni bundle'ga tushirib yuborishi mumkin. (S)
- `[TASDIQ KERAK]` Backup endpoint uchun qayta parol so'rash va `Cache-Control: no-store` (`index.js:554-565`). (S)

---

## 2) Backend va ishonchlilik

**2.1 Ochiq GET rasmlarni bo'shatadi, admin saqlaganda yo'qoladi** `[TASDIQ KERAK: ma'lumotlar oqimi]` (M)
- Muammo: `cleanObj` har bir `data:image` va `picsum` qiymatini `''` qiladi. Admin shu javobni qayta `PUT` qilsa, rasmlar bazadan ham o'chadi. Bu "rasmlar saqlagandan keyin yo'qoladi" xatosining ehtimoliy ildizi.
- Yechim: avval bazadagi base64 rasmlarni `/uploads` fayllariga ko'chiring (sharp bilan). Qisqa muddatda: admin token bilan so'ralganda tozalamang.
- Joy: `server/index.js:582-596`, `608-626`

**2.2 `PUT /api/:key` da tekshiruv va versiya yo'q** `[TASDIQ KERAK]` (M)
- Muammo: istalgan JSON saqlanadi. Ikki tab bir-birini ustidan yozadi. Oxirgi qiymatni qaytarib bo'lmaydi. 5 MB limit 3.7 MB li `courses` ga juda yaqin.
- Yechim: har kalit uchun shakl tekshiruvi (`zod`), oxirgi 10-20 versiyani saqlaydigan jadval, xatoni logga yozish.
- Joy: `server/index.js:104`, `608-626`

**2.3 Lead formasi tekshirilmaydi** `[TASDIQ KERAK: biznes qoidasi]` (M)
- Muammo: telefon formati, takroriy lead va bot himoyasi yo'q. `sourceRef` mijoz tomonidan beriladi.
- Yechim: telefonni `+998XXXXXXXXX` ga keltirish, honeypot maydon, bir xil telefon uchun 10 daqiqalik takror tekshiruv, `courseId` ro'yxati.
- Joy: `server/index.js:291-343`

**2.4 SQLite sozlamalari va zaxira nusxa** `[SAFE: PRAGMA; zaxira TASDIQ KERAK]` (S-M)
- Muammo: `busy_timeout`, `foreign_keys` yo'q, indekslar yo'q. Avtomatik zaxira nusxa yo'q. Backup endpoint faqat 6 jadvalni beradi.
- Yechim: `PRAGMA busy_timeout=5000; synchronous=NORMAL; foreign_keys=ON`. `leads(created_at)`, `leads(phone)`, `analytics_events(type, created_at)` indekslari. Kechasi `VACUUM INTO` bilan zaxira va 14 kunlik saqlash.
- Joy: `server/db.js:11-58`

**2.5 Google Sheets sinxronlash** `[SAFE: timeout; URL ko'chirish TASDIQ KERAK]` (S)
- Muammo: Apps Script URL kodda qattiq yozilgan, `fetch` da timeout yo'q, muvaffaqiyatsiz yozuv qayta urinilmaydi.
- Yechim: URL faqat env'dan. `AbortSignal.timeout(8000)`. `career-test-result` javobni kutmasdan ketsin.
- Joy: `utils/googleSheets.js:5-6,51-53`, `server/index.js:349-366`

**2.6 Posts yo'llari ishdan chiqishi mumkin** `[SAFE]` (S)
- Muammo: `title_uz` bo'lmasa `.toLowerCase()` xato beradi. Noma'lum `id` da `existing.is_published` xato beradi. Slug takrorlansa 500.
- Yechim: tekshiruv, 400/404/409 javoblar, slug `^[a-z0-9-]{1,100}$`.
- Joy: `server/index.js:500-523`

**2.7 Sinxron ishlar, loglash, health check** `[SAFE]` (S)
- Muammo: `bcrypt.compareSync`, `fs.unlinkSync` event loop'ni to'xtatadi. `GET /api/health` yo'q, SIGTERM'da bazani yopish yo'q.
- Yechim: async `bcrypt.compare` (login'da noma'lum foydalanuvchi uchun ham sxrat hash), `/api/health`, graceful shutdown.
- Joy: `server/index.js:143`, `650`, fayl oxiri

**2.8 Statistika so'rovlari og'ir** `[SAFE]` (S)
- Muammo: `/api/stats` kurslar JSON'ini (3.7 MB) har safar ochib sanaydi. Takroriy so'rovlar bor.
- Yechim: `json_array_length(value)` va 60 soniyalik kesh.
- Joy: `server/index.js:369-462`

---

## 3) Tezlik (Core Web Vitals)

**3.1 Vendor chunk 1.1 MB, PDF kutubxonalari bosh sahifada yuklanadi** `[SAFE]` (S)
- Muammo: `manualChunks` oxirgi `return 'vendor'` jspdf, html2canvas, canvg, dompurify'ni ham bitta fayl qiladi. U `modulepreload` bilan har sahifada yuklanadi, holbuki PDF faqat karyera testida kerak.
- Yechim: `vendor-pdf` alohida chunk yoki umumiy `return 'vendor'` ni olib tashlash. Faqat react, react-dom, react-router `vendor-react` ga.
- Joy: `vite.config.ts:34-70`
- Kutilgan natija: kritik JS ~1.1 MB dan ~300 KB atrofiga tushadi (audit taxmini, o'lchash kerak).

**3.2 Hero rasmi sekin va kech chiqadi** `[SAFE: rasmni lokalga ko'chirish bilan]` (S)
- Muammo: asosiy (LCP) rasm `loading="lazy"`, tashqi Unsplash'dan, ota-element `opacity: 0` dan boshlanadi.
- Yechim: rasmni `public/images/hero.webp` ga ko'chirish (800/1200 `srcset`), `loading="eager"`, `fetchpriority="high"`, `width`/`height`, `index.html` ga preload. Hero'da `opacity:0` boshlang'ich holatni olib tashlash.
- Joy: `components/home/Hero.tsx:124-135`

**3.3 recharts faqat bitta dekorativ diagramma uchun (338 KB)** `[SAFE: dizayn bir xil qoladi]` (S)
- Yechim: 7 ustunli diagrammani CSS yoki inline SVG bilan almashtirish.
- Joy: `components/home/Hero.tsx:6,155-164`

**3.4 Siqish va kesh** `[TASDIQ KERAK: nginx]` (S)
- Muammo: sayt konfiguratsiyasida `gzip`/`brotli` yo'q (global nginx'da yoqilgan bo'lishi mumkin, serverdan tekshirish kerak). `/uploads` Node orqali beriladi va keshsiz. `index.html` uchun `no-store`.
- Yechim: `gzip on` (yoki brotli), `/uploads/` ni nginx `alias` bilan 1 yil `immutable` kesh bilan berish, `index.html` uchun `no-cache` + ETag.
- Joy: `datatalim_nginx.conf:8-50`, `server/index.js:105`

**3.5 Kurslar JSON'i 3.7 MB, 4 ta bloklovchi so'rov** `[TASDIQ KERAK]` (M)
- Yechim: base64 rasmlarni fayllarga ko'chirgandan keyin hajm keskin kamayadi (2.1). Bitta `/api/bootstrap`, `Cache-Control: public, max-age=60, stale-while-revalidate=300`, ochiq GET'larga `Authorization` yubormaslik.
- Joy: `store/useStore.ts:196-222`, `server/index.js:571-605`

**3.6 Qolgan tezlik ishlari** `[SAFE]`
- Poppins'ni o'zi xostlash va 7 o'rniga 4 vaznga tushirish (`index.html:32-41`). (S)
- `pravatar` va `transparenttextures` tashqi so'rovlarini olib tashlash (`Hero.tsx:194,228`). (S)
- Testimonials'dagi 6 ta YouTube iframe o'rniga poster rasm, bosilganda yuklash (`Testimonials.tsx:59-77`). (M)
- `useTracking` spinneri `?ref=` bilan kelgan reklama trafigini 500 ms kechiktiradi, fire-and-forget qilish (`hooks/useTracking.ts:8-11`). (S)
- `backdrop-blur` ni mobilda kamaytirish, `transition: all` o'rniga aniq xossalar (`index.css:268-310`). (S)
- Ishlatilmaydigan 14 ta PNG (8.8 MB) ni `public/images/courses` dan o'chirish yoki WebP ga o'tkazish. (S)
- Dark mode miltillashini `index.html` ga 6 qatorli skript bilan yo'qotish. (S)

**3.7 Prerender** `[TASDIQ KERAK]` (L)
- Muammo: brauzer avval bo'sh `<div id="root">` oladi. Kontent JS va API'dan keyin chiqadi.
- Yechim: bosh sahifa va asosiy sahifalarni build vaqtida statik HTML qilish.

---

## 4) SEO va kontent

**4.1 `robots.txt` va `sitemap.xml` yo'q** `[SAFE]` (S)
- Muammo: ikkala manzil ham `index.html` (200) qaytaradi.
- Yechim: `public/robots.txt` (admin yo'lini yopish, `Sitemap:` qatori) va build vaqtida `sitemap.xml`.
- Joy: `public/`, `datatalim_nginx.conf:13,30`

**4.2 Domen aralashgan** `[SAFE]` (S)
- Muammo: `index.html` da `datatalim.uz`, `SEO.tsx` da `talim.datatalim.uz`. Logo URL'i mavjud emas.
- Yechim: bitta `SITE_URL`, hamma joyda `canonical`.
- Joy: `components/SEO.tsx:18-20,62-63,76,127,162`

**4.3 `og:image` va favicon** `[SAFE: rasmni siz tasdiqlaysiz]` (S)
- Muammo: Telegram'da havola rasmsiz ko'rinadi. Favicon emoji (📊).
- Yechim: 1200x630 OG rasm, `twitter:card`, brend favicon, `apple-touch-icon`, `theme-color`.

**4.4 Structured data yozilgan, lekin ishlatilmagan** `[SAFE]` (M)
- Yechim: Home'ga `EducationalOrganization` + `FAQPage`, kurs sahifasiga `Course`, blogga `Article`. `<SEO>` komponentini `CourseDetail`, `About`, `Blog`, `BlogPost` sahifalariga qo'shish. `jsonLd` ni massivga kengaytirish.
- Joy: `components/SEO.tsx:59-175`, `pages/Home.tsx:21-24`

**4.5 Pozitsiyalash: DATA, AI, IT, media, digital ko'rinmaydi** `[TASDIQ KERAK: matn sizniki]` (S)
- Muammo: H1 "Zamonaviy kasblarni biz bilan o'rganing" umumiy. `Home.tsx` description'da grammatik xato. Title uzun.
- Taklif: H1 "Kelajak kasblari. DATA bilan boshlang." pastida "AI, ma'lumotlar, dasturlash, media va digital: Urganchdagi innovatsion ta'lim markazi". Title (60 belgigacha): "DATA Ta'lim Stansiyasi — AI, IT va Digital kurslar | Urganch".
- Joy: `store/useStore.ts:88-90`, `index.html`, `pages/Home.tsx:21-24`

**4.6 Soxta raqamlar va soxta avatarlar** `[TASDIQ KERAK: haqiqiy raqamlar sizdan]` (S)
- Muammo: "2000+", "75%", "98%", "3 000 000 UZS" qotirilgan va bir-biriga zid. 4 ta begona yuz (`pravatar`) "Student" deb ko'rsatilgan. Isbotsiz da'volar ishonchni va reklama qonuni nuqtai nazaridan xavfni oshiradi.
- Yechim: raqamlarni admin tahrirlaydigan `siteContent.stats` ga ko'chirish. Faqat tasdiqlanganini qoldirish. Haqiqiy o'quvchi/markaz rasmlari.
- Joy: `Hero.tsx:49-51,148,166,194,199,216,241`, `Footer.tsx:13-16`

**4.7 ru/en matnlar o'zbekcha** `[TASDIQ KERAK: tarjima]` (M)
- Muammo: hero, about, manzil, kurs davomiyligi ru/en maydonlarida o'zbekcha. `html lang` doim `uz`.
- Yechim: haqiqiy tarjimalar, qotirilgan matnlarni `t()` ga ko'chirish. Til tayyor bo'lmaguncha ru/en ni indekslamaslik (`noindex`).
- Joy: `store/useStore.ts:88-102`, `i18n.ts:157-166`

**4.8 Ishlamaydigan havolalar** `[SAFE]` (S)
- Muammo: Footer'da Maxfiylik, Shartlar, Facebook, YouTube `href="#"`. Forma telefon yig'adi, lekin maxfiylik sahifasi yo'q.
- Yechim: `/maxfiylik` va `/shartlar` sahifalari yoki havolalarni olib tashlash. Joy: `Footer.tsx:98-112,190-191`

**4.9 Konversiya** `[TASDIQ KERAK: biznes]` (M)
- Birlamchi CTA "Bepul sinov darsiga yozilish", ikkilamchi "Karyera testi". Mobilda yopishqoq "Qo'ng'iroq / Telegram" paneli. Ariza formasini sahifa oxiridan yuqoriroqqa chiqarish. Yandex Metrika / GA4 maqsadlari.

**4.10 Bo'limlar tartibi (Apple uslubidagi hikoya)** `[TASDIQ KERAK: dizayn]` (M)
- Taklif: Hero, "Nima uchun DATA" (3D/scroll animatsiya), yo'nalishlar (AI, Data, IT, Media, Digital), kurslar, natijalar va bitiruvchilar, karyera testi, ustozlar, FAQ, ariza formasi.

---

## 5) Accessibility va UX

**5.1 Til almashtirgich faqat Navbar'ni yangilaydi** `[SAFE]` (M)
- Muammo: `useLanguage` har chaqiruvda alohida state. Qolgan bo'limlar qayta yuklanmaguncha eski tilda qoladi.
- Yechim: `LanguageProvider` (Context), `<html lang>` ni sinxronlash.
- Joy: `i18n.ts:156-178`, `components/layout/Navbar.tsx`

**5.2 `prefers-reduced-motion` qo'llab-quvvatlanmaydi** `[SAFE]` (S)
- Yechim: `<MotionConfig reducedMotion="user">` va CSS `@media (prefers-reduced-motion: reduce)`. Marquee uchun to'xtatish tugmasi. Yangi scroll/3D animatsiyalarda ham shuni hisobga olish.
- Joy: `index.css:199-227,361-442`, `Testimonials.tsx:59`

**5.3 Gradient matn va tugmalarda kontrast past (yorug' rejimda)** `[SAFE: ranglar bir xil qoladi]` (S)
- Muammo: `#60efff` uchi oq fonda ~1.3:1. Oq matn `#60efff` yoki `#00b26b` ustida ham o'qilmaydi.
- Yechim: yorug' rejimda matn gradienti `#0061ff` dan to'qroq ko'kka; tugmada qattiq `#0061ff`, cyan faqat yorug'lik/hoshiya uchun. Brend ranglari o'zgarmaydi, ishlatilish joyi aniqlashadi.
- Joy: `Hero.tsx:87,216`, `Contact.tsx:118`, `index.css:308-316`

**5.4 Modal va forma** `[SAFE]` (M)
- `EnrollModal`: `role="dialog"`, `aria-modal`, Escape, fokus tuzog'i, yopish tugmasiga `aria-label`, `label`/`id` bog'lash. Tozalanmagan `setTimeout`.
- `Contact`: `label htmlFor`, inline xato matnlari, `autoComplete`, `inputMode="tel"`, muvaffaqiyat xabari `role="status"`.
- Joy: `components/EnrollModal.tsx:24,107,122-181`, `components/home/Contact.tsx:200-229`

**5.5 Mobil menyu va navigatsiya** `[SAFE]` (M)
- Burger tugmasiga `aria-label`, `aria-expanded`, Escape va tashqariga bosganda yopish. Global `:focus-visible` uslubi va "kontentga o'tish" havolasi.
- 768-1100 px oralig'ida desktop navigatsiya sig'masligi mumkin (hisoblash, o'lchanmagan); `xl` dan pastda burger ishlatish.
- Joy: `Navbar.tsx:99-125,161-310`

**5.6 `<Link><Button/></Link>` ichma-ich** `[SAFE]` (S)
- Yechim: `Button asChild` yoki `LinkButton`, 7 joyda.
- Joy: `Hero.tsx:101-112`, `Courses.tsx:215-219`, `About.tsx:93-98`, `Team.tsx:50-55`

**5.7 Dark mode ikki tizimda** `[TASDIQ KERAK: katta o'zgarish]` (M-L)
- Muammo: `html.dark .bg-white !important` qoidalari va komponentlardagi `isDark` ternary bir vaqtda. Tailwind `dark:` esa OS sozlamasiga bog'liq, tugmaga emas.
- Yechim: CSS o'zgaruvchilari (`--bg`, `--surface`, `--text`) va `@custom-variant dark`. Bosqichma-bosqich o'tkazish.

**5.8 Mayda UX nuqsonlari** `[SAFE]` (S)
- Footer'dagi obuna formasi emailni hech qayerga yubormaydi, lekin "Obuna bo'ldingiz" deydi (`Footer.tsx:9-19`).
- "Hozir ochiq" belgisi tashrifchining soatidan foydalanadi va yakshanbani hisobga olmaydi; Asia/Tashkent vaqti kerak (`Contact.tsx:30-33`).
- Fokus konturi olib tashlangan joylar (FAQ tugmasi), `aria-controls`, alt matnlar ingliz tilida ("Gallery image 1"), ikonka-havolalarda `aria-label`.
- Bo'sh galereya bo'limi rasmsiz ko'rinadi, rasm yo'q bo'lsa yashirish.

---

## 6) Kod sifati

**6.1 Dizayn tokenlari** `[SAFE: ko'rinish o'zgarmaydi]` (M)
- Muammo: `#0061ff` 138 marta, `#60efff` 82 marta qo'lda yozilgan. Radius, soya, qalinlik va fon ranglari tartibsiz (6+ radius, 4 xil qora fon).
- Yechim: `@theme` ichida `--blue`, `--cyan`, `--green`, radius va soya shkalalari. Takrorlanuvchi `<SectionHeader>` va `<Section>` komponentlari (≈8 joyda nusxa). Yagona `<Button>`/`<Input>`; hozirgi `Button` brend `#0061ff` o'rniga `bg-blue-600` ishlatadi.

**6.2 Global shrift qoidalari** `[SAFE]` (S)
- `* { font-family }` va `!important` ro'yxati Tailwind `font-mono` ni buzadi (blog kod bloklari). Bittasini qoldirish.
- Joy: `index.css:3-18`

**6.3 Serverning ichki tuzilmasi** `[SAFE]` (M)
- `server/index.js` bitta katta fayl. Yo'llarni modullarga bo'lish (auth, leads, posts, uploads). Umumiy `/api/:key` yo'lini qat'iy kalit ro'yxati bilan oxirida qoldirish.
- `server` frontend `utils/` papkasidan import qiladi va `VITE_` nomlarini o'qiydi; `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` ga o'tkazish (`index.js:67-68`) `[TASDIQ KERAK: serverdagi env nomi o'zgaradi]`.
- `db.js` dagi eskirgan migratsiyalar o'rniga `PRAGMA user_version` (`db.js:60-77`).

**6.4 CI va bog'liqliklar** `[TASDIQ KERAK]` (S)
- `npm audit --omit=dev`, Dependabot, SSH kalit bilan deploy (parolsiz).
- `.claude/worktrees` va 186 ta fayl `.claude/` ostida git'da; ortiqchasini olib tashlash va begona skill skriptlarini `skill-inspector` bilan tekshirish.

---

## Tavsiya etilgan tartib

1. **Bugun (serverda, siz bilan):** 1.3 parol va kalitlarni almashtirish, 1.2 admin parolni tekshirish, 1.4 nginx header'lari.
2. **Avtomatik tuzatsa bo'ladi `[SAFE]`:** 1.1, 1.6, 1.7, 1.9, 1.10, 1.12, 2.4 (PRAGMA), 2.6, 2.7, 3.1, 3.2, 3.3, 4.1, 4.2, 4.8, 5.1-5.6.
3. **Keyin (siz tasdiqlaysiz):** 1.5, 2.1-2.3, 3.4, 3.5, 4.5-4.7, 5.7.
4. **Eng oxirida:** prerender (3.7) va yangi scroll/3D dizayn (4.10), ular yuqoridagi tezlik tuzatishlariga tayanadi.

Eslatma: 3D va scroll animatsiya og'irlik qo'shadi. Ularni `reduced-motion`, mobilda yengillashtirish va lazy yuklash bilan birga qo'shish kerak, aks holda 3.x dagi yutuqlar yo'qoladi.