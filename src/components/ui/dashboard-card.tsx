import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function DashboardCard({
  title,
  description,
  icon,
  className,
  contentClassName,
  footer,
  children,
}: DashboardCardProps) {
  return (
    <Card className={cn("group shadow-soft border-ocean-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-ocean-200", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          {icon && <div className="text-muted-foreground transition-colors duration-200 group-hover:text-primary">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className={cn("pt-2", contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className="border-t bg-muted/20 py-2">{footer}</CardFooter>}
    </Card>
  );
}
