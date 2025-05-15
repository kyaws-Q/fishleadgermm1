/**
 * API and data fetching types
 */

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: Error | null;
  timestamp: number | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export type TimeFrame = 'today' | 'week' | 'month' | 'year' | 'all' | '3months' | '6months';
export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom' | 'yesterday' | '3months' | 'year';
export type SortDirection = 'asc' | 'desc';
