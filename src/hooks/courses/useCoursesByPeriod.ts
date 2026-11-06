import { useQuery } from "@tanstack/react-query";
import { getPeriodCourses } from "@/api/periods";

export function useCoursesByPeriod(periodId: string) {
  const coursesByPeriod = useQuery({
    queryKey: ["courses", { periodId }],
    queryFn: () => getPeriodCourses(periodId),
    retry: false
  })

  return { coursesByPeriod }
}
