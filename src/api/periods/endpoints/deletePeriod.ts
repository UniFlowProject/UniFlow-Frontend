import { academicApi } from "@/lib/api/client";

export async function deletePeriodById(periodId: string | number): Promise<boolean> {
  const axiosResponse = await academicApi.delete(`/periods/${periodId}`);

  if (axiosResponse.status === 409) {
    throw new Error('Cannot delete period with associated courses.');
  }

  return axiosResponse.status === 204;
}