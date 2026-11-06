import { afterEach, describe, expect, it, vi } from "vitest"

const REQUIRED = {
  VITE_ENV: "production",
  VITE_ACADEMIC_SERVICE_URL: "https://uniflow.test/api/academic/v2",
  VITE_NOTIFICATIONS_SERVICE_URL: "https://uniflow.test/api/notifications/v2",
  VITE_COGNITO_DOMAIN: "https://auth.test.amazoncognito.com",
  VITE_COGNITO_CLIENT_ID: "client-id",
}

const OPTIONAL = [
  "VITE_NOTIFICATIONS_WEB_APP_URL",
  "VITE_APIM_TOKEN",
  "VITE_GOOGLE_CLIENT_ID",
  "VITE_GOOGLE_CLIENT_SECRET",
] as const

describe("env schema", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it("accepts a config without the four optional variables", async () => {
    vi.resetModules()
    for (const [key, value] of Object.entries(REQUIRED)) vi.stubEnv(key, value)
    for (const key of OPTIONAL) vi.stubEnv(key, "")

    const { env } = await import("../env")

    expect(env.VITE_ACADEMIC_SERVICE_URL).toBe(REQUIRED.VITE_ACADEMIC_SERVICE_URL)
    for (const key of OPTIONAL) expect(env[key]).toBeUndefined()
  })
})
