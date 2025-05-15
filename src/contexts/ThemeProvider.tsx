import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme } from '@/types';

type ThemeContextType = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  systemTheme: 'light' | 'dark';
  useSystemTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage or default to light
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const savedTheme = localStorage.getItem("app-theme");
    return (savedTheme as AppTheme) || "light";
  });

  // Determine if current theme is dark
  const isDarkMode = theme === 'dark';

  // Detect system preference
  const systemTheme = getSystemTheme();

  // Apply theme to document when it changes
  useEffect(() => {
    console.log("ThemeProvider: Theme changed to", theme);
    applyThemeToDocument(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyThemeToDocument(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Set theme with enhanced logging
  const setTheme = (newTheme: AppTheme) => {
    console.log(`ThemeProvider: Setting theme to ${newTheme}`);
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Use system theme
  const useSystemTheme = () => {
    setTheme(systemTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
        systemTheme,
        useSystemTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to get system theme
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Helper function to apply theme to document
function applyThemeToDocument(theme: AppTheme) {
  try {
    console.log("Applying theme to document:", theme);
    const html = document.documentElement;

    // Remove all theme classes first
    html.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green', 'dark');

    // Add the new theme class
    html.classList.add(`theme-${theme}`);

    // Special handling for dark mode
    if (theme === 'dark') {
      html.classList.add('dark');
    }

    // Store theme in localStorage
    localStorage.setItem('app-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#09090b' : '#ffffff'
      );
    }

    // Apply theme-specific styles directly to the body
    const body = document.body;

    // Set background color based on theme
    switch(theme) {
      case 'dark':
        body.style.backgroundColor = 'hsl(222.2, 84%, 4.9%)';
        body.style.color = 'hsl(210, 40%, 98%)';
        break;
      case 'blue':
        body.style.backgroundColor = 'hsl(210, 50%, 98%)';
        body.style.color = 'hsl(222.2, 84%, 4.9%)';
        break;
      case 'green':
        body.style.backgroundColor = 'hsl(150, 50%, 98%)';
        body.style.color = 'hsl(222.2, 84%, 4.9%)';
        break;
      default: // light
        body.style.backgroundColor = 'hsl(210, 40%, 98%)';
        body.style.color = 'hsl(222.2, 84%, 4.9%)';
    }

    // Force a repaint to ensure the theme is applied
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger a reflow
    document.body.style.display = '';

    console.log("Theme applied successfully:", theme);
  } catch (error) {
    console.error('Error applying theme:', error);
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
