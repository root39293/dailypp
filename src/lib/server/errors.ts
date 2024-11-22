export class APIError extends Error {
    constructor(
        message: string,
        public status: number = 500,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export const errorResponse = (error: unknown) => {
    console.error('Error:', error);
    
    if (error instanceof APIError) {
        return new Response(
            JSON.stringify({
                error: error.message,
                code: error.code,
                details: error.details
            }),
            {
                status: error.status,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    if (error instanceof Error) {
        return new Response(
            JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return new Response(
        JSON.stringify({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        }),
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }
    );
};