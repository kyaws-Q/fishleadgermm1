import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // For structure

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="overflow-hidden shadow-sm border border-border/50 bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-24 mb-1" /> 
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 sm:px-4 sm:pb-4">
            <Skeleton className="h-8 w-20 mb-3" />
            <Skeleton className="h-5 w-full max-w-28 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 