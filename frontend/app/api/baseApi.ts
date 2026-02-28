import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
  baseURL: BASE_URL,
});

export async function getRequest<T>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.get<T>(path, config);
  return response.data;
}

export async function postRequest<T>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.post<T>(path, data, config);
  return response.data;
}
