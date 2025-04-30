
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeFrame } from "@/types";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onAddPurchase: () => void;
}

export function DashboardHeader({ onAddPurchase }: DashboardHeaderProps) {
  const { user, timeFrame, setTimeFrame } = useApp();

  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your fish purchases
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {timeFrameOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onAddPurchase}>
          <Plus className="mr-2 h-4 w-4" /> Add Purchase
        </Button>
      </div>
    </div>
  );
}
