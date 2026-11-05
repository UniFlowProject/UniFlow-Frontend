import { toTask } from "../mappers/taskMapper";
import { listAllTasks } from "./listTasks";
import type { Task } from "@/domain/tasks";

export async function getAllTasks(): Promise<Array<Task>> {
  return (await listAllTasks()).map(toTask)
}
