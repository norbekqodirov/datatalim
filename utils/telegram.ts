/**
 * Telegram xabar yuborish utility.
 * Token va Chat ID backend tomonida saqlanadi (server/index.js).
 * Frontend faqat /api/notify-telegram endpointiga murojaat qiladi.
 */

export interface TelegramResult {
    success: boolean;
    error?: string;
}

export const sendToTelegram = async (message: string): Promise<TelegramResult> => {
    try {
        const response = await fetch('/api/notify-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        return { success: data.success, error: data.error };
    } catch (err: any) {
        return { success: false, error: err.message || 'Tarmoq xatosi' };
    }
};
