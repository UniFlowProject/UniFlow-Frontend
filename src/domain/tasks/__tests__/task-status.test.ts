import { describe, expect, it } from "vitest"

import { Task, TaskPriority, TaskStatus } from "@/domain/tasks"

describe("TaskStatus", () => {
  it("only exposes the statuses accepted by the academic service", () => {
    expect(Object.values(TaskStatus).sort()).toEqual(
      ["cancelled", "done", "in-progress", "in-review", "todo"],
    )
  })

  it("treats a done task as complete: not overdue and 100% progress", () => {
    const past = new Date(Date.now() - 86_400_000)
    const task = new Task("t1", "Essay", "course-1", past, TaskPriority.HIGH, TaskStatus.DONE)

    expect(task.isOverdue()).toBe(false)
    expect(task.getProgressPercentage()).toBe(100)
  })

  it("does not stamp completedAt when moving back to a non-done status", () => {
    const task = new Task("t1", "Essay", "course-1", new Date(Date.now() + 86_400_000), TaskPriority.LOW)

    expect(task.updateStatus(TaskStatus.IN_PROGRESS).completedAt).toBeUndefined()
  })
})
