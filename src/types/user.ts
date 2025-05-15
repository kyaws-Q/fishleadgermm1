/**
 * User domain types
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  profileUrl?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  theme: string;
  tableStyle: string;
  companyName: string;
  notifications: boolean;
  defaultDateRange: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: Error }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}

export interface AuthResponse {
  user: User | null;
  session: any;
  error: Error | null;
}
