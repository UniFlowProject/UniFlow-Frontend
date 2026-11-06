import { Plus, MoreHorizontal } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskKanbanItem } from "./TaskKanbanItem"
import { Task } from '@/domain/tasks'
import { TaskStatus } from '@/domain/tasks'
import { cn } from "@/lib/utils"
import { useChangeTaskStatus } from "@/hooks/tasks/useChangeTaskStatus"
import { useDrop } from "@/hooks/drag-drop/useDrop"
import { useParams } from "@tanstack/react-router"

interface TaskKanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onAddTask?: () => void
  onColumnAction?: (action: string) => void
  className?: string
}

const getStatusConfig = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return {
        color: "text-slate-700 dark:text-slate-300",
        accentColor: "bg-slate-400",
        dropColor: "border-slate-300 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-900/50"
      }
    case TaskStatus.IN_PROGRESS:
      return {
        color: "text-blue-700 dark:text-blue-300",
        accentColor: "bg-blue-500",
        dropColor: "border-blue-300 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-900/50"
      }
    case TaskStatus.IN_REVIEW:
      return {
        color: "text-amber-700 dark:text-amber-300",
        accentColor: "bg-amber-500",
        dropColor: "border-amber-300 bg-amber-50/50 dark:border-amber-600 dark:bg-amber-900/50"
      }
    case TaskStatus.DONE:
      return {
        color: "text-green-700 dark:text-green-300",
        accentColor: "bg-green-500",
        dropColor: "border-green-300 bg-green-50/50 dark:border-green-600 dark:bg-green-900/50"
      }
    default:
      return {
        color: "text-gray-700 dark:text-gray-300",
        accentColor: "bg-gray-500",
        dropColor: "border-gray-300 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-900/50"
      }
  }
}

const sortTasksByDate = (tasks: Task[], columnType: TaskStatus) => {
  switch (columnType) {
    case TaskStatus.TODO:
    case TaskStatus.IN_PROGRESS:
      console.log('Sorting tasks by due date')
      return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    case TaskStatus.DONE:
      console.log('Sorting tasks by completion date')
      return tasks.sort((a, b) => b.completedAt?.getTime()! - a.completedAt?.getTime()!)
    default:
      return tasks
  }
}

export function TaskKanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onColumnAction,
  className
}: TaskKanbanColumnProps) {

  const { periodId } = useParams({ from: '/dashboard/_protected/periods/$periodId' });

  const { changeTaskStatusMutation } = useChangeTaskStatus({ queryKey: ["tasks", "period", periodId] });

  const { isOver, ...dropProps } = useDrop({
    accept: ['application/json'],
    onDrop: ({ taskId, taskStatus }) => {
      if (taskId && taskStatus !== status) {
        changeTaskStatusMutation.mutate({ taskId, newStatus: status })
      }
    },
  })

  const statusConfig = getStatusConfig(status)
  const taskCount = tasks.length

  return (
    <div
      {...dropProps}
      className={cn(
        "flex flex-col h-full min-w-[320px] max-w-[400px] transition-all duration-300 ease-out",
        "rounded-lg border-2 border-transparent",
        isOver && [
          "border-dashed",
          statusConfig.dropColor
        ],
        className
      )}
    >
      {/* Column Header */}
      <Card className="mb-4 border-0 shadow-none bg-transparent">
        <CardHeader className="pb-4 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status Indicator - Minimalist dot */}
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                statusConfig.accentColor,
                isOver && "w-3 h-3 animate-pulse"
              )} />

              {/* Title and Count */}
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-sm font-medium tracking-tight",
                  statusConfig.color
                )}>{title}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 px-2 text-xs font-normal border-current/20 bg-transparent",
                    statusConfig.color
                  )}
                >
                  {taskCount}
                </Badge>
              </div>
            </div>

            {/* Column Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onAddTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddTask}
                  className="h-7 w-7 p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only">Agregar tarea</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">Opciones de columna</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuLabel className="text-xs">Opciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onColumnAction?.('sort-date')} className="text-xs">
                    Ordenar por fecha
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onColumnAction?.('sort-priority')} className="text-xs">
                    Ordenar por prioridad
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onColumnAction?.('expand-all')} className="text-xs">
                    Expandir todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onColumnAction?.('collapse-all')} className="text-xs">
                    Colapsar todas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks Container */}
      <div className={cn(
        "flex-1 min-h-0 px-2 transition-all duration-300",
        isOver && "scale-[1.02] transform-gpu"
      )}>
        <ScrollArea className="h-full">
          {taskCount > 0 ? (
            <div className="space-y-2 pb-4 max-h-[80dvh]">
              {sortTasksByDate(tasks, status).map((task) => (
                <TaskKanbanItem
                  key={task.id}
                  task={task}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            /* Empty State - Minimalist */
            <div className="flex flex-col items-center justify-center h-40 text-center group select-none">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                "bg-muted/30 group-hover:bg-muted/50",
                isOver && "bg-muted/70 scale-110"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  statusConfig.accentColor,
                  "opacity-30 group-hover:opacity-50",
                  isOver && "opacity-70 animate-pulse"
                )} />
              </div>
              <p className="text-xs text-muted-foreground/70 font-medium mb-1">
                Sin tareas
              </p>
              <p className="text-xs text-muted-foreground/50 leading-relaxed max-w-[200px]">
                Arrastra tareas aquí o crea una nueva
              </p>
              {onAddTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddTask}
                  className="mt-3 text-xs h-7 px-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted/50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nueva tarea
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Drop Zone Indicator - Minimalist line */}
      <div className={cn(
        "mx-3 mb-3 h-0.5 rounded-full transition-all duration-300 ease-out",
        statusConfig.accentColor,
        "opacity-0 scale-x-0",
        isOver && "opacity-60 scale-x-100 shadow-sm"
      )} />
    </div>
  )
}