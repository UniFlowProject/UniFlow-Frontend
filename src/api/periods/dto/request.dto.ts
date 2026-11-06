import type { PeriodType } from "@/domain/periods";

export interface GetPeriodsRequestDto {
  page?: number;
  limit?: number;
  type?: keyof typeof PeriodType;
  year?: number;
  isActive?: boolean;
}

export interface CreatePeriodRequestDto {
  name: string;
  type: keyof typeof PeriodType;
  year: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  isActive?: boolean;
}

export interface UpdatePeriodRequestDto {
  name?: string;
  type?: keyof typeof PeriodType;
  year?: number;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  isActive?: boolean;
}
export type PeriodFilters = Omit<GetPeriodsRequestDto, "page" | "limit">;
