import { useQuery } from "@tanstack/react-query";
import { getCourseById } from "@/api/courses";

export function useCourse(courseId: string) {
  const courseQuery = useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => getCourseById(courseId),
    retry: false
  })

  return courseQuery;
}