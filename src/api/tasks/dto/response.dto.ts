export interface PagedTasksResponseDto {
  items: Array<GetTaskResponseDto>
  pageInfo: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface GetTaskResponseDto {
  id: string
  userId: string
  title: string
  description: string | null
  courseId: string
  periodId: string
  dueDate: string
  status: string
  priority: string
  type: string
  estimatedTimeHours: number | null
  actualTimeHours: number | null
  tags: Array<string>
  groupMembers: Array<string>
  attachments: Array<string>
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export type CreateTaskResponseDto = GetTaskResponseDto

export type UpdateTaskStateResponseDto = GetTaskResponseDto

export type CompletedTaskResponseDto = GetTaskResponseDto
