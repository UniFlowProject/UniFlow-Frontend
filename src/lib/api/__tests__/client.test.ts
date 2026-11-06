import { describe, expect, it, vi } from "vitest"

vi.mock("@/env", () => ({
  env: {
    VITE_ACADEMIC_SERVICE_URL: "http://gateway.test/api/academic/v2",
    VITE_NOTIFICATIONS_SERVICE_URL: "http://localhost:3003",
    VITE_APIM_TOKEN: "token",
  },
}))
vi.mock("@/stores/auth", () => ({ useAuthStore: { getState: () => ({ logout: vi.fn() }) } }))

import { API_ENDPOINTS } from "../endpoints"
import { academicApi, notificationsApi } from "../client"

describe("service base URLs", () => {
  it("uses the academic env value as the complete baseURL, without adding a prefix or version", () => {
    expect(academicApi.defaults.baseURL).toBe("http://gateway.test/api/academic/v2")
    expect(API_ENDPOINTS.academic.base).toBe("http://gateway.test/api/academic/v2")
  })

  it("uses the notifications env value as the complete baseURL", () => {
    expect(notificationsApi.defaults.baseURL).toBe("http://localhost:3003")
    expect(API_ENDPOINTS.notifications.base).toBe("http://localhost:3003")
  })

  it("keeps resource paths as plain relative segments", () => {
    expect(API_ENDPOINTS.academic.periods).toBe("/periods")
    expect(API_ENDPOINTS.academic.courses).toBe("/courses")
    expect(API_ENDPOINTS.academic.tasks).toBe("/tasks")
    expect(API_ENDPOINTS.notifications.notifications).toBe("/notifications")
  })
})
