import { beforeEach, describe, expect, it, vi } from "vitest"

import { createCourse } from "../endpoints/createCourse"
import { deleteCourse } from "../endpoints/deleteCourse"
import { getAllCourses } from "../endpoints/getAllCourses"
import { getCourseById } from "../endpoints/getCourseById"
import { updateCourse } from "../endpoints/updateCourse"
import type { GetCourseResponseDto } from "../dto/response.dto"
import { Course } from "@/domain/courses"

const { academicApi } = vi.hoisted(() => ({
  academicApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/lib/api/client", () => ({ academicApi }))

const courseDto = (overrides: Partial<GetCourseResponseDto> = {}): GetCourseResponseDto => ({
  id: "course-1",
  name: "Diseño de Software",
  code: "IC-5401",
  professor: "Marcos Rodríguez",
  credits: 3,
  color: "#3b82f6",
  periodId: "period-1",
  description: "Patterns",
  schedule: ["Lunes 8:00-9:50"],
  createdAt: "2029-12-01T10:00:00",
  updatedAt: "2029-12-02T10:00:00",
  ...overrides,
})

describe("courses API against the academic service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("lists courses from /courses unwrapping the items envelope", async () => {
    academicApi.get.mockResolvedValue({ data: { items: [courseDto()] } })

    const courses = await getAllCourses({ periodId: "period-1" })

    expect(academicApi.get).toHaveBeenCalledWith("/courses", { params: { periodId: "period-1" } })
    expect(courses).toHaveLength(1)
    expect(courses[0]).toBeInstanceOf(Course)
    expect(courses[0].color).toBe("#3b82f6")
    expect(courses[0].schedule).toEqual(["Lunes 8:00-9:50"])
    expect(courses[0].createdAt).toBeInstanceOf(Date)
  })

  it("tolerates nullable optional fields from the backend", async () => {
    academicApi.get.mockResolvedValue({
      data: courseDto({ professor: null, color: null, description: null, schedule: null }),
    })

    const course = await getCourseById("course-1")

    expect(academicApi.get).toHaveBeenCalledWith("/courses/course-1")
    expect(course?.professor).toBe("")
    expect(course?.schedule).toEqual([])
  })

  it("creates a course with POST /courses", async () => {
    academicApi.post.mockResolvedValue({ data: courseDto() })
    const body = { name: "Diseño de Software", code: "IC-5401", credits: 3, periodId: "period-1", color: "#3b82f6" }

    const course = await createCourse(body)

    expect(academicApi.post).toHaveBeenCalledWith("/courses", body)
    expect(course.id).toBe("course-1")
  })

  it("updates a course with PATCH /courses/{id}", async () => {
    academicApi.patch.mockResolvedValue({ data: courseDto({ name: "Renamed" }) })

    const course = await updateCourse("course-1", { name: "Renamed" })

    expect(academicApi.patch).toHaveBeenCalledWith("/courses/course-1", { name: "Renamed" })
    expect(course?.name).toBe("Renamed")
  })

  it("deletes a course with DELETE /courses/{id}", async () => {
    academicApi.delete.mockResolvedValue({ status: 204 })

    await deleteCourse("course-1")

    expect(academicApi.delete).toHaveBeenCalledWith("/courses/course-1")
  })

  it("turns a 409 into a readable error about associated tasks", async () => {
    academicApi.delete.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { error: { code: "CONFLICT", message: "has tasks" } } },
    })

    await expect(deleteCourse("course-1")).rejects.toThrow(/associated tasks/i)
  })

  it("rethrows other errors untouched", async () => {
    const failure = { isAxiosError: true, response: { status: 404 } }
    academicApi.delete.mockRejectedValue(failure)

    await expect(deleteCourse("course-1")).rejects.toBe(failure)
  })
})
