import { Link, useParams } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  Tag,
  Play,
  CheckCircle2,
  Send,
  AlertTriangle,
  Hash,
  GraduationCap,
  BookOpen,
  LoaderIcon,
  TextIcon,
  MousePointerClick,
  History
} from 'lucide-react'
import { Task, TaskStatus } from '@/domain/tasks'
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { useCourse } from '@/hooks/courses'
import { updateTaskStatus } from '@/api/tasks/endpoints/updateTaskState'
import type { UpdateTaskStateResponseDto } from '@/api/tasks'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GoBackButton } from '../GoBackButton'

// Utility function to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function TaskDetail({ task }: { task: Task }) {
  const params = useParams({ from: "/dashboard/_protected/tasks/$taskId" })
  const courseQuery = useCourse(task.courseId)

  // TODO: Cambiar por task.id cuando se implemente el endpoint
  const queryClient = useQueryClient();

  const changeTaskStatusMutation = useMutation<
    UpdateTaskStateResponseDto,
    Error,
    { taskId: string, newStatus: TaskStatus },
    { previousTask: Task | undefined; taskId: string; newStatus: TaskStatus }
  >({
    mutationKey: ['tasks', params.taskId, 'update'],
    mutationFn: ({ taskId, newStatus }: { taskId: string, newStatus: TaskStatus }) => updateTaskStatus(taskId, newStatus),

    onMutate: async ({ taskId, newStatus }) => {
      // Cancelar queries en progreso para evitar que sobrescriban nuestra actualización optimística
      await queryClient.cancelQueries({ queryKey: ['tasks', params.taskId] });

      // Guardar el valor anterior para rollback
      const previousTask = queryClient.getQueryData<Task>(['tasks', params.taskId]);

      // Actualizar optimísticamente
      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', params.taskId], (oldData) =>
          oldData?.updateStatus(newStatus) || oldData
        );
      }

      // Toast de carga
      toast.loading(`Actualizando Tarea...`, {
        id: `update-Tarea-${taskId}-${newStatus}`,
      });

      // Retornar contexto para uso en onError
      return { previousTask, taskId, newStatus };
    },

    onSuccess: (_, { taskId, newStatus }) => {
      // Invalidar y refetch las queries relacionadas (opcional si confías en la actualización optimística)
      // queryClient.invalidateQueries({ queryKey: ['tasks', params.taskId] });

      // Toast de éxito
      toast.success(`Tarea actualizado correctamente`, {
        id: `update-Tarea-${taskId}-${newStatus}`,
      });
    },

    onError: (error, { taskId, newStatus }, context) => {
      // Revertir la actualización optimística
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', params.taskId], context.previousTask);
      }

      // Toast de error
      toast(`Error al actualizar Tarea`, {
        description: error.message,
        id: `update-Tarea-${taskId}-${newStatus}`,
      });
    },
  });


  const handleStartTask = () => {
    changeTaskStatusMutation.mutate({ taskId: params.taskId, newStatus: TaskStatus.IN_PROGRESS });
  }

  const handleCompleteTask = () => {
    changeTaskStatusMutation.mutate({ taskId: params.taskId, newStatus: TaskStatus.DONE });
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <GoBackButton />
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            {task.title}
            {task.isOverdue() && (
              <Badge variant="destructive" className='ml-6'>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Vencida
              </Badge>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">ID: {task.id}</p>
        </div>

      </div>

      {/* BentoGrid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 min-h-[600px] w-full">

        {/* Course Information - Large Card */}
        <Card className="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <BookOpen className="h-5 w-5" />
              Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : courseQuery.data ? (
              <div className="space-y-3">
                <div>
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    {courseQuery.data.getFormattedCode()}
                  </p>
                  <p className="text-sm sm:text-base font-medium text-muted-foreground">
                    {courseQuery.data.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm">
                    {courseQuery.data.credits} {courseQuery.data.credits === 1 ? 'crédito' : 'créditos'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">No se pudo cargar la información del curso</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard/courses/$courseId" params={{ courseId: task.courseId }} className="w-full">
                Ver Curso
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Progress Card */}
        <Card className="lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <LoaderIcon />
              Progreso de la Tarea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                {task.getProgressPercentage()}%
              </div>
              <Progress value={task.getProgressPercentage()} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground">Estado</p>
                <p className="font-medium">
                  <TaskStatusBadge status={task.status} />
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Prioridad</p>
                <p className="font-medium">
                  <TaskPriorityBadge priority={task.priority} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Due Date - Tall Card */}
        <Card className="md:col-span-1 lg:col-span-1 xl:col-span-2 row-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <Calendar className="h-4 w-4" />
              Fecha Límite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">
                {formatDate(task.dueDate)}
              </p>
              <p className={`text-sm sm:text-base md:text-lg font-semibold ${task.isOverdue()
                ? 'text-red-600 dark:text-red-400'
                : task.isDueSoon()
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
                }`}>
                {task.getTimeUntilDue()}
              </p>
            </div>

            {task.estimatedTimeHours && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Tiempo Estimado</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {task.estimatedTimeHours}h
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description - Wide Card */}
        {task.description && (
          <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                <TextIcon />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base">
                {task.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tags Card */}
        {task.tags.length > 0 && (
          <Card className="md:col-span-1 lg:col-span-2 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <Tag className="h-4 w-4" />
                Etiquetas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs sm:text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card className="md:col-span-1 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
              <History />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row gap-4">
            <div>
              <p className="text-xs sm:text-xs text-muted-foreground">Creada</p>
              <p className="text-xs sm:text-sm font-medium">
                {formatDateTime(task.createdAt)}
              </p>
            </div>

            <Separator orientation='vertical' />
            <div>
              <p className="text-xs sm:text-xs text-muted-foreground">Última actualización</p>
              <p className="text-xs sm:text-sm font-medium">
                {formatDateTime(task.updatedAt)}
              </p>
            </div>

            <Separator orientation='vertical' />
            <div>
              <p className="text-xs sm:text-xs text-muted-foreground">Completada</p>
              <p className="text-xs sm:text-sm font-medium">
                {task.completedAt ? formatDateTime(task.completedAt) : 'No completada'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="md:col-span-2 lg:col-span-4 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
              <MousePointerClick />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {task.status === TaskStatus.TODO && (
                <Button className="flex items-center gap-2" onClick={handleStartTask}>
                  <Play className="h-4 w-4" />
                  Comenzar
                </Button>
              )}
              {task.status === TaskStatus.IN_PROGRESS && (
                <>
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleCompleteTask}>
                    <CheckCircle2 className="h-4 w-4" />
                    Completar
                  </Button>
                </>
              )}
              {task.status === TaskStatus.IN_REVIEW && (
                <Button className="flex items-center gap-2 col-span-2" onClick={handleCompleteTask}>
                  <Send className="h-4 w-4" />
                  Entregar Tarea
                </Button>
              )}
              <Button variant="outline" className="">
                Editar Tarea
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}