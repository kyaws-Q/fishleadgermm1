/**
 * Error handling types
 */

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  details?: Record<string, any>;
  timestamp: number;
  handled: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  validationErrors: ValidationError[];
}

export type ErrorAction = 
  | { type: 'SET_ERROR'; payload: AppError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'CLEAR_VALIDATION_ERRORS' };

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToServer?: boolean;
  retry?: boolean;
  fallbackData?: any;
  type?: ErrorType;
}
