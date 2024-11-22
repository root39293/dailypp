/// <reference types="@auth/sveltekit" />

declare global {
    namespace App {
        interface Locals {
            getSession(): Promise<{
                user: {
                    id: string;
                    name?: string | null;
                    pp_raw?: number;
                } | null;
            } | null>;
        }
        interface PageData {
            session: {
                user: {
                    id: string;
                    name?: string | null;
                    pp_raw?: number;
                } | null;
            } | null;
        }
        interface Platform {}
    }

    interface ImportMetaEnv {
        VITE_OSU_CLIENT_ID: string;
        VITE_OSU_CLIENT_SECRET: string;
        VITE_MONGODB_URI: string;
        VITE_AUTH_SECRET: string;
    }
}

export {};