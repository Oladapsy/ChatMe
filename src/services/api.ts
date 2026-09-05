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
  // const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NmQ5YmZmYS0wZTdhLTQzN2MtYWZiNy03ZDA0ZjVjNjA3ZGYiLCJzaWQiOiIwOGUxYzE5My02NTcxLTQxMmMtOWVmNy02OGQ0ZmFmNTRjMmYiLCJwcm9maWxlQ29tcGxldGUiOmZhbHNlLCJpYXQiOjE3ODg1OTEzOTAsImV4cCI6MTc4ODU5MjI5MCwiYXVkIjoiY2hhdGVvLW1vYmlsZSIsImlzcyI6ImNoYXRlby1hcGkifQ.nnj1IVS0FPSalPwyiATcx7G31dPhXsfGVb3w2cJK1UE"

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
  console.log("RESPONSE ERROR:", error.response?.status);

  const originalRequest =
    error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

  if (error.response?.status !== 401) {
    return Promise.reject(error);
  }

  console.log("401 DETECTED — attempting refresh");

  if (originalRequest._retry) {
    console.log("Already retried — stopping");
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.log("NO REFRESH TOKEN");
      await clearSession();
      return Promise.reject(error);
    }

    console.log("REFRESH TOKEN FOUND");

    if (!refreshPromise) {
      console.log("STARTING TOKEN REFRESH");

      refreshPromise = refreshSession().then(() => {
        console.log("TOKEN REFRESH SUCCESSFUL");
        refreshPromise = null;
      });
    } else {
      console.log("REFRESH ALREADY IN PROGRESS — WAITING");
    }

    await refreshPromise;

    const newAccessToken = await getAccessToken();

    // console.log("NEW ACCESS TOKEN:", newAccessToken);

    if (!newAccessToken) {
      throw new Error("Failed to get new access token");
    }

    originalRequest.headers.Authorization =
      `Bearer ${newAccessToken}`;

    console.log("RETRYING ORIGINAL REQUEST");

    return api(originalRequest);
  } catch (refreshError) {
    console.log("TOKEN REFRESH FAILED:", refreshError);

    refreshPromise = null;

    await clearSession();

    return Promise.reject(refreshError);
  }
}
);
