import { createContext } from 'react';
import { AppTheme } from '@/types';

export interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  systemTheme: 'light' | 'dark';
  useSystemTheme: () => void;
}

// Create the Theme context
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
