import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = "https://21c3-161-253-25-25.ngrok-free.app/api";

const api = axios.create({
  baseURL: BASE_URL,
});

export async function getRequest<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<T>(path, config);
  return response.data;
}

export async function postRequest<T>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(path, data, config);
  return response.data;
}
