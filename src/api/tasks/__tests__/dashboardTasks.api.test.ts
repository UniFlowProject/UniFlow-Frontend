import { beforeEach, describe, expect, it, vi } from "vitest"

import { getDashboardTasks } from "../endpoints/getDashboardTasks"
import { TaskStatus } from "@/domain/tasks"

const { academicApi } = vi.hoisted(() => ({
  academicApi: { get: vi.fn() },
}))

vi.mock("@/lib/api/client", () => ({ academicApi }))

const taskDto = (id: string, courseId: string) => ({
  id,
  userId: "user-1",
  title: `Task ${id}`,
  description: null,
  courseId,
  periodId: "period-1",
  dueDate: "2030-01-01T10:00:00Z",
  status: "in-progress",
  priority: "high",
  type: "essay",
  estimatedTimeHours: null,
  actualTimeHours: null,
  tags: [],
  groupMembers: [],
  attachments: [],
  createdAt: "2029-12-01T10:00:00Z",
  updatedAt: "2029-12-02T10:00:00Z",
  completedAt: null,
})

const courseDto = {
  id: "course-1", name: "Redes", code: "IC-7602", professor: null, credits: 4, color: null,
  periodId: "period-1", description: null, schedule: [],
  createdAt: "2029-12-01T10:00:00", updatedAt: "2029-12-02T10:00:00",
}

describe("dashboard tasks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("joins tasks with their course from GET /courses", async () => {
    academicApi.get.mockImplementation(async (url: string) => {
      if (url === "/courses") return { data: { items: [courseDto] } }
      return {
        data: {
          items: [taskDto("t1", "course-1"), taskDto("t2", "missing-course")],
          pageInfo: { total: 2, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
        },
      }
    })

    const tasks = await getDashboardTasks()

    expect(tasks).toHaveLength(2)
    expect(tasks[0].courseId).toBe("course-1")
    expect(tasks[0].courseName).toBe("Redes")
    expect(tasks[0].courseCode).toBe("IC-7602")
    expect(tasks[1].courseId).toBe("missing-course")
    expect(tasks[1].courseName).toBe("")
  })

  it("asks only for pending statuses accepted by the backend", async () => {
    academicApi.get.mockImplementation(async (url: string) =>
      url === "/courses"
        ? { data: { items: [] } }
        : { data: { items: [], pageInfo: { total: 0, page: 1, limit: 100, totalPages: 0, hasNext: false, hasPrev: false } } },
    )

    await getDashboardTasks()

    const taskCall = academicApi.get.mock.calls.find(([url]) => url === "/tasks")
    expect(taskCall?.[1].params.status).toEqual([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW])
    // Spring binds repeated keys (status=a&status=b), not axios' default status[]=a
    expect(taskCall?.[1].paramsSerializer).toEqual({ indexes: null })
  })

  it("does not exclude overdue tasks and fetches a single capped page", async () => {
    const overdue = { ...taskDto("t-overdue", "course-1"), dueDate: "2020-01-01T10:00:00Z" }
    academicApi.get.mockImplementation(async (url: string) =>
      url === "/courses"
        ? { data: { items: [courseDto] } }
        : { data: { items: [overdue], pageInfo: { total: 500, page: 1, limit: 100, totalPages: 5, hasNext: true, hasPrev: false } } },
    )

    const tasks = await getDashboardTasks()

    const taskCalls = academicApi.get.mock.calls.filter(([url]) => url === "/tasks")
    expect(taskCalls).toHaveLength(1)
    expect(taskCalls[0][1].params).not.toHaveProperty("dueDateFrom")
    expect(taskCalls[0][1].params).toMatchObject({ sortBy: "dueDate", sortOrder: "asc", page: 1, limit: 100 })
    expect(tasks.map(task => task.id)).toEqual(["t-overdue"])
  })
})
