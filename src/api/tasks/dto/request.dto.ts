import type { TaskPriority, TaskStatus } from "@/domain/tasks"

export interface CreateTaskRequestDto {
  title: string
  courseId: string
  periodId: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  description?: string
  estimatedTimeHours?: number
  tags: Array<string>
}

export interface UpdateTaskRequestDto { }
