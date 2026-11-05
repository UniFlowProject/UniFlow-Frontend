import { Calendar, Clock, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Task } from '@/domain/tasks'
import { TaskStatus } from '@/domain/tasks'
import { cn } from "@/lib/utils"
import { useCourse } from "@/hooks/courses"
import { useDrag } from "@/hooks/drag-drop/useDrag"
import { useMemo } from "react"

interface TaskKanbanItemProps {
  task: Task
  className?: string
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function TaskKanbanItem({ task, className }: TaskKanbanItemProps) {
  const courseQuery = useCourse(task.courseId);

  const { isBeingDragged, ...draggableProps } = useDrag({
    dragData: { taskId: task.id, taskStatus: task.status },
    onDragStart: () => {
      // Optional: Add haptic feedback or analytics
    },
    onDragEnd: () => {
      // Optional: Clean up or track completion
    }
  })

  const urgencyIndicator = useMemo(() => {
    if (task.isOverdue()) {
      return {
        show: true,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50/70 dark:bg-red-950/30",
        borderColor: "border-l-red-400 dark:border-l-red-500",
        icon: AlertTriangle,
        text: "VENCIDA"
      }
    }

    if (task.isDueSoon()) {
      return {
        show: true,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50/70 dark:bg-amber-950/30",
        borderColor: "border-l-amber-400 dark:border-l-amber-500",
        icon: Clock,
        text: "PRÓXIMA"
      }
    }

    return { show: false }
  }, [task])

  return (
    <TooltipProvider>
      <Card
        {...draggableProps}
        className={cn(
          // Base styles - Minimalist
          "w-full transition-all duration-300 ease-out cursor-grab active:cursor-grabbing active:scale-90",
          "border border-border/40 bg-card/50 backdrop-blur-sm",
          "select-none touch-none",

          // Hover states - Subtle
          "hover:border-border/60 hover:bg-card/80 hover:shadow-sm",

          // Urgency indicator
          urgencyIndicator.show && [
            urgencyIndicator.bgColor,
            "border-l-2",
            urgencyIndicator.borderColor
          ],

          // Drag states - Clean animation
          isBeingDragged && [
            "opacity-60 scale-[1.02] rotate-1 shadow-lg ring-2 ring-primary/20",
            "cursor-grabbing z-50 transform-gpu",
            "border-primary/40 bg-primary/5"
          ],

          className
        )}
      >
        <CardHeader className="pb-2 px-4 pt-3">
          {/* Title */}
          <h3 className={cn(
            "font-medium text-sm leading-snug text-foreground line-clamp-2 mb-1",
            isBeingDragged && "text-primary"
          )}>
            {task.title}
          </h3>

          {/* Course */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <BookOpen className="size-3" />
            <span className="font-mono text-[10px] tracking-wider">
              {courseQuery.data?.getFullName()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-4 pb-3 space-y-3">
          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            {/* Date */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1 text-xs transition-colors duration-200",
                  task.isOverdue()
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-muted-foreground/70 hover:text-muted-foreground"
                )}>
                  <Calendar className="w-3 h-3" />
                  <span className="font-mono text-[10px]">{formatDate(task.dueDate)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>Vence: {task.getTimeUntilDue()}</p>
              </TooltipContent>
            </Tooltip>

            {/* Right side indicators */}
            <div className="flex items-center gap-2">
              {/* Estimated time */}
              {task.estimatedTimeHours && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-200">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono text-[10px]">{task.estimatedTimeHours}h</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>Tiempo estimado: {task.estimatedTimeHours} hora(s)</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Urgency badge */}
              {urgencyIndicator.show && urgencyIndicator.icon && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-1.5 text-[10px] font-medium border-current/30 bg-transparent",
                        urgencyIndicator.color,
                        "animate-pulse"
                      )}
                    >
                      <urgencyIndicator.icon className="w-2.5 h-2.5 mr-1" />
                      {urgencyIndicator.text === "VENCIDA" ? "!" : "⏰"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{task.getTimeUntilDue()}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Completion indicator */}
          {task.status === TaskStatus.DONE && (
            <div className="flex items-center justify-center pt-2 border-t border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completada</span>
                {task.completedAt && (
                  <span className="text-muted-foreground/60 font-mono text-[10px]">
                    {formatDate(task.completedAt)}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Drag handle indicator - only visible during drag */}
        <div className={cn(
          "absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary/30",
          "flex items-center justify-center transition-all duration-300",
          "opacity-0 scale-75",
          isBeingDragged && "opacity-100 scale-100 animate-spin"
        )}>
          <div className="w-2 h-2 rounded-full bg-primary/60" />
        </div>
      </Card>
    </TooltipProvider>
  )
}