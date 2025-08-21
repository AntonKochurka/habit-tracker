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