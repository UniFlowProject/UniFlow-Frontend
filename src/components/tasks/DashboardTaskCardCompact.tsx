import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TaskWithCourse } from "@/domain/tasks/entities/taskWithCourse"
import { Link } from "@tanstack/react-router"

interface Props {
  task: TaskWithCourse
}

export const DashboardTaskCardCompact = ({ task }: Props) => {
  return (
    <Link
      to="/dashboard/tasks/$taskId"
      params={{ taskId: task.id }}
      className="block rounded-lg border bg-card hover:border-primary transition-colors p-3 text-sm w-full"
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold truncate">{task.title}</h4>
        <div className="flex gap-1">
          <Badge variant="destructive" className="text-xs px-2 py-0">
            {task.status.replace("-", "_").toUpperCase()}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs px-2 py-0"
          >
            {task.priority.toUpperCase()}
          </Badge>
        </div>
      </div>

      <p className="text-muted-foreground text-xs truncate">
        {task.courseName} | {task.courseCode}
      </p>

      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {task.dueDate.toLocaleDateString("es-CR", {
            day: "2-digit",
            month: "short",
          })}{" "}
          {task.dueDate.toLocaleTimeString("es-CR", {
            timeStyle: "short",
            hour12: false,
          })}
        </span>
        <span className={`text-destructive text-base font-medium`}>
          {task.getTimeUntilDue()}
        </span>
      </div>
    </Link>
  )
}
