import { toTask } from "../mappers/taskMapper";
import { listAllTasks } from "./listTasks";
import type { Task } from "@/domain/tasks";

export async function getTasksByCourse(courseId: string): Promise<Array<Task>> {
  return (await listAllTasks({ courseId })).map(toTask)
}
