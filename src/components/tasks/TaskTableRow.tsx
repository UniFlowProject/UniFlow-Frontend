import { Task } from "@/domain/tasks";
import { useCourse } from "@/hooks/courses";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "../ui/badge";
import { Link } from "@tanstack/react-router";
import { SquareArrowOutUpRight } from "lucide-react";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskPriorityBadge } from "./TaskPriorityBadge";

export const TaskTableRow = ({ task }: { task: Task }) => {

  const { data: course } = useCourse(task.courseId);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }



  const getOverdueIndicator = (task: Task) => {
    if (task.isOverdue()) {
      return <span>⚠️</span>
    }
    if (task.isDueSoon()) {
      return <span>⏰</span>
    }
    return null
  }



  return <TableRow key={task.id} className={task.isOverdue() && false ? 'bg-red-500/30 dark:bg-red-500/30' : ''}>
    <TableCell className="font-medium">
      <div className="flex gap-2">
        {getOverdueIndicator(task)}
        {task.title}
      </div>
    </TableCell>
    <TableCell className="font-mono text-xs">
      {!!course && (
        <Link to={`/dashboard/courses/$courseId`} params={{ courseId: course.id }} className="flex items-center gap-2 hover:text-blue-500 max-w-min">
          {course.name}
          <SquareArrowOutUpRight className="size-4" />
        </Link>
      )}
    </TableCell>
    <TableCell>
      <TaskStatusBadge status={task.status} />
    </TableCell>
    <TableCell>
      <TaskPriorityBadge priority={task.priority} />
    </TableCell>
    <TableCell>{formatDate(task.dueDate)}</TableCell>
    <TableCell className={task.isOverdue() ? "text-red-500" : task.isDueSoon() ? "text-yellow-500" : undefined}>
      {task.getTimeUntilDue()}
    </TableCell>
    {/* <TableCell className="max-w-xs">
      <div className="truncate" title={task.description}>
        {task.description || '-'}
      </div>
    </TableCell> */}
    <TableCell>
      <div className="flex flex-wrap gap-1">
        {task.tags.length > 0 ? (
          task.tags.map((tag, index) => (
            <Badge key={index}>{tag}</Badge>
          ))
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    </TableCell>
    <TableCell>
      <Link
        to="/dashboard/tasks/$taskId"
        params={{ taskId: task.id }}
        className="flex items-center gap-2 hover:text-blue-500 max-w-min"
      >
        Abrir
        <SquareArrowOutUpRight className="size-4" />
      </Link>
    </TableCell>
  </TableRow>
}