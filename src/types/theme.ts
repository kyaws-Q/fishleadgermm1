/**
 * Theme and styling types
 */

export type AppTheme = 'light' | 'dark' | 'blue' | 'green';

export type TableStyle = 'default' | 'bordered' | 'striped' | 'compact' | 'modern' | 'excel';

export type TimeFrame = 'day' | 'week' | 'month' | 'year';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeState {
  theme: AppTheme;
  tableStyle: TableStyle;
}

export type ThemeAction =
  | { type: 'SET_THEME'; payload: AppTheme }
  | { type: 'SET_TABLE_STYLE'; payload: TableStyle }
  | { type: 'RESET_THEME' };
