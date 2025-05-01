
import { useState, useEffect } from "react";
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
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Search, SlidersHorizontal, Calendar, Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

export function PurchaseTable() {
  const { purchases, tableStyle, companyName } = useApp();
  const [filteredPurchases, setFilteredPurchases] = useState<FishPurchase[]>(purchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof FishPurchase>("purchaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Update filtered purchases when purchases change
  useEffect(() => {
    applyFilters();
  }, [purchases, searchQuery, dateFilter, startDate, endDate, sortField, sortDirection]);
  
  // Apply all filters and sorting
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
        return (
          (isAfter(purchaseDate, startDate) || isEqual(purchaseDate, startDate)) && 
          (isBefore(purchaseDate, endDate) || isEqual(purchaseDate, endDate))
        );
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
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as DateFilter);
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    return filteredPurchases.reduce((total, purchase) => total + purchase.totalPrice, 0);
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
      case "excel":
        return "grid-table excel-table";
      default:
        return "grid-table";
    }
  };

  return (
    <div className="fishledger-table-container">
      {/* Table Header with Company Name */}
      <div className="bg-blue-50 p-4 border-b border-blue-200 flex flex-col items-center">
        <h2 className="text-xl font-bold text-blue-800">{companyName}</h2>
        <p className="text-sm text-blue-600">Purchase Records</p>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <Select
            value={dateFilter}
            onValueChange={handleDateFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Filter" />
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
          
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <DatePicker 
                date={startDate}
                onSelect={setStartDate}
              />
              <span>to</span>
              <DatePicker 
                date={endDate}
                onSelect={setEndDate}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Excel-like Table */}
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
                className="cursor-pointer text-right"
                onClick={() => handleSort("sizeKg")}
              >
                Size (KG) {sortField === "sizeKg" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("quantity")}
              >
                Quantity {sortField === "quantity" && (
                  sortDirection === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort("pricePerUnit")}
              >
                Price/Unit {sortField === "pricePerUnit" && (
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
                  <TableCell className="text-right">{purchase.sizeKg.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{purchase.quantity}</TableCell>
                  <TableCell className="text-right">${purchase.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell className="text-right font-medium">${purchase.totalPrice?.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="text-right font-bold">Grand Total:</TableCell>
              <TableCell className="text-right font-bold">${calculateGrandTotal().toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      
      {filteredPurchases.length > 0 && (
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPurchases.length} of {purchases.length} purchases
          </div>
        </div>
      )}
    </div>
  );
}
