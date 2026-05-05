import { client } from '../client/client.gen';

const TOKEN_KEY = 'auth_token';

export const auth = {
    setToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        client.setConfig({
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },
    clearToken: () => {
        localStorage.removeItem(TOKEN_KEY);
        client.setConfig({
            headers: {
                Authorization: undefined,
            },
        });
    },
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },
    initialize: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            client.setConfig({
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    },
};
