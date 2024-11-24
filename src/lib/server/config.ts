export const getBaseUrl = () => {
    if (process.env.PUBLIC_BASE_URL) {
        return process.env.PUBLIC_BASE_URL;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:5173';
};

export const getRedirectUri = () => {
    const baseUrl = getBaseUrl();
    console.log('Base URL:', baseUrl);
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const redirectUri = `${cleanBaseUrl}/auth/callback`;
    console.log('Redirect URI:', redirectUri);
    return redirectUri;
}; 