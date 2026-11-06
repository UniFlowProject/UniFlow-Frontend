import type { GetCourseResponseDto } from "../dto/response.dto";
import { Course } from "@/domain/courses";

export function toCourse(dto: GetCourseResponseDto): Course {
  return new Course(
    dto.id,
    dto.name,
    dto.code,
    dto.professor ?? "",
    dto.credits,
    dto.periodId,
    new Date(dto.createdAt),
    new Date(dto.updatedAt),
    dto.color ?? undefined,
    dto.description ?? undefined,
    dto.schedule ?? [],
  );
}
