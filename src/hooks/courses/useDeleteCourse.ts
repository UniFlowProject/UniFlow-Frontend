
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteCourse } from "@/api/courses/endpoints/deleteCourse"

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      // Invalida cache para refrescar lista de cursos
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
    onError: (error: unknown) => {
      console.error("Error al eliminar el curso:", error)
      toast.error("No se pudo eliminar el curso. Verifica que no tenga tareas asociadas.")
    },
  })
}
