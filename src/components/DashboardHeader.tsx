
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeFrame } from "@/types";
import { Plus, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface DashboardHeaderProps {
  onAddPurchase: () => void;
}

export function DashboardHeader({ onAddPurchase }: DashboardHeaderProps) {
  const { user, timeFrame, setTimeFrame } = useApp();
  const today = new Date();

  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {format(today, "d MMMM yyyy")}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 rounded-full bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white border rounded-full px-3 py-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{format(today, "d MMMM yyyy")}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Welcome To</h2>
          <h1 className="text-2xl md:text-3xl font-bold">Your Fish Management Area</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track, manage and analyze all your fish purchases in one place
          </p>
        </div>
        
        <Button onClick={onAddPurchase} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Add New Purchase
        </Button>
      </div>
    </div>
  );
}
