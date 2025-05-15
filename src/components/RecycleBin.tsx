import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, RotateCcw, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { formatDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

export function RecycleBin() {
  const { deletedPurchases, fetchDeletedPurchases, recoverPurchaseGroup } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [groupedDeletedPurchases, setGroupedDeletedPurchases] = useState<Record<string, any>>({});

  // Batch selection state
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Load deleted purchases when component mounts
  useEffect(() => {
    loadDeletedPurchases();
  }, []);

  // Group deleted purchases by company, date, and buyer
  useEffect(() => {
    if (!deletedPurchases?.length) return;

    const grouped = deletedPurchases.reduce((acc: Record<string, any[]>, purchase) => {
      const key = `${purchase.companyName}-${purchase.purchaseDate}-${purchase.buyerName}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(purchase);
      return acc;
    }, {});

    setGroupedDeletedPurchases(grouped);
  }, [deletedPurchases]);

  const loadDeletedPurchases = async () => {
    setIsLoading(true);
    try {
      await fetchDeletedPurchases?.();
    } catch (error) {
      console.error('Error loading deleted purchases', error);
      toast.error('Failed to load deleted items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle select all groups
  const handleSelectAllGroups = () => {
    if (selectAll) {
      // If already all selected, deselect all
      setSelectedGroups([]);
      setSelectAll(false);
    } else {
      // Select all groups
      const allGroupKeys = Object.keys(groupedDeletedPurchases);
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
    const allGroupKeys = Object.keys(groupedDeletedPurchases);
    const allSelected = allGroupKeys.length > 0 &&
      allGroupKeys.every(key =>
        isSelected
          ? [...selectedGroups, groupKey].includes(key)
          : selectedGroups.filter(k => k !== groupKey).includes(key)
      );

    setSelectAll(allSelected);
  };

  // Recover a single group - simplified for reliability
  const handleRecover = (groupKey: string) => {
    console.log("RecycleBin: Starting recovery for group:", groupKey);

    // Show loading toast
    const loadingToastId = toast.loading(`Recovering items...`);

    // Validate that we have the recovery function
    if (!recoverPurchaseGroup) {
      console.error("Recovery function is not available");
      toast.dismiss(loadingToastId);
      toast.error('Recovery function not available');
      return;
    }

    console.log("RecycleBin: Calling recoverPurchaseGroup function");

    // Call the recover function directly - no await, use promise chain for better reliability
    recoverPurchaseGroup(groupKey)
      .then((count) => {
        console.log(`RecycleBin: Recovery function completed successfully, recovered ${count} items`);

        // Remove from selected groups if it was selected
        setSelectedGroups(prev => prev.filter(key => key !== groupKey));

        // Dismiss the loading toast
        toast.dismiss(loadingToastId);

        // No need to reload deleted purchases - the AppContext already updated the state
      })
      .catch(error => {
        console.error('Error recovering purchases:', error);

        // Dismiss the loading toast
        toast.dismiss(loadingToastId);

        // Show error toast
        toast.error('Failed to recover items');
      });
  };

  // Recover all selected groups - simplified for reliability
  const handleBatchRecover = () => {
    console.log("RecycleBin: Starting batch recovery for", selectedGroups.length, "groups");

    if (selectedGroups.length === 0) {
      toast.error('No items selected');
      return;
    }

    // Validate that we have the recovery function
    if (!recoverPurchaseGroup) {
      console.error("Recovery function is not available");
      toast.error('Recovery function not available');
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading(`Recovering ${selectedGroups.length} items...`);

    // Make a copy of the selected groups to work with
    const groupsToRecover = [...selectedGroups];
    let successCount = 0;
    let errorCount = 0;

    // Clear selections immediately for better UX
    setSelectedGroups([]);
    setSelectAll(false);

    // Process groups sequentially using promises
    const processNextGroup = (index) => {
      if (index >= groupsToRecover.length) {
        // All groups processed
        toast.dismiss(loadingToastId);

        // Show appropriate success/error message
        if (successCount > 0 && errorCount === 0) {
          toast.success(`Successfully recovered ${successCount} items`);
        } else if (successCount > 0 && errorCount > 0) {
          toast.success(`Recovered ${successCount} items with ${errorCount} errors`);
        } else {
          toast.error('Failed to recover any items');
        }

        console.log(`RecycleBin: Batch recovery completed. Success: ${successCount}, Errors: ${errorCount}`);
        return;
      }

      const groupKey = groupsToRecover[index];
      console.log(`RecycleBin: Processing group ${index + 1}/${groupsToRecover.length}: ${groupKey}`);

      recoverPurchaseGroup(groupKey)
        .then((count) => {
          console.log(`RecycleBin: Successfully recovered group ${groupKey} with ${count} items`);
          successCount++;
        })
        .catch(error => {
          console.error(`Error recovering group ${groupKey}:`, error);
          errorCount++;
        })
        .finally(() => {
          // Process the next group regardless of success/failure
          processNextGroup(index + 1);
        });
    };

    // Start processing the first group
    processNextGroup(0);
  };

  const calculateGroupTotal = (purchases: any[]) => {
    return purchases.reduce((total, purchase) => total + purchase.totalPrice, 0);
  };

  const formatDeletedTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recycle Bin</CardTitle>
            <CardDescription>
              Recently deleted purchase records that can be recovered
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedGroups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                onClick={handleBatchRecover}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recover Selected ({selectedGroups.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadDeletedPurchases}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {deletedPurchases?.length > 0 && (
          <div className="flex items-center mt-4">
            <Checkbox
              id="select-all-deleted"
              checked={selectAll}
              onCheckedChange={handleSelectAllGroups}
              className="mr-2"
            />
            <label htmlFor="select-all-deleted" className="text-sm font-medium cursor-pointer">
              Select All
            </label>

            {selectedGroups.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setSelectedGroups([]);
                  setSelectAll(false);
                }}
              >
                Clear Selection
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!deletedPurchases?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Recycle bin is empty</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {Object.entries(groupedDeletedPurchases).map(([groupKey, purchases], index) => {
              const [companyName, purchaseDate, buyerName] = groupKey.split('-');
              const deleteDate = purchases[0]?.deletedAt;

              return (
                <div key={groupKey} className="border rounded-lg overflow-hidden">
                  <div className="bg-red-50 border-b p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-1">
                      <div className="flex items-center">
                        <Checkbox
                          id={`deleted-group-${groupKey}`}
                          checked={selectedGroups.includes(groupKey)}
                          onCheckedChange={(checked) => handleSelectGroup(groupKey, checked === true)}
                          className="mr-2"
                        />
                        <h3 className="font-semibold text-lg">{companyName}</h3>
                      </div>
                      <Badge variant="destructive" className="md:ml-auto md:mb-0 mb-2 w-fit">
                        Deleted {formatDeletedTime(deleteDate)}
                      </Badge>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center text-sm text-muted-foreground">
                      <span className="mr-4">Date: {formatDate(purchaseDate)}</span>
                      <span>Buyer: {buyerName}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fish Type</TableHead>
                          <TableHead className="text-right">Size (kg)</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell>{purchase.fishName}</TableCell>
                            <TableCell className="text-right">{purchase.sizeKg}</TableCell>
                            <TableCell className="text-right">{purchase.quantity}</TableCell>
                            <TableCell className="text-right">${purchase.pricePerUnit.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${purchase.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={4} className="text-right font-medium">Total:</TableCell>
                          <TableCell className="text-right font-bold">${calculateGroupTotal(purchases).toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-4 bg-muted/30 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecover(groupKey)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Recover
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}