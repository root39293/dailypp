/// <reference types="@auth/sveltekit" />

declare global {
    namespace App {
        interface Locals {
            user?: {
                id: string;
                name: string;
                pp_raw: number;
                settings: {
                    targetRanks: {
                        EASY: string;
                        NORMAL: string;
                        HARD: string;
                    }
                }
            }
        }
        interface PageData {
            user: {
                id: string;
                name: string;
                pp_raw: number;
                settings: {
                    targetRanks: {
                        EASY: string;
                        NORMAL: string;
                        HARD: string;
                    }
                }
            } | null;
        }
    }
}

export {};