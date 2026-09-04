import axios from "axios";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

export const api = axios.create({
  baseURL: `${API_ORIGIN}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});