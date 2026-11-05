import { getAllTasks } from "@/api/tasks";
import { useQuery } from "@tanstack/react-query";

export function useTasks() {
  const coursesQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => getAllTasks()
  });

  return coursesQuery;
}