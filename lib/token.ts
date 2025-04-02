// lib/token.ts
let cachedToken: string | null = null;

export const setToken = (token: string) => {
  cachedToken = token;
};

export const getToken = () => cachedToken;

export const clearToken = () => {
  cachedToken = null;
};
