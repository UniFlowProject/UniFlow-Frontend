import { toCourse } from "../mappers/courseMapper";
import type { Course } from "@/domain/courses";
import type { GetCourseByIdResponseDto } from "../dto/response.dto";
import { academicApi } from "@/lib/api/client";

export async function getCourseById(courseId: string): Promise<Course | null> {
  const axiosResponse = await academicApi.get<GetCourseByIdResponseDto>(`/courses/${courseId}`);

  return toCourse(axiosResponse.data);
}
