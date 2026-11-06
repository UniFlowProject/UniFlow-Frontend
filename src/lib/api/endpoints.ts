import { env } from "@/env";

export const API_ENDPOINTS = {
  academic: {
    base: env.VITE_ACADEMIC_SERVICE_URL,
    students: '/students',
    periods: '/periods',
    courses: '/courses',
    tasks: '/tasks'
  },
  notifications: {
    base: env.VITE_NOTIFICATIONS_SERVICE_URL,
    notifications: '/notifications'
  }
}