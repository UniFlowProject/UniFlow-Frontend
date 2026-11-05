import { isAxiosError } from "axios";
import { academicApi } from "@/lib/api/client";

const HTTP_CONFLICT = 409;

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await academicApi.delete<void>(`/courses/${courseId}`);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === HTTP_CONFLICT) {
      throw new Error("Cannot delete course with associated tasks.");
    }
    throw error;
  }
}
