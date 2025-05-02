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
import { ArrowDown, ArrowUp, Search, Filter, Calendar, Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

export function PurchaseTable() {
  const { purchases, tableStyle, companyName } = useApp();
  const [filteredPurchases, setFilteredPurchases] = useState<FishPurchase[]>(purchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof FishPurchase>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [groupedPurchases, setGroupedPurchases] = useState<Record<string, FishPurchase[]>>({});
  
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
    
    // Group purchases by company and date
    const grouped: Record<string, FishPurchase[]> = {};
    filtered.forEach(purchase => {
      const key = `${purchase.companyName || 'Unknown'}-${purchase.purchaseDate}-${purchase.buyerName || 'Unknown'}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(purchase);
    });
    setGroupedPurchases(grouped);
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
    return format(new Date(dateString), 'MM/dd/yyyy');
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as DateFilter);
  };

  // Calculate grand total for a group of purchases
  const calculateGroupTotal = (purchases: FishPurchase[]) => {
    return purchases.reduce((total, purchase) => total + purchase.totalPrice, 0);
  };

  // Get table class based on style
  const getTableClass = () => {
    switch (tableStyle) {
      case "striped":
        return "excel-table striped-table border-collapse";
      case "bordered":
        return "excel-table bordered-table border-collapse";
      case "compact":
        return "excel-table compact-table border-collapse";
      case "modern":
        return "excel-table modern-table border-collapse";
      case "excel":
        return "excel-table excel-style border-collapse";
      default:
        return "excel-table excel-style border-collapse";
    }
  };

  return (
    <div className="fishledger-table-container space-y-8">
      {/* Search and Filter Controls */}
      <div className="p-4 border rounded-lg bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
      
      {/* Purchase Tables by Group */}
      {Object.entries(groupedPurchases).length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border">
          {searchQuery || dateFilter !== "all" ? "No matching purchases found." : "No purchase records yet."}
        </div>
      ) : (
        Object.entries(groupedPurchases).map(([groupKey, groupPurchases], index) => {
          const [companyName, purchaseDate, buyerName] = groupKey.split('-');
          return (
            <div key={groupKey} className="overflow-hidden border rounded-lg bg-white">
              {/* Company Header */}
              <div className="border-b bg-blue-50 text-center p-3">
                <h3 className="font-bold text-blue-800 text-xl">{companyName}</h3>
              </div>
              
              {/* Date and Buyer */}
              <div className="border-b p-3 flex justify-between items-center">
                <span>Date: {formatDate(groupPurchases[0].purchaseDate)}</span>
                <span>Buyer: {buyerName}</span>
              </div>
              
              {/* Excel-like Table */}
              <div className="overflow-x-auto">
                <Table className={getTableClass()}>
                  <TableHeader>
                    <TableRow className="bg-gray-100 border-b border-gray-300">
                      <TableHead className="font-bold border-x border-gray-300 text-left">Fish Name</TableHead>
                      <TableHead className="font-bold border-x border-gray-300 text-center">Size (KG)</TableHead>
                      <TableHead className="font-bold border-x border-gray-300 text-center">Quantity</TableHead>
                      <TableHead className="font-bold border-x border-gray-300 text-right">Price/Unit</TableHead>
                      <TableHead className="font-bold border-x border-gray-300 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-b border-gray-300">
                        <TableCell className="font-medium border-x border-gray-300 text-left">{purchase.fishName}</TableCell>
                        <TableCell className="border-x border-gray-300 text-center">{purchase.sizeKg.toFixed(1)}</TableCell>
                        <TableCell className="border-x border-gray-300 text-center">{purchase.quantity}</TableCell>
                        <TableCell className="border-x border-gray-300 text-right">${purchase.pricePerUnit.toFixed(2)}</TableCell>
                        <TableCell className="border-x border-gray-300 text-right">${purchase.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={4} className="border-x border-gray-300 text-right">Grand Total:</TableCell>
                      <TableCell className="border-x border-gray-300 text-right">${calculateGroupTotal(groupPurchases).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          );
        })
      )}
      
      {filteredPurchases.length > 0 && (
        <div className="p-4 bg-white rounded-lg border flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPurchases.length} of {purchases.length} purchases
          </div>
        </div>
      )}
    </div>
  );
}
