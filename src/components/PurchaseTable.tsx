
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { FishPurchase, SortDirection, DateFilter } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Search, SlidersHorizontal, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

export function PurchaseTable() {
  const { purchases, tableStyle } = useApp();
  const [filteredPurchases, setFilteredPurchases] = useState<FishPurchase[]>(purchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof FishPurchase>("purchaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Update filtered purchases when purchases change or filters change
  const applyFilters = () => {
    let filtered = [...purchases];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((purchase) =>
        purchase.fishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (purchase.companyName && purchase.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (purchase.buyerName && purchase.buyerName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply date filter
    filtered = filterByDate(filtered, dateFilter);
    
    // Apply custom date range if selected
    if (dateFilter === "custom" && startDate && endDate) {
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate >= startDate && purchaseDate <= endDate;
      });
    }
    
    // Apply sort
    filtered = sortPurchases(filtered, sortField, sortDirection);
    
    setFilteredPurchases(filtered);
  };

  // Filter by date helper function
  const filterByDate = (data: FishPurchase[], filter: DateFilter): FishPurchase[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastMonthStart = new Date(today);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    const last3MonthsStart = new Date(today);
    last3MonthsStart.setMonth(last3MonthsStart.getMonth() - 3);
    
    const lastYearStart = new Date(today);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
    
    switch (filter) {
      case "today":
        return data.filter(purchase => {
          const date = new Date(purchase.purchaseDate);
          return date.toDateString() === today.toDateString();
        });
      case "yesterday":
        return data.filter(purchase => {
          const date = new Date(purchase.purchaseDate);
          return date.toDateString() === yesterday.toDateString();
        });
      case "week":
        return data.filter(purchase => {
          const date = new Date(purchase.purchaseDate);
          return date >= lastWeekStart;
        });
      case "month":
        return data.filter(purchase => {
          const date = new Date(purchase.purchaseDate);
          return date >= lastMonthStart;
        });
      case "3months":
        return data.filter(purchase => {
          const date = new Date(purchase.purchaseDate);
          return date >= last3MonthsStart;
        });
      case "year":
        return data.filter(purchase => {
          const date = new Date(purchase.purchaseDate);
          return date >= lastYearStart;
        });
      case "custom":
        // This is handled separately
        return data;
      case "all":
      default:
        return data;
    }
  };

  // Handle sort
  const handleSort = (field: keyof FishPurchase) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = sortPurchases(filteredPurchases, field, newDirection);
    setFilteredPurchases(sorted);
  };
  
  // Sort purchases helper function
  const sortPurchases = (data: FishPurchase[], field: keyof FishPurchase, direction: SortDirection): FishPurchase[] => {
    return [...data].sort((a, b) => {
      if (field === "purchaseDate") {
        return direction === "asc"
          ? new Date(a[field] as string).getTime() - new Date(b[field] as string).getTime()
          : new Date(b[field] as string).getTime() - new Date(a[field] as string).getTime();
      }
      
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return direction === "asc"
          ? (a[field] as string).localeCompare(b[field] as string)
          : (b[field] as string).localeCompare(a[field] as string);
      }
      
      return direction === "asc"
        ? Number(a[field] ?? 0) - Number(b[field] ?? 0)
        : Number(b[field] ?? 0) - Number(a[field] ?? 0);
    });
  };

  // Format the date
  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Update filtered purchases when any filter changes
  useState(() => {
    applyFilters();
  });

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    applyFilters();
  };
  
  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as DateFilter);
    applyFilters();
  };

  // Get table class based on style
  const getTableClass = () => {
    switch (tableStyle) {
      case "striped":
        return "grid-table striped-table";
      case "bordered":
        return "grid-table bordered-table";
      case "compact":
        return "grid-table compact-table";
      case "modern":
        return "grid-table modern-table";
      default:
        return "grid-table";
    }
  };

  return (
    <div className="fishledger-table-container">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold text-lg">Purchase History</h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Options</h4>
                <div className="space-y-2">
                  <Label htmlFor="dateFilter">Date Range</Label>
                  <Select
                    value={dateFilter}
                    onValueChange={handleDateFilterChange}
                  >
                    <SelectTrigger id="dateFilter">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {dateFilter === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <DatePicker 
                        date={startDate} 
                        onSelect={setStartDate} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <DatePicker 
                        date={endDate} 
                        onSelect={setEndDate}
                      />
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={applyFilters} 
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table className={getTableClass()}>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("companyName")}
              >
                Company {sortField === "companyName" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("buyerName")}
              >
                Buyer {sortField === "buyerName" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("fishName")}
              >
                Fish Name {sortField === "fishName" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("sizeKg")}
              >
                Size (KG) {sortField === "sizeKg" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("quantity")}
              >
                Quantity {sortField === "quantity" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("pricePerUnit")}
              >
                Price Per Unit {sortField === "pricePerUnit" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("purchaseDate")}
              >
                Purchase Date {sortField === "purchaseDate" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("totalPrice")}
              >
                Total Price {sortField === "totalPrice" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {searchQuery || dateFilter !== "all" ? "No matching purchases found." : "No purchase records yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.companyName || "-"}</TableCell>
                  <TableCell>{purchase.buyerName || "-"}</TableCell>
                  <TableCell className="font-medium">{purchase.fishName}</TableCell>
                  <TableCell>{purchase.sizeKg.toFixed(1)}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell>${purchase.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell className="text-right">${purchase.totalPrice?.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredPurchases.length > 0 && (
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPurchases.length} of {purchases.length} purchases
          </div>
          <Button variant="outline" size="sm">
            View All Purchases
          </Button>
        </div>
      )}
    </div>
  );
}
