import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Course } from "@/domain/courses";
import type {CreateCourseRequestDto} from "@/api/courses";
import {  createCourse } from "@/api/courses";

export function useCreateCourse() {
  const qc = useQueryClient();

  return useMutation<Course, Error, CreateCourseRequestDto>({
    mutationKey: ["courses"],
    mutationFn: (data: CreateCourseRequestDto) => createCourse(data),
    onSuccess() {
      // Prefix match refreshes both the full list and the per-period lists
      qc.invalidateQueries({ queryKey: ["courses"] })
      toast.success("Curso creado satisfactoriamente")
    },
  });
}