import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "@/api/courses";

export function useCourses() {
  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: () => getAllCourses({})
  })

  return coursesQuery;
}