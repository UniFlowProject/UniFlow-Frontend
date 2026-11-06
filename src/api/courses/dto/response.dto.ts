export interface GetCourseResponseDto {
  id: string;
  name: string;
  code: string;
  professor: string | null;
  credits: number;
  color: string | null;
  periodId: string;
  description: string | null;
  schedule: Array<string> | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCourseResponseDto = GetCourseResponseDto;
export type GetCourseByIdResponseDto = GetCourseResponseDto;
export type UpdateCourseResponseDto = GetCourseResponseDto;

export interface GetAllCoursesResponseDto {
  items: Array<GetCourseResponseDto>;
}

export interface GetCoursesByPeriodResponseDto {
  items: Array<GetCourseResponseDto>;
}

export interface ApiErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
