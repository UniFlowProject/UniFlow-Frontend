import { createDashboardTasksOptions } from "@/lib/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

export function useDashboardTasks(initialLimit: number = 4) {
  const [visibleCount, setVisibleCount] = useState(initialLimit);

  const tasksQuery = useQuery(createDashboardTasksOptions());

  const visibleTasks = useMemo(() => {
    return tasksQuery.data?.slice(0, visibleCount) || [];
  }, [tasksQuery.data, visibleCount]);

  const hasMore = useMemo(() => {
    return (tasksQuery.data?.length || 0) > visibleCount;
  }, [tasksQuery.data, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => prev + initialLimit);
  };

  return {
    ...tasksQuery,
    data: visibleTasks,
    hasMore,
    loadMore,
    totalCount: tasksQuery.data?.length || 0
  };
}