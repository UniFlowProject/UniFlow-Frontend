import type { PeriodType } from "@/domain/periods";

export interface GetPeriodResponseDto {
  id: string;
  name: string;
  type: keyof typeof PeriodType;
  year: number;
  startDate: string;
  endDate: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetPeriodsResponseDto {
  items: Array<GetPeriodResponseDto>;
  pageInfo: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetCurrentPeriodResponseDto {
  id: string;
  name: string;
  type: keyof typeof PeriodType;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreatePeriodResponseDto {
  id: string;
  name: string;
  type: keyof typeof PeriodType;
  year: number;
  startDate: string;
  endDate: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetPeriodByIdResponseDto {
  id: string;
  name: string;
  type: keyof typeof PeriodType;
  year: number;
  startDate: string;
  endDate: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePeriodResponseDto {
  id: string;
  name: string;
  type: keyof typeof PeriodType;
  year: number;
  startDate: string;
  endDate: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
