import { useState, useEffect, useCallback } from "react";
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
import {
  ArrowDown, ArrowUp, Search, Filter, Calendar, Download,
  CheckCircle, XCircle, Clock, Trash2, CheckSquare, Square,
  AlertCircle
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export function PurchaseTable() {
  const { purchases, tableStyle, companyName, updatePurchasePaymentStatus, deletePurchase, deletePurchaseGroup } = useApp();
  const [filteredPurchases, setFilteredPurchases] = useState<FishPurchase[]>(purchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof FishPurchase>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [groupedPurchases, setGroupedPurchases] = useState<Record<string, FishPurchase[]>>({});

  // Batch selection state
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);



  // Filter by date helper function
  const filterByDate = useCallback((data: FishPurchase[], filter: DateFilter): FishPurchase[] => {
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
          const date = new Date(purchase.purchaseDate || purchase.date);
          const purchaseDay = date.getDate();
          const purchaseMonth = date.getMonth();
          const purchaseYear = date.getFullYear();

          const todayDay = today.getDate();
          const todayMonth = today.getMonth();
          const todayYear = today.getFullYear();

          return purchaseDay === todayDay &&
                 purchaseMonth === todayMonth &&
                 purchaseYear === todayYear;
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
  }, []);



  // Sort purchases helper function
  const sortPurchases = useCallback((data: FishPurchase[], field: keyof FishPurchase, direction: SortDirection): FishPurchase[] => {
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
  }, []);

  // Apply all filters and sorting
  const applyFilters = useCallback(() => {
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

    // Apply payment status filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(purchase => purchase.paymentStatus === paymentFilter);
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
  }, [purchases, searchQuery, dateFilter, paymentFilter, startDate, endDate, sortField, sortDirection, filterByDate, sortPurchases]);

  // Update filtered purchases when purchases change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Now only depends on applyFilters as it captures all other dependencies

  // Reset selections when filters change
  useEffect(() => {
    setSelectedGroups([]);
    setSelectAll(false);
  }, [searchQuery, dateFilter, paymentFilter, startDate, endDate]);

  // Handle select all groups
  const handleSelectAllGroups = () => {
    if (selectAll) {
      // If already all selected, deselect all
      setSelectedGroups([]);
      setSelectAll(false);
    } else {
      // Select all groups
      const allGroupKeys = Object.keys(groupedPurchases);
      setSelectedGroups(allGroupKeys);
      setSelectAll(true);
    }
  };

  // Handle select group
  const handleSelectGroup = (groupKey: string, isSelected: boolean) => {
    if (isSelected) {
      // Add group to selected groups
      setSelectedGroups(prev => [...prev, groupKey]);
    } else {
      // Remove group from selected groups
      setSelectedGroups(prev => prev.filter(key => key !== groupKey));
    }

    // Update selectAll state
    updateSelectAllState();
  };

  // Update select all state based on current selections
  const updateSelectAllState = () => {
    const allGroupKeys = Object.keys(groupedPurchases);
    const allSelected = allGroupKeys.length > 0 &&
      allGroupKeys.every(key => selectedGroups.includes(key));

    setSelectAll(allSelected);
  };



  // Handle sort
  const handleSort = (field: keyof FishPurchase) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
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

  // This function was removed to fix duplicate declaration

  // Get payment status badge
  const getPaymentStatusBadge = (status?: 'paid' | 'unpaid' | 'pending') => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Unpaid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Not Set</Badge>;
    }
  };

  // Handle payment status change for a single purchase
  const handlePaymentStatusChange = (id: string, status: 'paid' | 'unpaid' | 'pending') => {
    if (!updatePurchasePaymentStatus) {
      console.error('updatePurchasePaymentStatus function is not available');
      toast.error('Cannot update payment status: function not available');
      return;
    }

    console.log(`Updating payment status for purchase ${id} to ${status}`);

    // Show loading toast
    const loadingToastId = toast.loading(`Updating payment status...`);

    // Manually update the purchase in the local state first for immediate UI feedback
    setFilteredPurchases(prev =>
      prev.map(p => p.id === id ? {...p, paymentStatus: status} : p)
    );

    updatePurchasePaymentStatus(id, status)
      .then(() => {
        toast.dismiss(loadingToastId);
        toast.success(`Payment status updated to ${status}`);
      })
      .catch((error) => {
        toast.dismiss(loadingToastId);
        console.error('Error updating payment status:', error);
        toast.error('Failed to update payment status');
      });
  };

  // Get payment status for a group of purchases
  const getGroupPaymentStatus = (purchases: FishPurchase[]): 'paid' | 'unpaid' | 'pending' | 'mixed' => {
    if (!purchases || purchases.length === 0) return 'unpaid';

    // Count the different statuses
    const statusCounts = {
      paid: 0,
      unpaid: 0,
      pending: 0
    };

    // Count each status
    purchases.forEach(purchase => {
      const status = purchase.paymentStatus || 'unpaid';
      statusCounts[status]++;
    });

    // If all are the same status
    if (statusCounts.paid === purchases.length) return 'paid';
    if (statusCounts.unpaid === purchases.length) return 'unpaid';
    if (statusCounts.pending === purchases.length) return 'pending';

    // If mixed, prioritize the most common status
    const maxStatus = Object.entries(statusCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as 'paid' | 'unpaid' | 'pending';

    // If there's a clear majority, use that status
    if (statusCounts[maxStatus] > purchases.length / 2) {
      return maxStatus;
    }

    return 'mixed';
  };

  // Get payment status badge for the whole group
  const getGroupPaymentStatusBadge = (purchases: FishPurchase[]) => {
    const status = getGroupPaymentStatus(purchases);

    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Unpaid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'mixed':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Mixed Status</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Not Set</Badge>;
    }
  };

  // Update payment status for all purchases in a group
  const handleGroupPaymentStatusChange = (purchases: FishPurchase[], status: 'paid' | 'unpaid' | 'pending') => {
    if (!updatePurchasePaymentStatus) {
      console.error('updatePurchasePaymentStatus function is not available');
      toast.error('Cannot update payment status: function not available');
      return;
    }

    if (!purchases || purchases.length === 0) {
      console.error('No purchases provided to update');
      toast.error('No purchases found to update');
      return;
    }

    console.log(`Updating ${purchases.length} purchases to status: ${status}`);

    // Show loading toast
    const loadingToastId = toast.loading(`Updating ${purchases.length} items...`);

    // Process updates sequentially to avoid overwhelming the system
    let successCount = 0;
    let errorCount = 0;

    // Make a copy of the purchases to update
    const purchaseQueue = [...purchases];

    // Process purchases sequentially using promises
    const processNextPurchase = (index: number) => {
      if (index >= purchaseQueue.length) {
        // All purchases processed
        toast.dismiss(loadingToastId);

        // Show appropriate success/error message
        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully updated ${successCount} items to ${status}`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.success(`Updated ${successCount} items to ${status} with ${errorCount} errors`);
        } else {
          toast.error('Failed to update any items');
        }

        console.log(`Group update completed. Success: ${successCount}, Errors: ${errorCount}`);
        return;
      }

      const purchase = purchaseQueue[index];
      console.log(`Processing purchase ${index + 1}/${purchaseQueue.length}: ${purchase.id}`);

      // Manually update the purchase in the local state first for immediate UI feedback
      setFilteredPurchases(prev =>
        prev.map(p => p.id === purchase.id ? {...p, paymentStatus: status} : p)
      );

      updatePurchasePaymentStatus(purchase.id, status)
        .then(() => {
          console.log(`Successfully updated purchase ${purchase.id}`);
          successCount++;
        })
        .catch(error => {
          console.error(`Error updating purchase ${purchase.id}:`, error);
          errorCount++;
        })
        .finally(() => {
          // Process the next purchase regardless of success/failure
          setTimeout(() => processNextPurchase(index + 1), 100);
        });
    };

    // Start processing the first purchase
    processNextPurchase(0);
  };

  // Update payment status for selected groups - improved for reliability
  const handleBatchPaymentStatusChange = (status: 'paid' | 'unpaid' | 'pending') => {
    if (!updatePurchasePaymentStatus) {
      console.error('updatePurchasePaymentStatus function is not available');
      toast.error('Cannot update payment status: function not available');
      return;
    }

    if (selectedGroups.length === 0) {
      toast.error('No groups selected');
      return;
    }

    // Find all purchases in the selected groups
    const purchasesToUpdate: FishPurchase[] = [];
    selectedGroups.forEach(groupKey => {
      const groupPurchases = groupedPurchases[groupKey] || [];
      purchasesToUpdate.push(...groupPurchases);
    });

    if (purchasesToUpdate.length === 0) {
      toast.error('No purchases found in selected groups');
      return;
    }

    console.log(`Batch updating ${purchasesToUpdate.length} purchases to status: ${status}`);

    // Show loading toast
    const loadingToastId = toast.loading(`Updating ${purchasesToUpdate.length} items...`);

    // Process updates sequentially to avoid overwhelming the system
    let successCount = 0;
    let errorCount = 0;

    // Clear selections immediately for better UX
    setSelectedGroups([]);
    setSelectAll(false);

    // Make a copy of the purchases to update
    const purchaseQueue = [...purchasesToUpdate];

    // Process purchases sequentially using promises
    const processNextPurchase = (index: number) => {
      if (index >= purchaseQueue.length) {
        // All purchases processed
        toast.dismiss(loadingToastId);

        // Show appropriate success/error message
        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully updated ${successCount} items to ${status}`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.success(`Updated ${successCount} items to ${status} with ${errorCount} errors`);
        } else {
          toast.error('Failed to update any items');
        }

        console.log(`Batch update completed. Success: ${successCount}, Errors: ${errorCount}`);
        return;
      }

      const purchase = purchaseQueue[index];
      console.log(`Processing purchase ${index + 1}/${purchaseQueue.length}: ${purchase.id}`);

      // Manually update the purchase in the local state first for immediate UI feedback
      setFilteredPurchases(prev =>
        prev.map(p => p.id === purchase.id ? {...p, paymentStatus: status} : p)
      );

      updatePurchasePaymentStatus(purchase.id, status)
        .then(() => {
          console.log(`Successfully updated purchase ${purchase.id}`);
          successCount++;
        })
        .catch(error => {
          console.error(`Error updating purchase ${purchase.id}:`, error);
          errorCount++;
        })
        .finally(() => {
          // Process the next purchase regardless of success/failure
          // Add a small delay between requests to prevent overwhelming the system
          setTimeout(() => processNextPurchase(index + 1), 100);
        });
    };

    // Start processing the first purchase
    processNextPurchase(0);
  };

  // Batch delete selected groups
  const handleBatchDelete = () => {
    if (!deletePurchaseGroup) {
      toast.error("Delete function not available");
      return;
    }

    if (selectedGroups.length === 0) {
      toast.error('No groups selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedGroups.length} invoice groups? They will be moved to the recycle bin.`)) {
      // Show loading toast
      toast.loading(`Deleting ${selectedGroups.length} invoice groups...`);

      // Create an array of promises for all deletes
      const deletePromises = selectedGroups.map(groupKey => {
        return deletePurchaseGroup(groupKey);
      });

      // Wait for all deletes to complete
      Promise.all(deletePromises)
        .then(() => {
          // Show success message when all deletes are complete
          toast.success(`All ${selectedGroups.length} invoice groups moved to recycle bin`);

          // Clear selections after successful delete
          setSelectedGroups([]);
          setSelectAll(false);
        })
        .catch((error) => {
          console.error('Error deleting purchase groups:', error);
          toast.error('Failed to delete some items');
        });
    }
  };

  // Handle deleting an individual purchase
  const handleDeletePurchase = (id: string) => {
    if (!deletePurchase) {
      toast.error("Delete function not available");
      return;
    }

    if (window.confirm(`Are you sure you want to delete this purchase? It will be moved to the recycle bin.`)) {
      toast.promise(
        deletePurchase(id),
        {
          loading: 'Deleting purchase...',
          success: 'Purchase moved to recycle bin',
          error: 'Failed to delete purchase'
        }
      );
    }
  };

  // Add this function to handle deleting a group:
  const handleDeleteGroup = (groupKey: string) => {
    // First validate if we have matching purchases
    const [companyName, purchaseDate, buyerName] = groupKey.split('-');

    // Get the purchases directly from the current group we're rendering
    // This ensures we're using the exact same purchases that are being displayed
    const groupPurchases = groupedPurchases[groupKey] || [];

    if (groupPurchases.length === 0) {
      // Fallback to searching in all purchases if not found in grouped purchases
      const matchingPurchases = purchases.filter(p =>
        p.companyName === companyName &&
        p.purchaseDate === purchaseDate &&
        p.buyerName === buyerName
      );

      if (matchingPurchases.length === 0) {
        toast.error("No matching purchases found to delete. Please try again.");
        return;
      }

      // Use the matching purchases we found
      if (window.confirm(`Are you sure you want to delete this invoice with ${matchingPurchases.length} items? It will be moved to the recycle bin.`)) {
        if (!deletePurchaseGroup) {
          toast.error("Delete function not available");
          return;
        }

        toast.promise(
          deletePurchaseGroup(groupKey),
          {
            loading: 'Deleting invoice...',
            success: 'Invoice moved to recycle bin',
            error: 'Failed to delete invoice'
          }
        );
      }
    } else {
      // Use the group purchases we already have
      if (window.confirm(`Are you sure you want to delete this invoice with ${groupPurchases.length} items? It will be moved to the recycle bin.`)) {
        if (!deletePurchaseGroup) {
          toast.error("Delete function not available");
          return;
        }

        toast.promise(
          deletePurchaseGroup(groupKey),
          {
            loading: 'Deleting invoice...',
            success: 'Invoice moved to recycle bin',
            error: 'Failed to delete invoice'
          }
        );
      }
    }
  };

  return (
    <div className="fishledger-table-container space-y-8 overflow-x-auto">
      {/* Batch Action Controls */}
      {selectedGroups.length > 0 && (
        <div className="p-4 border rounded-lg bg-blue-50 flex flex-wrap items-center gap-3">
          <div className="flex items-center mr-4">
            <span className="font-medium">{selectedGroups.length} invoice groups selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
              onClick={() => handleBatchPaymentStatusChange('paid')}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Mark as Paid
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
              onClick={() => handleBatchPaymentStatusChange('pending')}
            >
              <Clock className="h-4 w-4 mr-1" /> Mark as Pending
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
              onClick={() => handleBatchPaymentStatusChange('unpaid')}
            >
              <XCircle className="h-4 w-4 mr-1" /> Mark as Unpaid
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
            </Button>
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedGroups([]);
                setSelectAll(false);
              }}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="p-4 border rounded-lg bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex items-center mr-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAllGroups}
              className="mr-2"
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All
            </label>
          </div>
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
            name="date-filter"
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

          <Select
            value={paymentFilter}
            onValueChange={setPaymentFilter}
            name="payment-filter"
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
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
          {searchQuery || dateFilter !== "all" || paymentFilter !== "all" ? "No matching purchases found." : "No purchase records yet."}
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {Object.entries(groupedPurchases).map(([groupKey, groupPurchases], index) => {
  const [companyName, purchaseDate, buyerName] = groupKey.split('-');
  const actualBuyerName = groupPurchases[0]?.buyerName || buyerName || 'N/A';
  return (
    <div key={groupKey} className="overflow-hidden border rounded-lg bg-white mb-6">
      {/* Company Header */}
      <div className="border-b bg-blue-50 text-center p-3 flex items-center">
        <div className="ml-3 mr-2">
          <Checkbox
            id={`group-${groupKey}`}
            checked={selectedGroups.includes(groupKey)}
            onCheckedChange={(checked) => handleSelectGroup(groupKey, checked === true)}
          />
        </div>
        <h3 className="font-bold text-blue-800 text-xl">{companyName}</h3>
      </div>
      {/* Date, Buyer and Payment Status Header */}
      <div className="p-4 flex flex-col md:flex-row justify-between">
        <div className="flex items-center">
          <span className="mr-4">Date: {formatDate(groupPurchases[0].purchaseDate)}</span>
          <span className="font-bold">Buyer: {actualBuyerName}</span>
        </div>
        {/* Payment Status Dropdown for the entire group */}
        <div className="flex items-center mt-2 md:mt-0 justify-between">
          <span className="mr-2 text-sm font-medium">Payment Status:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2">
                {getGroupPaymentStatusBadge(groupPurchases)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleGroupPaymentStatusChange(groupPurchases, 'paid')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Mark All as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGroupPaymentStatusChange(groupPurchases, 'unpaid')}>
                <XCircle className="h-4 w-4 mr-2 text-red-500" /> Mark All as Unpaid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGroupPaymentStatusChange(groupPurchases, 'pending')}>
                <Clock className="h-4 w-4 mr-2 text-yellow-500" /> Mark All as Pending
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteGroup(groupKey)}
                className="text-red-600 hover:text-red-700 focus:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Excel-like Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
        <table className="min-w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="bg-blue-50 border-b border-gray-300">
              <th className="px-4 py-3 font-semibold text-blue-800 text-left border-r border-gray-300 rounded-tl-lg">Fish Name</th>
              <th className="px-4 py-3 font-semibold text-gray-800 text-center border-r border-gray-300">Size (KG)</th>
              <th className="px-4 py-3 font-semibold text-gray-800 text-center border-r border-gray-300">Quantity</th>
              <th className="px-4 py-3 font-semibold text-gray-800 text-right border-r border-gray-300">Price/Unit</th>
              <th className="px-4 py-3 font-semibold text-gray-800 text-right rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {groupPurchases.map((purchase) => (
              <tr key={purchase.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-left text-blue-700 font-semibold border-r border-gray-200">{purchase.fishName}</td>
                <td className="px-4 py-2 text-center text-gray-700 border-r border-gray-200">{Number(purchase.sizeKg).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-2 text-center text-gray-700 border-r border-gray-200">{Number(purchase.quantity).toLocaleString()}</td>
                <td className="px-4 py-2 text-right text-gray-700 border-r border-gray-200">${Number(purchase.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-2 text-right text-gray-900 font-medium">${Number(purchase.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 border-t border-gray-300">
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-800 border-r border-gray-300">Grand Total:</td>
              <td className="px-4 py-3 text-right font-extrabold text-blue-900 text-base">${Number(calculateGroupTotal(groupPurchases)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
})}
        </div>
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
