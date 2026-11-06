import { listFirstTasks } from "./listTasks";
import type { TaskPriority} from "@/domain/tasks";
import { TaskWithCourse } from "@/domain/tasks/entities/taskWithCourse";
import { TaskStatus } from "@/domain/tasks";
import { getAllCourses } from "@/api/courses/endpoints/getAllCourses";

const DASHBOARD_TASKS_LIMIT = 100
const PENDING_STATUSES = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]

export async function getDashboardTasks(): Promise<Array<TaskWithCourse>> {

  const [tasks, courses] = await Promise.all([
    // No lower bound on dueDate: overdue and due-today pending tasks must show up.
    listFirstTasks({
      status: PENDING_STATUSES,
      sortBy: "dueDate",
      sortOrder: "asc",
    }, DASHBOARD_TASKS_LIMIT),
    getAllCourses({}),
  ])

  const coursesById = new Map(courses.map(course => [course.id, course]))

  return tasks.map(task => {
    const course = coursesById.get(task.courseId)

    return new TaskWithCourse(
      task.id,
      task.title,
      new Date(task.dueDate),
      task.priority as TaskPriority,
      task.courseId,
      course?.name ?? "",
      course?.code ?? "",
      task.status as TaskStatus
    )
  })
}
