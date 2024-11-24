export const getBaseUrl = () => {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.PUBLIC_BASE_URL) {
        return process.env.PUBLIC_BASE_URL;
    }
    return 'http://localhost:5173';
};

export const getRedirectUri = () => {
    return `${getBaseUrl()}/auth/callback`;
}; 