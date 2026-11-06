import { academicApi } from "@/lib/api/client";
import type { UpdateTaskStateResponseDto } from "../dto/response.dto";
import type { TaskStatus } from "@/domain/tasks";

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<UpdateTaskStateResponseDto> {

  const axiosResponse = await academicApi.patch<UpdateTaskStateResponseDto>(`/tasks/${taskId}/status`, { status: newStatus })

  return axiosResponse.data
}
