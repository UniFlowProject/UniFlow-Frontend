import type { Task } from "@/domain/tasks";
import { toTask } from "../mappers/taskMapper";
import { listAllTasks } from "./listTasks";

export async function getTasksByPeriod(periodId: string): Promise<Task[]> {
  return (await listAllTasks({ periodId })).map(toTask)
}
