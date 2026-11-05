import { academicApi } from "@/lib/api/client";

export async function deleteTaskById(taskId: string): Promise<void> {
  await academicApi.delete("/tasks/" + taskId);
}
