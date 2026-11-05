import { toTask } from "../mappers/taskMapper";
import type { Task } from "@/domain/tasks";
import type { GetTaskResponseDto } from "../dto/response.dto";
import { academicApi } from "@/lib/api/client";

export async function getTaskById(taskId: string): Promise<Task> {
  const axiosResponse = await academicApi.get<GetTaskResponseDto>("/tasks/" + taskId)

  return toTask(axiosResponse.data)
}
