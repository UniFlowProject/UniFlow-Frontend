import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, SquareArrowOutUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Task } from '@/domain/tasks'
import { TaskStatus, TaskPriority } from '@/domain/tasks'
import { useCourse } from "@/hooks/courses"
import { Link } from "@tanstack/react-router"
import { useCompleteTask } from "@/hooks/tasks/useCompleteTask"
import { useDeleteTask } from "@/hooks/tasks/useDeleteTask"
import { useStartTask } from "@/hooks/tasks/useStartTask"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskPriorityBadge } from "./TaskPriorityBadge"

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Título
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const task = row.original
      return (
        <div className="font-medium flex items-center gap-2 w-full">
          {task.isOverdue() && (
            <div className="text-xs text-red-500 font-semibold">
              ⚠️
            </div>
          )}
          {task.isDueSoon() && !task.isOverdue() && (
            <div className="text-xs text-yellow-600 font-semibold">
              ⏰
            </div>
          )}
          <div className="flex justify-between items-center flex-1">
            <div className="max-w-[250px] truncate">{task.title}</div>
            <Button size="sm" variant={"outline"} className="text-xs px-2 py-1" asChild>
              <Link to="/dashboard/tasks/$taskId" params={{ taskId: task.id }}>
                Abrir
              </Link>
            </Button>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "courseId",
    header: "Curso",
    cell: ({ row }) => {
      const { data: course, isLoading } = useCourse(row.getValue("courseId"));

      if (isLoading) return <div className="font-mono text-xs">Cargando...</div>

      if (!course) return <div>-</div>

      return <Link to={`/dashboard/courses/$courseId`} params={{ courseId: course.id }} className="flex items-center gap-2 hover:text-blue-500 max-w-min">
        {course.name}
        <SquareArrowOutUpRight className="size-4" />
      </Link>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as TaskStatus
      return (
        <TaskStatusBadge status={status} />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prioridad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as TaskPriority
      return (
        <TaskPriorityBadge priority={priority} />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return formatDate(row.getValue("dueDate"))
    },
  },
  {
    id: "timeUntilDue",
    header: "Tiempo Restante",
    cell: ({ row }) => {
      const task = row.original
      return (
        <div className={task.isOverdue() ? "text-red-600 font-semibold" : ""}>
          {task.getTimeUntilDue()}
        </div>
      )
    },
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const task = row.original
      return (
        <div className="flex flex-wrap gap-1 max-w-[120px]">
          {task.tags.length > 0 ? (
            task.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
          {task.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "estimatedTimeHours",
    header: "Tiempo Est.",
    cell: ({ row }) => {
      const hours = row.getValue("estimatedTimeHours") as number
      return hours ? `${hours}h` : "-"
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const task = row.original

      const { completeTaskMutation } = useCompleteTask(task.id)
      const { deleteTaskMutation } = useDeleteTask(task.id)
      const { startTaskMutation } = useStartTask(task.id)

      const handleCompleteTask = () => {
        completeTaskMutation.mutate()
      }

      const handleDeleteTask = () => {
        deleteTaskMutation.mutate(task.id)
      }

      const handleStartTask = () => {
        startTaskMutation.mutate()
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(task.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={task.status === TaskStatus.DONE}
              onClick={handleStartTask}
            >
              Iniciar tarea
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={task.status === TaskStatus.DONE}
              onClick={handleCompleteTask}
            >
              Completar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/tasks/$taskId" params={{ taskId: task.id }}>
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={handleDeleteTask}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]