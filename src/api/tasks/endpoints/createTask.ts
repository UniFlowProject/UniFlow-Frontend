import { toTask } from "../mappers/taskMapper";
import { updateTaskStatus } from "./updateTaskState";
import type { CreateTaskRequestDto } from "../dto/request.dto";
import type { CreateTaskResponseDto } from "../dto/response.dto";
import type {Task} from "@/domain/tasks";
import { academicApi } from "@/lib/api/client";
import {  TaskStatus } from "@/domain/tasks";

export async function createTask({ status, ...body }: CreateTaskRequestDto): Promise<Task> {

  const axiosResponse = await academicApi.post<CreateTaskResponseDto>(
    "/tasks",
    { ...body, type: "assignment" }
  );

  const created = axiosResponse.data

  // The academic API always creates tasks as "todo"; any other initial status needs a status change.
  if (status === TaskStatus.TODO) return toTask(created)

  return toTask(await updateTaskStatus(created.id, status))
}
