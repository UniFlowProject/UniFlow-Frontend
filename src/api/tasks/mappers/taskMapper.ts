import type { TaskPriority, TaskStatus } from "@/domain/tasks";
import type { GetTaskResponseDto } from "../dto/response.dto"
import { Task } from "@/domain/tasks"

export function toTask(dto: GetTaskResponseDto): Task {
  return new Task(
    dto.id,
    dto.title,
    dto.courseId,
    new Date(dto.dueDate),
    dto.priority as TaskPriority,
    dto.status as TaskStatus,
    dto.description ?? undefined,
    dto.estimatedTimeHours ?? undefined,
    dto.tags,
    new Date(dto.createdAt),
    new Date(dto.updatedAt),
    dto.completedAt ? new Date(dto.completedAt) : undefined
  )
}
