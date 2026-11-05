import { useState } from "react"
import { Plus, Filter, SortAsc, MoreHorizontal, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { TaskKanbanColumn } from "./TaskKanbanColumn"
import { Task } from '@/domain/tasks'
import { TaskStatus, TaskPriority } from '@/domain/tasks'
import { useNavigate, useParams } from "@tanstack/react-router"
import { useTasksByPeriod } from "@/hooks/tasks/useTasksByPeriod"

interface KanbanColumnConfig {
  status: TaskStatus
  title: string
  description: string
}

// Configuración de las columnas del Kanban
const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    status: TaskStatus.TODO,
    title: "Por Hacer",
    description: "Tareas pendientes por iniciar"
  },
  {
    status: TaskStatus.IN_PROGRESS,
    title: "En Progreso",
    description: "Tareas que están siendo trabajadas"
  },
  {
    status: TaskStatus.IN_REVIEW,
    title: "En Revisión",
    description: "Tareas pendientes de revisión"
  },
  {
    status: TaskStatus.DONE,
    title: "Completadas",
    description: "Tareas finalizadas y entregadas"
  }
]

type SortOption = 'dueDate' | 'priority' | 'created' | 'title'
type FilterOption = TaskPriority | 'all'

export function TaskKanbanBoard() {

  const navigate = useNavigate();
  const { periodId } = useParams({ from: '/dashboard/_protected/periods/$periodId' });


  const { tasksQuery: { data: tasks, isLoading, error } } = useTasksByPeriod(periodId)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>('dueDate')
  const [filterPriority, setFilterPriority] = useState<FilterOption>('all')
  const [hiddenColumns, setHiddenColumns] = useState<Set<TaskStatus>>(new Set())

  // Filtrar y ordenar tareas
  const getFilteredAndSortedTasks = (tasks: Task[]): Task[] => {
    let filtered = tasks

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por prioridad
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    // Ordenamiento
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'priority':
          const priorityOrder = { [TaskPriority.URGENT]: 4, [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
  }

  // Agrupar tareas por status
  const getTasksByStatus = (status: TaskStatus): Task[] => {
    if (!tasks) return []
    const filteredTasks = getFilteredAndSortedTasks(tasks)
    return filteredTasks.filter(task => task.status === status)
  }

  // Estadísticas generales
  const getKanbanStats = () => {
    if (!tasks) return { total: 0, overdue: 0, completed: 0, inProgress: 0 }

    const filteredTasks = getFilteredAndSortedTasks(tasks)
    return {
      total: filteredTasks.length,
      overdue: filteredTasks.filter(task => task.isOverdue()).length,
      completed: filteredTasks.filter(task => task.status === TaskStatus.DONE).length,
      inProgress: filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length
    }
  }

  const handleAddTask = (status?: TaskStatus) => {
    navigate({
      to: '/dashboard/tasks/create',
      search: {
        status: status,
        callbackUrl: window.location.pathname + window.location.search
      }
    })

    console.log('Agregar tarea', status ? `en estado ${status}` : '')
  }

  const handleColumnAction = (status: TaskStatus, action: string) => {
    // TODO: Implementar acciones de columna (ordenar, expandir, etc.)
    console.log(`Acción ${action} en columna ${status}`)
  }

  const toggleColumnVisibility = (status: TaskStatus) => {
    const newHidden = new Set(hiddenColumns)
    if (newHidden.has(status)) {
      newHidden.delete(status)
    } else {
      newHidden.add(status)
    }
    setHiddenColumns(newHidden)
  }

  const visibleColumns = KANBAN_COLUMNS.filter(col => !hiddenColumns.has(col.status))
  const stats = getKanbanStats()

  if (isLoading) return <IsLoadingComponent />

  if (error) return <IsErrorComponent error={error} />

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header del Kanban */}
      <div className="space-y-4">
        {/* Título y estadísticas */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Tablero Kanban</h2>
            <p className="text-muted-foreground">
              Gestiona tus tareas de forma visual y eficiente
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-background">
                Total: {stats.total}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                En progreso: {stats.inProgress}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                Completadas: {stats.completed}
              </Badge>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  Vencidas: {stats.overdue}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Ordenar</span>
                  <span className="sm:hidden">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
                  Fecha de vencimiento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('priority')}>
                  Prioridad
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('created')}>
                  Fecha de creación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  Título
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Filtrar</span>
                  <span className="sm:hidden">Filter</span>
                  {filterPriority !== 'all' && (
                    <Badge className="ml-2 px-1 py-0 text-xs">1</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por prioridad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                  Todas las prioridades
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority(TaskPriority.HIGH)}>
                  🔥 Alta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority(TaskPriority.MEDIUM)}>
                  ⚡ Media
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority(TaskPriority.LOW)}>
                  📝 Baja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Columnas</span>
                  <span className="sm:hidden">Cols</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {KANBAN_COLUMNS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.status}
                    checked={!hiddenColumns.has(column.status)}
                    onCheckedChange={() => toggleColumnVisibility(column.status)}
                  >
                    {column.title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Task */}
            <Button onClick={() => handleAddTask()} size="sm" className="flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nueva Tarea</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-4 w-fit">
            {visibleColumns.map((column) => (
              <TaskKanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                tasks={getTasksByStatus(column.status)}
                onAddTask={() => handleAddTask(column.status)}
                onColumnAction={(action) => handleColumnAction(column.status, action)}
                className="flex-shrink-0 w-80 sm:w-72 md:w-80 lg:w-96"
              />
            ))}
          </div>
        </div>
      </div>
    </div >
  )
}

const IsLoadingComponent = () => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Cargando tablero Kanban...</p>
      </div>
    </div>
  )
}

const IsErrorComponent = ({ error }: { error: Error }) => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="text-red-500 text-sm font-medium">
          Error al cargar el tablero: {error.message}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}