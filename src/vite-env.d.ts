/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Frontend'ga faqat ochiq (public) qiymatlar tushadi. Sirlar (token, parol) bu yerda bo'lmasligi kerak:
    // Telegram token/chat id faqat serverda (server/index.js), admin paroli esa bazada.
    readonly VITE_FB_PIXEL_ID?: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
