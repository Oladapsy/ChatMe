import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
} from "@/services/authStorage";

import { refreshSession } from "@/services/refreshSession";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

export const api = axios.create({
  baseURL: `${API_ORIGIN}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Prevent multiple requests from refreshing the token at the same time.
let refreshPromise: Promise<void> | null = null;

// Add access token to every request
api.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Handle expired access tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry the same request more than once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearSession();
        return Promise.reject(error);
      }

      // If another request is already refreshing,
      // wait for that refresh instead of starting another one.
      if (!refreshPromise) {
        refreshPromise = refreshSession().then(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      // Get the newly saved access token
      const newAccessToken = await getAccessToken();

      if (!newAccessToken) {
        throw new Error("Failed to get new access token");
      }

      // Put the new token on the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;

      await clearSession();

      return Promise.reject(refreshError);
    }
  },
);
