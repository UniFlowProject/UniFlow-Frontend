import type { Task } from "@/domain/tasks";
import type { UpdateTaskRequestDto } from "../dto/request.dto";
import { academicApi } from "@/lib/api/client";
import { type GetTaskResponseDto } from "../dto/response.dto";
import { toTask } from "../mappers/taskMapper";

export async function updateTask(taskId: string, body: UpdateTaskRequestDto): Promise<Task> {

  const axiosResponse = await academicApi.patch<GetTaskResponseDto>("/tasks/" + taskId, body)

  return toTask(axiosResponse.data)
}
