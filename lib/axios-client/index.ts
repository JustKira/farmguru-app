import axios from 'axios';

import { storage } from '~/lib/mmkv/storage';

export const BASE_URL = 'https://api.vais.ai'; // Replace with your API base URL

const apiClient = axios.create({
  baseURL: BASE_URL, // Replace with your API base URL
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = storage.getString('user-access-token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.getString('user-refresh-token');
      if (refreshToken) {
        try {
          const { data } = await apiClient.post('/auth/refresh', { token: refreshToken });
          const { accessToken: newAccessToken } = data;

          storage.set('user-access-token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch {
          console.error('Error refreshing token, logging out');

          storage.delete('user-access-token');
          storage.delete('user-refresh-token');
          // You could add a callback or event here to redirect the user to the login screen
        }
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient as axiosClient };
