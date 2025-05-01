
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { AppTheme } from "@/types";
import { Moon, Sun, Palette, Leaf } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";

export function ThemeSwitcher() {
  const { appTheme, setAppTheme } = useApp();
  
  // Apply theme class to document
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green');
    // Add current theme class
    document.documentElement.classList.add(`theme-${appTheme}`);
    
    // Set color scheme for browser
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-9 px-0">
          {appTheme === 'light' && <Sun className="h-4 w-4" />}
          {appTheme === 'dark' && <Moon className="h-4 w-4" />}
          {appTheme === 'blue' && <Palette className="h-4 w-4" />}
          {appTheme === 'green' && <Leaf className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setAppTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAppTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAppTheme('blue')}>
          <Palette className="mr-2 h-4 w-4" />
          <span>Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAppTheme('green')}>
          <Leaf className="mr-2 h-4 w-4" />
          <span>Green</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
