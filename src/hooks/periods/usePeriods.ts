import { createPeriodsQueryOptions } from "@/lib/queryOptions";
import { useQuery } from "@tanstack/react-query";

export function usePeriods() {
  const periodsQuery = useQuery(createPeriodsQueryOptions());

  return periodsQuery;
}