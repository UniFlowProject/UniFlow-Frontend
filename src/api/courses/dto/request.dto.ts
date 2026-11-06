export interface CreateCourseRequestDto {
  name: string;
  code: string;
  professor?: string;
  credits: number;
  color?: string;
  periodId: string;
  description?: string;
  schedule?: Array<string>;
}

// PATCH /courses/{id}: the course cannot be moved to another period.
export interface UpdateCourseRequestDto {
  name?: string;
  code?: string;
  professor?: string;
  credits?: number;
  color?: string;
  description?: string;
}
