import axios from 'axios';

export const naverProvider = {
    name: 'naver',

    getAuthUrl({ state, redirectUri, clientId }) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
        });
        if (state) params.set('state', state);

        return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    },

    async getProfileFromCode({ code, state, redirectUri, clientId, clientSecret }) {
        const tokenRes = await axios.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code,
                state, // 네이버는 state 검증 필요
                redirect_uri: redirectUri,
            },
        });

        const accessToken = tokenRes.data.access_token;
        const oauthRefreshToken = tokenRes.data.refresh_token ?? null;

        const profileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 네이버는 사용자 정보가 data.response 안에 들어있음
        const profile = profileRes.data?.response ?? {};

        return {
            provider: 'naver',
            providerUserId: profile.id ?? null,
            email: profile.email ?? null,
            name: profile.name ?? profile.nickname ?? null,
            oauthRefreshToken,
        };
    },

    async revokeToken(refreshToken, { clientId, clientSecret } = {}) {
        if (!refreshToken) return;

        // refresh_token으로 access_token 재발급
        const refreshRes = await axios.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'refresh_token',
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
            },
        });

        const accessToken = refreshRes.data?.access_token;
        if (!accessToken) return;

        // 연동 해제(delete)
        await axios.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'delete',
                client_id: clientId,
                client_secret: clientSecret,
                access_token: accessToken,
                service_provider: 'NAVER',
            },
        });
    },
};

export default naverProvider;