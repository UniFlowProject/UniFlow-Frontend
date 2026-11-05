import type { GetCoursesByPeriodResponseDto } from "@/api/courses";
import type { Course } from "@/domain/courses";
import { toCourse } from "@/api/courses";
import { academicApi } from "@/lib/api/client";

export async function getPeriodCourses(periodId: string | number): Promise<Array<Course>> {
  const axiosResponse = await academicApi.get<GetCoursesByPeriodResponseDto>(`/periods/${periodId}/courses`);

  return axiosResponse.data.items.map(toCourse);
}
