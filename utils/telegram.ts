/**
 * Telegram Bot API orqali xabar yuborish utility.
 * .env.local faylida VITE_TELEGRAM_BOT_TOKEN va VITE_TELEGRAM_CHAT_ID ni to'ldiring.
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

export interface TelegramResult {
    success: boolean;
    error?: string;
}

export const sendToTelegram = async (message: string): Promise<TelegramResult> => {
    if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        console.warn('Telegram Bot Token sozlanmagan. .env.local faylini tekshiring.');
        // Token yo'q bo'lsa ham xato bermaslik — demo rejimda ishlaydi
        return { success: true };
    }

    if (!CHAT_ID || CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Telegram Chat ID sozlanmagan. .env.local faylini tekshiring.');
        return { success: true };
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            return { success: false, error: data.description || 'Telegram xatosi' };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Tarmoq xatosi' };
    }
};
