import axios from "axios";
import { getAccessToken } from "@/services/authStorage";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

export const api = axios.create({
  baseURL: `${API_ORIGIN}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});