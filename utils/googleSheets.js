/**
 * Google Apps Script (Web App) orqali Google Sheets ga ma'lumotlarni yuborish utilitasi.
 */

// Apps Script URL: avval env (GOOGLE_SCRIPT_URL / VITE_GOOGLE_SCRIPT_URL), bo'lmasa eski qattiq yozilgan
// manzil (deploy buzilmasligi uchun zaxira). Env berilmagan bo'lsa bir marta ogohlantiramiz.
const FALLBACK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxh8HajSOpdHBjgawBTxDRu6ufVSOXzZKpo8FjtY8Ry2bRoZy0vR474LkRrV0bo-VWL/exec";
const SHEETS_TIMEOUT_MS = 8000;
let warnedMissingUrl = false;
const getScriptUrl = () => {
    const fromEnv = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL;
    if (fromEnv) return fromEnv;
    if (!warnedMissingUrl) {
        warnedMissingUrl = true;
        console.warn("⚠️  GOOGLE_SCRIPT_URL env o'rnatilmagan — kodda yozilgan zaxira manzil ishlatilmoqda.");
    }
    return FALLBACK_SCRIPT_URL;
};

// Google Sheets matnni formulaga aylantirmasligi uchun (=, +, -, @ bilan boshlansa) boshiga ' qo'yiladi
const safeCell = (value) => {
    const str = value === undefined || value === null ? '' : String(value);
    return /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
};

export const appendLeadToSheet = async (leadData) => {
    const GOOGLE_SCRIPT_URL = getScriptUrl();

    try {
        const payload = {
            name: safeCell(leadData.name),
            phone: leadData.phone,
            // Ustunlar soni/tartibi o'zgarmaydi: manba (utm) "Kurs" katagiga "kurs | utm" ko'rinishida qo'shiladi
            courseId: safeCell([leadData.course_id, leadData.utm].filter(Boolean).join(' | ') || '-'),
            sourceRef: safeCell(leadData.source_ref || 'Umumiy'),
            // Apps Script xohlasa alohida ustun qila oladi (noma'lum maydon e'tiborsiz qoladi)
            utm: safeCell(leadData.utm || '')
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            // Note: Google Apps Script Web Apps often require redirect following or simple CORS handling
            // Sending plain text or form data is sometimes needed if JSON is blocked by strict CORS, but JSON works if script is set to Any/Anonymous
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(SHEETS_TIMEOUT_MS),
        });

        if (!response.ok) {
            console.error(`Google Script xatosi: HTTP ${response.status}`);
            return { success: false, error: `HTTP xato: ${response.status}` };
        }

        const result = await response.json();
        if (result.success) {
            console.log(`Google Sheets ga yozildi: ${payload.name} -> ${payload.sourceRef}`);
            return { success: true };
        } else {
            console.error("Scripts qaytargan xato:", result.error);
            return { success: false, error: result.error };
        }

    } catch (error) {
        console.error("Sheetga ulanish xatosi:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Karyera testi natijasini alohida Google Sheets tabiga yozadi (ism, telefon,
 * jins, yosh va tavsiya etilgan top-3 kurs). `type: 'career_test'` maydoni
 * orqali Apps Script buni umumiy lead oqimidan ajratib, "Karyera Testi"
 * tabiga yo'naltiradi — appendLeadToSheet bilan bir xil Web App URL ishlatiladi.
 */
export const appendCareerTestToSheet = async (data) => {
    const GOOGLE_SCRIPT_URL = getScriptUrl();

    try {
        const payload = {
            type: 'career_test',
            name: safeCell(data.name),
            phone: data.phone,
            gender: data.gender === 'male' ? 'Erkak' : data.gender === 'female' ? 'Ayol' : '-',
            age: data.age || '-',
            hollandCode: data.hollandCode || '-',
            course1: safeCell(data.courses?.[0] || '-'),
            course2: safeCell(data.courses?.[1] || '-'),
            course3: safeCell(data.courses?.[2] || '-'),
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(SHEETS_TIMEOUT_MS),
        });

        if (!response.ok) {
            console.error(`Google Script xatosi (karyera testi): HTTP ${response.status}`);
            return { success: false, error: `HTTP xato: ${response.status}` };
        }

        const result = await response.json();
        if (result.success) {
            console.log(`Karyera testi natijasi Sheetga yozildi: ${payload.name}`);
            return { success: true };
        } else {
            console.error("Scripts qaytargan xato (karyera testi):", result.error);
            return { success: false, error: result.error };
        }

    } catch (error) {
        console.error("Karyera testi Sheetga ulanish xatosi:", error.message);
        return { success: false, error: error.message };
    }
};
