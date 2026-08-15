/**
 * Google Apps Script (Web App) orqali Google Sheets ga ma'lumotlarni yuborish utilitasi.
 */

export const appendLeadToSheet = async (leadData) => {
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycby4T5LogVNcgHfwsnZ7-Jr2mjV6Ft219VMhbij6hgxQlVM5P1wW93JXC38FYfK3Eoo8/exec";

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
