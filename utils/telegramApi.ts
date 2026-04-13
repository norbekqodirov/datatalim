/**
 * Helper to interact with Telegram Bot API directly from the client side or backend.
 * Here we use client-side fetch for the dashboard since it requires the token.
 */

export interface TelegramStats {
  memberCount: number;
  channelInfo: any;
  error?: string;
}

export async function fetchTelegramStats(botToken: string, channelId: string): Promise<TelegramStats> {
  if (!botToken || !channelId) {
    return { memberCount: 0, channelInfo: null, error: 'Token yoki kanal ID kiritilmagan' };
  }

  try {
    // 1. Get Chat Members Count
    const countRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=${channelId}`);
    const countData = await countRes.json();
    
    // 2. Get Chat Info (title, username, description, photo)
    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${channelId}`);
    const infoData = await infoRes.json();

    if (!countData.ok || !infoData.ok) {
        return { 
            memberCount: 0, 
            channelInfo: null, 
            error: countData.description || infoData.description || 'API Xatosi' 
        };
    }

    return {
      memberCount: countData.result,
      channelInfo: infoData.result,
    };
  } catch (error: any) {
    console.error('Telegram API xatosi:', error);
    return { memberCount: 0, channelInfo: null, error: error.message };
  }
}
