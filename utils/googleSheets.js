/**
 * Google Apps Script (Web App) orqali Google Sheets ga ma'lumotlarni yuborish utilitasi.
 */

export const appendLeadToSheet = async (leadData) => {
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxh8HajSOpdHBjgawBTxDRu6ufVSOXzZKpo8FjtY8Ry2bRoZy0vR474LkRrV0bo-VWL/exec";

    try {
        const payload = {
            name: leadData.name,
            phone: leadData.phone,
            courseId: leadData.course_id || '-',
            sourceRef: leadData.source_ref || 'Umumiy'
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            // Note: Google Apps Script Web Apps often require redirect following or simple CORS handling
            // Sending plain text or form data is sometimes needed if JSON is blocked by strict CORS, but JSON works if script is set to Any/Anonymous
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
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
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxh8HajSOpdHBjgawBTxDRu6ufVSOXzZKpo8FjtY8Ry2bRoZy0vR474LkRrV0bo-VWL/exec";

    try {
        const payload = {
            type: 'career_test',
            name: data.name,
            phone: data.phone,
            gender: data.gender === 'male' ? 'Erkak' : data.gender === 'female' ? 'Ayol' : '-',
            age: data.age || '-',
            hollandCode: data.hollandCode || '-',
            course1: data.courses?.[0] || '-',
            course2: data.courses?.[1] || '-',
            course3: data.courses?.[2] || '-',
        };

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
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
