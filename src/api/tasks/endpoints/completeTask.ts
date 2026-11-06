import { updateTaskStatus } from "./updateTaskState";
import type { CompletedTaskResponseDto } from "../dto/response.dto";
import { TaskStatus } from "@/domain/tasks";

export async function completeTask(taskId: string): Promise<CompletedTaskResponseDto> {
  return updateTaskStatus(taskId, TaskStatus.DONE)
}
