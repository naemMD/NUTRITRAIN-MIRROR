import axios from 'axios';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';
import { getToken, clearSession } from './authStorage';

const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

const api = axios.create({
  baseURL: API_URL,
});

const PUBLIC_ENDPOINTS = ['/login', '/register'];

const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint));
};

// Request interceptor: attach token + check expiration
api.interceptors.request.use(
  async (config) => {
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    const token = await getToken();

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp < now) {
          await clearSession();
          router.replace('/(tabs)/login');
          return Promise.reject(new axios.Cancel('Session expirée'));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        await clearSession();
        router.replace('/(tabs)/login');
        return Promise.reject(new axios.Cancel('Token invalide'));
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: redirect on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      !isPublicEndpoint(error.config?.url)
    ) {
      await clearSession();
      router.replace('/(tabs)/login');
    }
    return Promise.reject(error);
  },
);

export default api;
