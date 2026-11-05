import { useQuery } from "@tanstack/react-query";
import { getTasksByCourse } from "@/api/tasks/endpoints/getTasksByCourse";

export function useTasksByCourse(courseId: string) {

  const tasksQuery = useQuery({
    queryKey: ["tasks", "course", courseId],
    queryFn: () => getTasksByCourse(courseId),
    retry: false
  })

  return { tasksQuery }

}
