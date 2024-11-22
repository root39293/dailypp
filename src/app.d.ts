/// <reference types="@auth/sveltekit" />

declare global {
    namespace App {
        interface Locals {
            user?: {
                id: string;
                name: string;
                pp_raw: number;
            };
        }
        interface PageData {
            user: {
                id: string;
                name: string;
                pp_raw: number;
            } | null;
        }
    }
}

export {};