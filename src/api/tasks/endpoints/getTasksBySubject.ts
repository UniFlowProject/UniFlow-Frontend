import { Task, TaskPriority, TaskStatus } from "@/domain/tasks";
import { tasksApi } from "@/lib/api/client";
import type { GetTasksBySubjectResponseDto } from "../dto/response.dto";

export async function getTasksBySubject(subjectId: string): Promise<Task[]> {

  const axiosResponse = await tasksApi.get<GetTasksBySubjectResponseDto>(`/tasks/subject/${subjectId}`);

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