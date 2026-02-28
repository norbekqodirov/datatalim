/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TELEGRAM_BOT_TOKEN: string
    readonly VITE_TELEGRAM_CHAT_ID: string
    readonly VITE_ADMIN_PASSWORD?: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
