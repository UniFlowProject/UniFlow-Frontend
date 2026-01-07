import { getAllPeriods } from "@/api/periods";
import { getDashboardTasks } from "@/api/tasks/endpoints/getDashboardTasks";
import { queryOptions } from "@tanstack/react-query";
import { academicApi } from "./api/client";

export const createDashboardTasksOptions = () => queryOptions({
  queryKey: ["dashboardTasks"],
  queryFn: async () => (await getDashboardTasks()).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
});

export const createPeriodsQueryOptions = () => queryOptions({
  queryKey: ["periods"],
  queryFn: () => getAllPeriods({})
});

export const createUserQueryOptions = () => queryOptions({
  queryKey: ['user'],
  queryFn: async () => await academicApi.get('/students/me').then(res => res.data),
  retry: false
});