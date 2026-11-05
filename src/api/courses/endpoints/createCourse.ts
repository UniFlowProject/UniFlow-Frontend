import { toCourse } from "../mappers/courseMapper";
import type { CreateCourseRequestDto } from "../dto/request.dto";
import type { CreateCourseResponseDto } from "../dto/response.dto";
import type { Course } from "@/domain/courses";
import { academicApi } from "@/lib/api/client";

export async function createCourse(body: CreateCourseRequestDto): Promise<Course> {
  const axiosResponse = await academicApi.post<CreateCourseResponseDto>('/courses', body);

  return toCourse(axiosResponse.data);
}
