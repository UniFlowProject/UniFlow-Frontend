import { toCourse } from "../mappers/courseMapper";
import type { Course } from "@/domain/courses";
import type { GetAllCoursesResponseDto } from "../dto/response.dto";
import { academicApi } from "@/lib/api/client";

interface GetAllCoursesParams {
  periodId?: string;
  professor?: string;
  credits?: number;
  search?: string;
}

// GET /courses is not paginated: it returns every course of the user in `items`.
export async function getAllCourses(params: GetAllCoursesParams): Promise<Array<Course>> {
  const axiosResponse = await academicApi.get<GetAllCoursesResponseDto>('/courses', { params });

  return axiosResponse.data.items.map(toCourse);
}
