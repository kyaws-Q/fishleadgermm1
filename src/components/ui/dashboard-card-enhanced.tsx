import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Base styles for the card - consumer will add specific padding, etc.
const dashboardCardVariants = cva(
  "group transition-all duration-300 hover:translate-y-[-2px] bg-white rounded-xl shadow-lg w-full h-full flex flex-col min-w-0",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Icon container - for styling the wrapper around the icon if needed (e.g., colored circle)
const iconContainerVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Icon itself - for controlling the size/color of the SVG/Lucide icon
const iconVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface DashboardCardEnhancedProps extends VariantProps<typeof dashboardCardVariants> {
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function DashboardCardEnhanced({
  title,
  description,
  icon,
  className,
  contentClassName,
  headerClassName,
  footer,
  children,
  variant,
  size,
  onClick,
}: DashboardCardEnhancedProps) {
  return (
    <Card
      className={cn(dashboardCardVariants({ variant, size }), className)}
      onClick={onClick}
    >
      {(title || icon) && (
        <CardHeader className={cn("p-0", headerClassName)}>
          <div className="flex items-center justify-between w-full">
            {title && (
          <div>
                <CardTitle className="text-base font-medium text-gray-700">{title}</CardTitle>
            {description && (
                  <CardDescription className="text-xs text-gray-500 mt-0.5">{description}</CardDescription>
                )}
              </div>
            )}
          {icon && (
              <div className={cn(iconContainerVariants({ variant }))}>
              <div className={cn(iconVariants({ variant }))}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      )}

      <CardContent className={cn("p-0 flex-grow flex flex-col", contentClassName)}>
          {children}
      </CardContent>

      {footer && (
        <CardFooter className={cn("p-0 mt-auto", footer ? "pt-2 border-t border-gray-200/60" : "")}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
