
import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

type Theme = 'light' | 'dark' | 'blue' | 'green';

export function useTheme() {
  const { appTheme, setAppTheme } = useApp();
  const [theme, setTheme] = useState<string>(appTheme || 'light');
  
  useEffect(() => {
    if (appTheme) {
      setTheme(`theme-${appTheme}`);
    }
  }, [appTheme]);
  
  return { theme, setAppTheme };
}
