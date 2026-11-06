import type { GetTaskResponseDto, PagedTasksResponseDto } from "../dto/response.dto";
import { academicApi } from "@/lib/api/client";

const MAX_PAGE_SIZE = 100

export interface ListTasksFilters {
  courseId?: string
  periodId?: string
  status?: Array<string>
  dueDateFrom?: string
  dueDateTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function listFirstTasks(filters: ListTasksFilters = {}, limit = MAX_PAGE_SIZE): Promise<Array<GetTaskResponseDto>> {
  const axiosResponse = await academicApi.get<PagedTasksResponseDto>("/tasks", {
    params: { ...filters, page: 1, limit },
    paramsSerializer: { indexes: null },
  })

  return axiosResponse.data.items
}

export async function listAllTasks(filters: ListTasksFilters = {}): Promise<Array<GetTaskResponseDto>> {
  const tasks: Array<GetTaskResponseDto> = []
  let page = 1
  let hasNext = true

  while (hasNext) {
    const axiosResponse = await academicApi.get<PagedTasksResponseDto>("/tasks", {
      params: { ...filters, page, limit: MAX_PAGE_SIZE },
      paramsSerializer: { indexes: null },
    })

    tasks.push(...axiosResponse.data.items)
    hasNext = axiosResponse.data.pageInfo.hasNext
    page += 1
  }

  return tasks
}
