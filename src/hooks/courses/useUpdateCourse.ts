
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UpdateCourseRequestDto } from "@/api/courses"
import { updateCourse } from "@/api/courses/endpoints/updateCourse"

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: UpdateCourseRequestDto }) =>
      updateCourse(courseId, payload),
    onSuccess: () => {
      // Invalida las queries de courses para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
    onError: (error: unknown) => {
      console.error("Error al editar el curso:", error)
    },
  })
}
