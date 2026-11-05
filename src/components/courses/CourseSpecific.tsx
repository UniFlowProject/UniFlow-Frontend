import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Clock, AlertCircle, CheckCircle2, Loader2, Trash2, Edit } from "lucide-react"
import type { Course } from "@/domain/courses"
import { useDeleteCourse } from "@/hooks/courses/useDeleteCourse"
import { useUpdateCourse } from "@/hooks/courses/useUpdateCourse"
import { ActionOverlay } from "../ui/action-overlay"
import { useNavigate } from "@tanstack/react-router"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"





interface CourseSpecificProps {
  course: Course
  professor?: string
  progress: number
  hours: number
  projects: number
  tasks: number
  schedule?: string
  className?: string
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
}

export const CourseSpecific: React.FC<CourseSpecificProps> = ({
  course,
  professor = "Prof. Leo Víquez",
  progress,
  hours,
  projects,
  tasks,
  schedule,
  className,


}) => {
  const [editName, setEditName] = React.useState(course.name);
  const [open, setOpen] = React.useState(false)
  const deleteMutation = useDeleteCourse()
  const updateMutation = useUpdateCourse()
  const [overlay, setOverlay] = React.useState<"delete" | "edit" | null>(null)
  const navigate = useNavigate()

  // Mostrar overlay cuando hay acción en curso
  React.useEffect(() => {
    if (deleteMutation.isPending) setOverlay("delete")
    else if (updateMutation.isPending) setOverlay("edit")
    else if (overlay) {
      const timer = setTimeout(() => setOverlay(null), 1000); // esperar 1s antes de ocultar
      return () => clearTimeout(timer); // limpiar el timer si el componente se desmonta
    }
  }, [deleteMutation.isPending, updateMutation.isPending])

  return (

    <Card className={`w-full transition-all duration-200 hover:shadow-lg cursor-default ${className} flex flex-col`}>
      <CardHeader className="flex flex-col items-start justify-between sm:flex-row sm:items-center pb-2 flex-grow">
        <div className="sm:pr-4">
          <h3 className="text-2xl font-semibold leading-tight">{course.name}</h3>
          <p className="text-lg text-muted-foreground">
            {course.getFormattedCode()} • {professor} • {course.credits} Créditos
          </p>
          {schedule && (
            <p className="text-sm text-muted-foreground">{schedule}</p>
          )}
        </div>

        <div className="text-right mt-2 sm:mt-0 flex sm:flex-row sm:items-center gap-2">
          {/* Editar */}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border"
                title="Editar curso"
              >
                <Edit className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar curso</DialogTitle>
                <DialogDescription>
                  Modifica la información del curso y guarda los cambios.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input

                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="focus-visible:border-blue-500 focus-visible:ring-blue-500/50 selection:bg-blue-500 selection:text-white"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    updateMutation.mutate({
                      courseId: course.id,
                      payload: { name: editName },
                    })
                    setOpen(false)
                  }}
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}

                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Eliminar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border"
                title="Eliminar curso"
              >
                <Trash2 className="w-6 h-6 text-red-500 mx-auto mb-1" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará el curso{" "}
                  <span className="font-semibold">{course.name}</span> y toda
                  su información asociada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() =>
                    deleteMutation.mutate(course.id, {
                      onSettled: () => {
                        setTimeout(() => {
                          navigate({ to: "/dashboard/courses" })
                        }, 3000)
                      },
                    })
                  }
                >
                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">


        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-2 rounded-xl bg-muted flex items-center justify-start">
            <Loader2 className="w-5 h-5 text-purple-500  ml-2" />
            <div>
              <p className="text-lg font-semibold  ml-2">{progress}%</p>
              <p className="text-sm text-muted-foreground  ml-2">Progreso</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-muted flex items-center justify-start">
            <Clock className="w-5 h-5 text-blue-500 ml-2" />
            <div>
              <p className="text-lg font-semibold  ml-2">{hours}h</p>
              <p className="text-sm text-muted-foreground  ml-2">Dedicadas</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-muted flex items-center justify-start">
            <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
            <div>
              <p className="text-lg font-semibold  ml-2">{projects}</p>
              <p className="text-sm text-muted-foreground  ml-2">Proyectos</p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-muted flex items-center justify-start">
            <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />
            <div>
              <p className="text-lg font-semibold  ml-2">{tasks}</p>
              <p className="text-sm text-muted-foreground  ml-2">Tareas Pendientes</p>
            </div>
          </div>
        </div>
      </CardContent>
      <ActionOverlay show={!!overlay} type={overlay ?? "delete"} />
    </Card>
  )
}
