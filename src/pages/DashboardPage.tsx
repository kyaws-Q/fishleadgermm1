
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SummaryCards } from "@/components/SummaryCards";
import { PurchaseTable } from "@/components/PurchaseTable";
import { SpendingChart } from "@/components/SpendingChart";
import { PurchaseForm } from "@/components/PurchaseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState as useReactState } from "react";
import { format } from "date-fns";
import { ActiveTasksList } from "@/components/ActiveTasksList";

export default function DashboardPage() {
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [date, setDate] = useReactState<Date>(new Date());
  
  return (
    <DashboardLayout>
      <DashboardHeader onAddPurchase={() => setIsAddPurchaseOpen(true)} />
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-medium">Total Purchases</CardTitle>
            </div>
            <Select defaultValue="6month">
              <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="6month">6 Months</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-0">
            <SpendingChart title="" type="area" /> 
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium">
                {format(date, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border-0"
              classNames={{
                day_today: "bg-primary text-primary-foreground font-bold",
                day_selected: "bg-primary text-primary-foreground",
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-medium">Purchase Distribution</CardTitle>
            </div>
            <Select defaultValue="pie">
              <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-0">
            <SpendingChart title="" type="pie" />
          </CardContent>
        </Card>

        <ActiveTasksList />
      </div>
      
      <PurchaseTable />
      <PurchaseForm open={isAddPurchaseOpen} onClose={() => setIsAddPurchaseOpen(false)} />
    </DashboardLayout>
  );
}
