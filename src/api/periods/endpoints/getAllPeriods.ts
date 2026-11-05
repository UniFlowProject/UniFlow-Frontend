import type { GetPeriodResponseDto, GetPeriodsResponseDto } from "@/api/periods";
import type { PeriodFilters } from "@/api/periods/dto/request.dto";
import { Period, PeriodType } from "@/domain/periods";
import { academicApi } from "@/lib/api/client";

const MAX_PAGE_SIZE = 100;

function toPeriod(period: GetPeriodResponseDto): Period {
  return new Period(
    period.id,
    period.name,
    PeriodType[period.type.replace('-', '_').toUpperCase() as keyof typeof PeriodType],
    period.year,
    new Date(period.startDate),
    new Date(period.endDate),
    period.userId,
    period.isActive,
    new Date(period.createdAt),
    new Date(period.updatedAt)
  );
}

// GET /periods is paginated (items + pageInfo, max 100 per page): read every page.
export async function getAllPeriods(filters: PeriodFilters = {}): Promise<Array<Period>> {
  const periods: Array<Period> = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const axiosResponse = await academicApi.get<GetPeriodsResponseDto>('/periods', {
      params: { ...filters, page, limit: MAX_PAGE_SIZE },
    });

    periods.push(...axiosResponse.data.items.map(toPeriod));
    hasNext = axiosResponse.data.pageInfo.hasNext;
    page += 1;
  }

  return periods;
}
