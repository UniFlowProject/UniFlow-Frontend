import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCourses } from '@/hooks/courses'
import { useCreateTask } from '@/hooks/tasks'
import { DatePicker } from '@/components/DatePicker'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { TaskPriority, TaskStatus } from '@/domain/tasks'

const createTaskSearchSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  callbackUrl: z.string().optional()
})

// Schema alineado con el dominio y los enums
const createTaskFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  courseId: z.string().min(1, 'Selecciona un curso'),
  dueDate: z.date({
    required_error: 'La fecha de entrega es requerida'
  }),
  dueTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Hora inválida'),
  priority: z.nativeEnum(TaskPriority, {
    errorMap: () => ({ message: 'Selecciona una prioridad' })
  }),
  status: z.nativeEnum(TaskStatus),
  description: z.string().optional(),
  estimatedTimeHours: z.number().min(0, 'El tiempo debe ser positivo').optional(),
  tags: z.string().optional()
})

export const Route = createFileRoute('/dashboard/_protected/tasks/create')({
  component: RouteComponent,
  validateSearch: (search) => createTaskSearchSchema.parse(search)
})

function RouteComponent() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();
  const createTaskMutation = useCreateTask();
  const coursesQuery = useCourses();

  // Helper para extraer mensaje de error
  const getErrorMessage = (errors: any[]): string | null => {
    if (!errors || errors.length === 0) return null;
    const error = errors[0];
    return typeof error === 'string' ? error : error.message || 'Error de validación';
  };

  const form = useForm({
    defaultValues: {
      title: '',
      courseId: '',
      dueDate: undefined as Date | undefined,
      dueTime: '23:55:00',
      priority: undefined as TaskPriority | undefined,
      status: (searchParams.status || TaskStatus.TODO),
      description: undefined as string | undefined,
      estimatedTimeHours: undefined as number | undefined,
      tags: undefined as string | undefined
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        // Convertir fecha y hora a ISO string
        const dueDateTime = value.dueDate!;
        const [hours, minutes, seconds] = value.dueTime.split(':').map(Number);
        dueDateTime.setHours(hours, minutes, seconds);

        const course = coursesQuery.data?.find(course => course.id === value.courseId);
        if (!course) return;

        const data = {
          title: value.title,
          courseId: value.courseId,
          periodId: course.periodId,
          dueDate: dueDateTime.toISOString(),
          priority: value.priority!,
          status: value.status,
          description: value.description,
          estimatedTimeHours: value.estimatedTimeHours,
          tags: value.tags ? value.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
        };

        await createTaskMutation.mutateAsync(data);
        formApi.reset();
        // navigate({ to: searchParams.callbackUrl || "/dashboard" });
      } catch (error) {
        console.error('Error creating task:', error);
      }
    },
  });

  const handleCancel = () => {
    navigate({ to: searchParams.callbackUrl || "/dashboard" })
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Tarea</CardTitle>
          <CardDescription>
            Completa los campos para crear una nueva tarea
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="grid grid-cols-1 gap-6"
          >
            {/* Título */}
            <form.Field
              name="title"
              validators={{
                onSubmit: createTaskFormSchema.shape.title
              }}
            >
              {(field) => {
                const errorMessage = getErrorMessage(field.state.meta.errors);
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Título *</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ingresa el título de la tarea"
                      className={errorMessage ? 'border-red-500' : ''}
                    />
                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            {/* Curso */}
            <form.Field
              name="courseId"
              validators={{
                onSubmit: createTaskFormSchema.shape.courseId
              }}
            >
              {(field) => {
                const errorMessage = getErrorMessage(field.state.meta.errors);
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Curso *</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger className={errorMessage ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {coursesQuery.data?.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            {/* Fecha de entrega */}
            <form.Field
              name="dueDate"
              validators={{
                onSubmit: createTaskFormSchema.shape.dueDate
              }}
            >
              {(field) => {
                const errorMessage = getErrorMessage(field.state.meta.errors);
                return (
                  <div className="space-y-2">
                    <DatePicker
                      label='Fecha de Entrega *'
                      value={field.state.value}
                      onDateChange={(date) => {
                        field.handleChange(date);
                        field.handleBlur();
                      }}
                    />
                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            {/* Hora de entrega */}
            <form.Field
              name="dueTime"
              validators={{
                onSubmit: createTaskFormSchema.shape.dueTime
              }}
            >
              {(field) => {
                const errorMessage = getErrorMessage(field.state.meta.errors);
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="px-1">
                      Hora de entrega *
                    </Label>
                    <Input
                      type="time"
                      id={field.name}
                      name={field.name}
                      step="1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${errorMessage ? 'border-red-500' : ''}`}
                    />
                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            {/* Prioridad */}
            <form.Field
              name="priority"
              validators={{
                onSubmit: createTaskFormSchema.shape.priority
              }}
            >
              {(field) => {
                const errorMessage = getErrorMessage(field.state.meta.errors);
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Prioridad *</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value as TaskPriority);
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger className={errorMessage ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona la prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskPriority.LOW}>Baja</SelectItem>
                        <SelectItem value={TaskPriority.MEDIUM}>Media</SelectItem>
                        <SelectItem value={TaskPriority.HIGH}>Alta</SelectItem>
                        <SelectItem value={TaskPriority.URGENT}>Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            {/* Estado */}
            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Estado *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as TaskStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>En Proceso</SelectItem>
                      <SelectItem value={TaskStatus.IN_REVIEW}>En Revisión</SelectItem>
                      <SelectItem value={TaskStatus.DONE}>Hecho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Descripción */}
            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Descripción</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
                    placeholder="Describe la tarea (opcional)"
                    rows={4}
                  />
                </div>
              )}
            </form.Field>

            {/* Tiempo estimado */}
            <form.Field
              name="estimatedTimeHours"
              validators={{
                onSubmit: createTaskFormSchema.shape.estimatedTimeHours
              }}
            >
              {(field) => {
                const errorMessage = getErrorMessage(field.state.meta.errors);
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Tiempo Estimado (horas)
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      step="0.5"
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.handleChange(value ? parseFloat(value) : undefined);
                      }}
                      placeholder="Ej: 2.5"
                      className={errorMessage ? 'border-red-500' : ''}
                    />
                    {errorMessage && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            {/* Tags */}
            <form.Field name="tags">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Etiquetas</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value || undefined)}
                    placeholder="Ej: examen, proyecto, tarea (separadas por comas)"
                  />
                </div>
              )}
            </form.Field>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1"
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creando...' : 'Crear Tarea'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={createTaskMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}