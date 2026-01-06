import { tasksApi } from "@/lib/api/client";
import type { GetTasksByPeriodResponseDto } from "../dto/response.dto";
import { Task, TaskPriority, TaskStatus } from "@/domain/tasks";

export async function getTasksByPeriod(periodId: string): Promise<Task[]> {

  const axiosResponse = await tasksApi.get<GetTasksByPeriodResponseDto>(`/tasks/period/${periodId}`);

  return axiosResponse.data.tasks.map(task => new Task(
    task.id,
    task.title,
    task.subjectId,
    new Date(task.dueDate),
    TaskPriority[task.priority.toUpperCase() as keyof typeof TaskPriority],
    TaskStatus[task.status.replace("-", "_").toUpperCase() as keyof typeof TaskStatus],
    task.description,
    task.estimatedTimeHours,
    task.tags,
    new Date(task.createdAt),
    new Date(task.updatedAt),
    task.completedAt ? new Date(task.completedAt) : undefined
  ))

}