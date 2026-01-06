import axios, { type AxiosInstance } from "axios"
import { API_ENDPOINTS } from "./endpoints"
import { env } from "@/env"
import { useAuthStore } from "@/stores/auth"


const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000, // 10 segundos
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Request interceptor - Agregar token de autenticación de usuario y para Azure APIM
  client.interceptors.request.use(
    (config) => {

      config.headers["Ocp-Apim-Subscription-Key"] = env.VITE_APIM_TOKEN

      // OAuth token
      const auth_storage = localStorage.getItem("auth-storage")

      if (!auth_storage) return config

      const token = auth_storage ? JSON.parse(auth_storage)?.state?.authToken : null
      const provider = auth_storage ? JSON.parse(auth_storage)?.state?.provider : null

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      if (provider) {
        config.headers["X-Provider"] = provider
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  client.interceptors.response.use(
    async (response) => {
      await new Promise((res) => setTimeout(res, 1000))

      return response
    },
    (error) => {
      if (error.response?.status === 401) {
        // Limpiar localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Limpiar store de Zustand
        useAuthStore.getState().logout();

        // Redireccionar al login
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  return client
}

const academicApi = createApiClient(env.VITE_ACADEMIC_SERVICE_URL + "/v1")
const tasksApi = createApiClient(env.VITE_ACADEMIC_SERVICE_URL + "/v1")
const notificationsApi = createApiClient(API_ENDPOINTS.notifications.base + "/v2")

export { academicApi, tasksApi, notificationsApi }