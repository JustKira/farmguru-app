import axios from 'axios';
import { router } from 'expo-router';

import { storage } from '~/lib/mmkv/storage';

export const BASE_URL = 'https://api.ofi.farmguru.ai'; //  https://api.vais.ai || https://api.ofi.farmguru.ai

const apiClient = axios.create({
  baseURL: BASE_URL,
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
    console.error('API Error:', error.response?.status, error.response?.data);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.getString('user-refresh-token');

      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...');

          const { data } = await axios.post(
            `${BASE_URL}/accounts/refresh`,
            {
              RefreshToken: refreshToken,
            },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          const { AccessToken: newAccessToken } = data.data;

          if (!newAccessToken) {
            throw new Error('New access token not received');
          }

          console.log('Token refreshed successfully');
          storage.set('user-access-token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          await handleLogout();
          return Promise.reject(refreshError);
        }
      } else {
        console.error('No refresh token available');
        await handleLogout();
        return Promise.reject(new Error('Authentication failed'));
      }
    }

    return Promise.reject(error);
  }
);

async function handleLogout() {
  console.log('Logging out user due to authentication failure');
  storage.delete('user-access-token');
  storage.delete('user-refresh-token');
  router.replace('/logout');
}

export { apiClient as axiosClient };
