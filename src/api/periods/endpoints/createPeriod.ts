import type { CreatePeriodRequestDto, CreatePeriodResponseDto } from "@/api/periods";
import { Period, PeriodType } from "@/domain/periods";
import { academicApi } from "@/lib/api/client";

export async function createPeriod(body: CreatePeriodRequestDto): Promise<Period> {
  const axiosResponse = await academicApi.post<CreatePeriodResponseDto>(
    '/periods',
    {
      ...body,
      type: body.type.replace('_', '-').toLowerCase(),
    }
  );

  return new Period(
    axiosResponse.data.id,
    axiosResponse.data.name,
    PeriodType[axiosResponse.data.type.replace('-', '_').toUpperCase() as keyof typeof PeriodType] as PeriodType,
    axiosResponse.data.year,
    new Date(axiosResponse.data.startDate),
    new Date(axiosResponse.data.endDate),
    axiosResponse.data.userId,
    axiosResponse.data.isActive,
    new Date(axiosResponse.data.createdAt),
    new Date(axiosResponse.data.updatedAt)
  );
}
