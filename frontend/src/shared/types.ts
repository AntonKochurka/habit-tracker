export const LoadingStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
} as const;

export type LoadingStatus = 
  | 'idle' 
  | 'loading' 
  | 'succeeded' 
  | 'failed';
  
export interface Model {
  id: number;
  created_at: string;
  updated_at: string | null;
}

export interface BaseState {
  status: LoadingStatus;
  error: string | null;
}

export interface Pagination {
  filters: Record<string, any>;
  page: number;
  hasMore: boolean;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}