import axios from 'axios';

export const googleProvider = {
    name: 'google',

    getAuthUrl({ state, forceConsent = false, redirectUri, clientId }) {
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            include_granted_scopes: 'true',
            prompt: forceConsent ? 'select_account consent' : 'select_account',
        });
        if (state) params.set('state', state);
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },

    async getProfileFromCode({ code, redirectUri, clientId, clientSecret }) {
        const tokenRes = await axios.post(
            'https://oauth2.googleapis.com/token',
            new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenRes.data.access_token;
        const oauthRefreshToken = tokenRes.data.refresh_token ?? null;

        const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        const user = profileRes.data;
        return {
            provider: 'google',
            providerUserId: user.id ?? user.sub,
            email: user.email ?? null,
            name: user.name ?? null,
            oauthRefreshToken,
        };
    },

    async revokeToken(token) {
        await axios.post(
            'https://oauth2.googleapis.com/revoke',
            new URLSearchParams({ token }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
    },
};

export default googleProvider;