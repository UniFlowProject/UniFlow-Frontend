import { beforeEach, describe, expect, it, vi } from "vitest"

import { getAllPeriods } from "../endpoints/getAllPeriods"
import { getPeriodCourses } from "../endpoints/getPeriodCourses"
import { PeriodType } from "@/domain/periods"

const { academicApi } = vi.hoisted(() => ({
  academicApi: { get: vi.fn() },
}))

vi.mock("@/lib/api/client", () => ({ academicApi }))

const periodDto = (id: string) => ({
  id,
  name: "I Semestre",
  type: "first-semester",
  year: 2030,
  startDate: "2030-02-03",
  endDate: "2030-06-20",
  userId: "user-1",
  isActive: true,
  createdAt: "2029-12-01T10:00:00",
  updatedAt: "2029-12-02T10:00:00",
})

const pageInfo = (page: number, hasNext: boolean) => ({
  total: 2, page, limit: 100, totalPages: 2, hasNext, hasPrev: page > 1,
})

describe("periods API against the academic service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("reads every page of /periods using the items/pageInfo envelope", async () => {
    academicApi.get
      .mockResolvedValueOnce({ data: { items: [periodDto("p1")], pageInfo: pageInfo(1, true) } })
      .mockResolvedValueOnce({ data: { items: [periodDto("p2")], pageInfo: pageInfo(2, false) } })

    const periods = await getAllPeriods({})

    expect(academicApi.get).toHaveBeenNthCalledWith(1, "/periods", { params: { page: 1, limit: 100 } })
    expect(academicApi.get).toHaveBeenNthCalledWith(2, "/periods", { params: { page: 2, limit: 100 } })
    expect(periods.map((p) => p.id)).toEqual(["p1", "p2"])
    expect(periods[0].type).toBe(PeriodType.FIRST_SEMESTER)
    expect(periods[0].startDate).toBeInstanceOf(Date)
  })

  it("lists the courses of a period from /periods/{id}/courses", async () => {
    academicApi.get.mockResolvedValue({
      data: {
        items: [{
          id: "course-1", name: "Redes", code: "IC-7602", professor: null, credits: 4,
          color: null, periodId: "p1", description: null, schedule: [],
          createdAt: "2029-12-01T10:00:00", updatedAt: "2029-12-02T10:00:00",
        }],
      },
    })

    const courses = await getPeriodCourses("p1")

    expect(academicApi.get).toHaveBeenCalledWith("/periods/p1/courses")
    expect(courses).toHaveLength(1)
    expect(courses[0].periodId).toBe("p1")
  })
})
