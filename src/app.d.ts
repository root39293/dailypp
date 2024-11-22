/// <reference types="@auth/sveltekit" />

declare global {
    namespace App {
        interface Locals {
            getSession(): Promise<SessionData | null>;
        }
        interface PageData {
            session: SessionData | null;
        }
        interface Platform {}
    }

    interface ImportMetaEnv {
        VITE_OSU_CLIENT_ID: string;
        VITE_OSU_CLIENT_SECRET: string;
        VITE_MONGODB_URI: string;
        VITE_AUTH_SECRET: string;
    }

    interface SessionData {
        user: {
            id: string;
            name: string;
            pp_raw?: number;
        } | null;
        expires: string;
    }
}

export {};