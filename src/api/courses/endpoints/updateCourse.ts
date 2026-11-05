import { toCourse } from "../mappers/courseMapper";
import type { Course } from "@/domain/courses";
import type { UpdateCourseRequestDto } from "../dto/request.dto";
import type { UpdateCourseResponseDto } from "../dto/response.dto";
import { academicApi } from "@/lib/api/client";

export async function updateCourse(courseId: string, body: UpdateCourseRequestDto): Promise<Course | null> {
  const axiosResponse = await academicApi.patch<UpdateCourseResponseDto>(`/courses/${courseId}`, body);

  return toCourse(axiosResponse.data);
}
