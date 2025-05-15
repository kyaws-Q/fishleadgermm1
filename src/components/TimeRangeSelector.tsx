import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TimeFrame } from "@/types";

interface TimeRangeSelectorProps {
  className?: string;
}

export function TimeRangeSelector({ className }: TimeRangeSelectorProps) {
  const { timeFrame, setTimeFrame, setDateRange } = useApp();
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Handle time frame change
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    updateDateRange(newTimeFrame, date);
  };

  // Handle date navigation
  const handlePrevious = () => {
    let newDate;
    switch (timeFrame) {
      case "day":
        newDate = subDays(date, 1);
        break;
      case "week":
        newDate = subWeeks(date, 1);
        break;
      case "month":
        newDate = subMonths(date, 1);
        break;
      case "year":
        newDate = new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
        break;
      default:
        newDate = subDays(date, 1);
    }
    setDate(newDate);
    updateDateRange(timeFrame, newDate);
  };

  const handleNext = () => {
    let newDate;
    switch (timeFrame) {
      case "day":
        newDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "week":
        newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        newDate = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
        break;
      case "year":
        newDate = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
        break;
      default:
        newDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    }

    // Don't allow future dates
    const today = new Date();
    if (newDate > today) {
      newDate = today;
    }

    setDate(newDate);
    updateDateRange(timeFrame, newDate);
  };

  // Update date range based on time frame and selected date
  const updateDateRange = (timeFrame: TimeFrame, selectedDate: Date) => {
    let start, end;

    switch (timeFrame) {
      case "day":
        start = startOfDay(selectedDate);
        end = endOfDay(selectedDate);
        break;
      case "week":
        start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        break;
      case "year":
        start = new Date(selectedDate.getFullYear(), 0, 1);
        end = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
    }

    setDateRange({ start, end });
  };

  // Format the current date range for display
  const formatDateRange = () => {
    switch (timeFrame) {
      case "day":
        return format(date, "MMMM d, yyyy");
      case "week":
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(date, "MMMM yyyy");
      case "year":
        return format(date, "yyyy");
      default:
        return format(date, "MMMM yyyy");
    }
  };

  // Handle date selection from calendar
  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      updateDateRange(timeFrame, newDate);
      setCalendarOpen(false);
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2 w-full justify-start", className)}>
      {/* Time frame selector - modern card style */}
      <div className="flex items-center rounded-lg bg-white shadow-md p-1 w-auto">
        <div className="flex min-w-max w-full justify-between sm:justify-start">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-4 text-gray-700 hover:text-black hover:bg-gray-100 text-base font-medium h-9",
              timeFrame === "day" && "bg-gray-100 text-black shadow-sm"
            )}
            onClick={() => handleTimeFrameChange("day")}
          >
            Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-4 text-gray-700 hover:text-black hover:bg-gray-100 text-base font-medium h-9",
              timeFrame === "week" && "bg-gray-100 text-black shadow-sm"
            )}
            onClick={() => handleTimeFrameChange("week")}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-4 text-gray-700 hover:text-black hover:bg-gray-100 text-base font-medium h-9",
              timeFrame === "month" && "bg-gray-100 text-black shadow-sm"
            )}
            onClick={() => handleTimeFrameChange("month")}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-4 text-gray-700 hover:text-black hover:bg-gray-100 text-base font-medium h-9",
              timeFrame === "year" && "bg-gray-100 text-black shadow-sm"
            )}
            onClick={() => handleTimeFrameChange("year")}
          >
            Year
          </Button>
        </div>
      </div>
      {/* Date selector - modern card style */}
      <div className="flex items-center gap-1 bg-white rounded-lg shadow-md p-1 w-auto mt-2 sm:mt-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="h-9 w-9 rounded-full text-gray-700 hover:bg-gray-100 hover:text-black transition-all flex-none"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-4 text-gray-700 hover:text-black hover:bg-gray-100 text-base font-medium h-9 rounded-md"
            >
              {formatDateRange()}
              <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="p-0 bg-white rounded-lg shadow-lg border">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="h-9 w-9 rounded-full text-gray-700 hover:bg-gray-100 hover:text-black transition-all flex-none"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
}
