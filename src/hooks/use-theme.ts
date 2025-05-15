
import { useApp } from '@/contexts/AppContext';

// Use the theme from AppContext
export function useTheme() {
  const { appTheme, setAppTheme } = useApp();
  return {
    theme: appTheme,
    setTheme: setAppTheme
  };
}
