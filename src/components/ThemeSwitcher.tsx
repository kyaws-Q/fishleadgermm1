
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";
import { AppTheme } from "@/types";
import { Moon, Sun, Palette, Leaf, Monitor, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThemeSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function ThemeSwitcher({
  variant = 'outline',
  size = 'sm',
  showLabel = false,
  className
}: ThemeSwitcherProps) {
  const { theme, setTheme, isDarkMode, toggleDarkMode, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={cn("w-9 h-9 px-0", className)}>
        <span className="animate-pulse">...</span>
      </Button>
    );
  }

  // Get icon based on current theme
  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4 transition-transform duration-200 ease-in-out" />;
      case 'dark': return <Moon className="h-4 w-4 transition-transform duration-200 ease-in-out" />;
      case 'blue': return <Palette className="h-4 w-4 transition-transform duration-200 ease-in-out" />;
      case 'green': return <Leaf className="h-4 w-4 transition-transform duration-200 ease-in-out" />;
      default: return <Sun className="h-4 w-4 transition-transform duration-200 ease-in-out" />;
    }
  };

  // Get label based on current theme
  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'blue': return 'Blue';
      case 'green': return 'Green';
      default: return 'Light';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            showLabel ? "gap-2" : "h-9 w-9 px-0",
            "transition-all duration-200 ease-in-out hover:scale-105 bg-white/20 hover:bg-white/30 border border-white/30",
            className
          )}
        >
          {getThemeIcon()}
          {showLabel && <span>{getThemeLabel()}</span>}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 animate-in fade-in-80 zoom-in-95">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </div>
          {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </div>
          {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setTheme('blue')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Palette className="mr-2 h-4 w-4" />
            <span>Blue</span>
          </div>
          {theme === 'blue' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('green')}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Leaf className="mr-2 h-4 w-4" />
            <span>Green</span>
          </div>
          {theme === 'green' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={toggleDarkMode}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>Toggle Dark Mode</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
