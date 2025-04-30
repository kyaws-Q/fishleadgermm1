
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { FishPurchase, SortDirection } from "@/types";
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
import { ArrowDown, ArrowUp, Search } from "lucide-react";

export function PurchaseTable() {
  const { purchases } = useApp();
  const [filteredPurchases, setFilteredPurchases] = useState<FishPurchase[]>(purchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof FishPurchase>("purchaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Update filtered purchases when purchases change or search query changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === "") {
      setFilteredPurchases([...purchases]);
    } else {
      const filtered = purchases.filter((purchase) =>
        purchase.fishName.toLowerCase().includes(query) ||
        purchase.id.toLowerCase().includes(query)
      );
      setFilteredPurchases(filtered);
    }
  };

  // Handle sort
  const handleSort = (field: keyof FishPurchase) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = [...filteredPurchases].sort((a, b) => {
      if (field === "purchaseDate") {
        return newDirection === "asc"
          ? new Date(a[field] as string).getTime() - new Date(b[field] as string).getTime()
          : new Date(b[field] as string).getTime() - new Date(a[field] as string).getTime();
      }
      
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return newDirection === "asc"
          ? (a[field] as string).localeCompare(b[field] as string)
          : (b[field] as string).localeCompare(a[field] as string);
      }
      
      return newDirection === "asc"
        ? (a[field] as number) - (b[field] as number)
        : (b[field] as number) - (a[field] as number);
    });
    
    setFilteredPurchases(sorted);
  };

  // Format the date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fishledger-table-container">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold text-lg">Recent Purchases</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fish..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="text-center py-8">
                  {searchQuery ? "No matching purchases found." : "No purchase records yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.slice(0, 10).map((purchase) => (
                <TableRow key={purchase.id}>
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
      {filteredPurchases.length > 10 && (
        <div className="p-4 border-t text-center">
          <Button variant="outline" size="sm">
            View All Purchases
          </Button>
        </div>
      )}
    </div>
  );
}
