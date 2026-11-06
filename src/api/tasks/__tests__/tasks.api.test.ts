import { beforeEach, describe, expect, it, vi } from "vitest"

import { completeTask } from "../endpoints/completeTask"
import { createTask } from "../endpoints/createTask"
import { deleteTaskById } from "../endpoints/deleteTask"
import { getAllTasks } from "../endpoints/getAllTasks"
import { getTaskById } from "../endpoints/getTaskById"
import { getTasksByCourse } from "../endpoints/getTasksByCourse"
import { getTasksByPeriod } from "../endpoints/getTasksByPeriod"
import { updateTaskStatus } from "../endpoints/updateTaskState"
import type { GetTaskResponseDto } from "../dto/response.dto"
import { TaskPriority, TaskStatus } from "@/domain/tasks"

const { academicApi } = vi.hoisted(() => ({
  academicApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/lib/api/client", () => ({ academicApi }))

const taskDto = (overrides: Partial<GetTaskResponseDto> = {}): GetTaskResponseDto => ({
  id: "task-1",
  userId: "user-1",
  title: "Essay on cell biology",
  description: "Chapter 3",
  courseId: "course-1",
  periodId: "period-1",
  dueDate: "2030-01-01T10:00:00Z",
  status: "in-progress",
  priority: "high",
  type: "essay",
  estimatedTimeHours: 4,
  actualTimeHours: null,
  tags: ["bio"],
  groupMembers: [],
  attachments: [],
  createdAt: "2029-12-01T10:00:00Z",
  updatedAt: "2029-12-02T10:00:00Z",
  completedAt: null,
  ...overrides,
})

const page = (items: Array<GetTaskResponseDto>, pageNumber = 1, hasNext = false) => ({
  data: {
    items,
    pageInfo: { total: items.length, page: pageNumber, limit: 100, totalPages: 1, hasNext, hasPrev: false },
  },
})

describe("tasks API against the academic service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("maps a task response using courseId and the enum values", async () => {
    academicApi.get.mockResolvedValue({ data: taskDto() })

    const task = await getTaskById("task-1")

    expect(academicApi.get).toHaveBeenCalledWith("/tasks/task-1")
    expect(task.courseId).toBe("course-1")
    expect(task.status).toBe(TaskStatus.IN_PROGRESS)
    expect(task.priority).toBe(TaskPriority.HIGH)
    expect(task.dueDate).toEqual(new Date("2030-01-01T10:00:00Z"))
    expect(task.completedAt).toBeUndefined()
  })

  it("follows pagination until the last page when listing all tasks", async () => {
    academicApi.get
      .mockResolvedValueOnce(page([taskDto({ id: "a" })], 1, true))
      .mockResolvedValueOnce(page([taskDto({ id: "b" })], 2, false))

    const tasks = await getAllTasks()

    expect(tasks.map(task => task.id)).toEqual(["a", "b"])
    expect(academicApi.get).toHaveBeenNthCalledWith(1, "/tasks", { params: { page: 1, limit: 100 }, paramsSerializer: { indexes: null } })
    expect(academicApi.get).toHaveBeenNthCalledWith(2, "/tasks", { params: { page: 2, limit: 100 }, paramsSerializer: { indexes: null } })
  })

  it("filters by courseId instead of the removed by-subject endpoint", async () => {
    academicApi.get.mockResolvedValue(page([taskDto()]))

    const tasks = await getTasksByCourse("course-1")

    expect(academicApi.get).toHaveBeenCalledWith("/tasks", {
      params: { courseId: "course-1", page: 1, limit: 100 },
      paramsSerializer: { indexes: null },
    })
    expect(tasks).toHaveLength(1)
  })

  it("filters by periodId instead of the removed by-period endpoint", async () => {
    academicApi.get.mockResolvedValue(page([taskDto()]))

    await getTasksByPeriod("period-1")

    expect(academicApi.get).toHaveBeenCalledWith("/tasks", {
      params: { periodId: "period-1", page: 1, limit: 100 },
      paramsSerializer: { indexes: null },
    })
  })

  it("creates a task with courseId, periodId, type and no status", async () => {
    academicApi.post.mockResolvedValue({ data: taskDto({ status: "todo" }) })

    const task = await createTask({
      title: "Essay on cell biology",
      courseId: "course-1",
      periodId: "period-1",
      dueDate: "2030-01-01T10:00:00Z",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      estimatedTimeHours: 4,
      tags: ["bio"],
    })

    expect(academicApi.post).toHaveBeenCalledWith("/tasks", {
      title: "Essay on cell biology",
      courseId: "course-1",
      periodId: "period-1",
      dueDate: "2030-01-01T10:00:00Z",
      priority: "high",
      type: "assignment",
      estimatedTimeHours: 4,
      tags: ["bio"],
    })
    expect(academicApi.patch).not.toHaveBeenCalled()
    expect(task.courseId).toBe("course-1")
  })

  it("applies a non-default initial status with a follow-up status change", async () => {
    academicApi.post.mockResolvedValue({ data: taskDto({ status: "todo" }) })
    academicApi.patch.mockResolvedValue({ data: taskDto({ status: "in-progress" }) })

    const task = await createTask({
      title: "Essay",
      courseId: "course-1",
      periodId: "period-1",
      dueDate: "2030-01-01T10:00:00Z",
      priority: TaskPriority.LOW,
      status: TaskStatus.IN_PROGRESS,
      tags: [],
    })

    expect(academicApi.patch).toHaveBeenCalledWith("/tasks/task-1/status", { status: "in-progress" })
    expect(task.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it("changes status with PATCH /tasks/{id}/status", async () => {
    academicApi.patch.mockResolvedValue({ data: taskDto({ status: "in-review" }) })

    const result = await updateTaskStatus("task-1", TaskStatus.IN_REVIEW)

    expect(academicApi.patch).toHaveBeenCalledWith("/tasks/task-1/status", { status: "in-review" })
    expect(result.status).toBe("in-review")
  })

  it("completes a task by moving it to done", async () => {
    academicApi.patch.mockResolvedValue({ data: taskDto({ status: "done", completedAt: "2030-01-02T00:00:00Z" }) })

    await completeTask("task-1")

    expect(academicApi.patch).toHaveBeenCalledWith("/tasks/task-1/status", { status: "done" })
  })

  it("deletes a task", async () => {
    academicApi.delete.mockResolvedValue({ status: 204 })

    await deleteTaskById("task-1")

    expect(academicApi.delete).toHaveBeenCalledWith("/tasks/task-1")
  })
})
