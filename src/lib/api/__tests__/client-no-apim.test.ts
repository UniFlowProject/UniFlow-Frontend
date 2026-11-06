import { describe, expect, it, vi } from "vitest"
import type { InternalAxiosRequestConfig } from "axios"

vi.mock("@/env", () => ({
  env: {
    VITE_ACADEMIC_SERVICE_URL: "http://gateway.test/api/academic/v2",
    VITE_NOTIFICATIONS_SERVICE_URL: "http://localhost:3003",
    VITE_APIM_TOKEN: undefined,
  },
}))
vi.mock("@/stores/auth", () => ({ useAuthStore: { getState: () => ({ logout: vi.fn() }) } }))

import { academicApi } from "../client"

vi.stubGlobal("localStorage", { getItem: () => null, removeItem: vi.fn() })

const captureHeaders = async () => {
  let captured: InternalAxiosRequestConfig | undefined
  await academicApi.get("/periods", {
    adapter: async (config) => {
      captured = config
      return { data: {}, status: 200, statusText: "OK", headers: {}, config }
    },
  })
  return captured!.headers
}

describe("API client without VITE_APIM_TOKEN", () => {
  it("does not set the Ocp-Apim-Subscription-Key header", async () => {
    const headers = await captureHeaders()
    expect(Object.keys(headers)).not.toContain("Ocp-Apim-Subscription-Key")
  })
})
