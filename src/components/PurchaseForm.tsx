
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FishEntry } from "@/types";
import { Plus, Trash, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
}

export function PurchaseForm({ open, onClose }: PurchaseFormProps) {
  const { addMultiplePurchases } = useApp();
  const [companyName, setCompanyName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [fishEntries, setFishEntries] = useState<FishEntry[]>([{
    fishName: "",
    sizeKg: 0,
    quantity: 1,
    pricePerUnit: 0
  }]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerName(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPurchaseDate(e.target.value);
  };

  const handleEntryChange = (index: number, field: keyof FishEntry, value: string | number) => {
    const updatedEntries = [...fishEntries];
    if (field === 'fishName') {
      updatedEntries[index][field] = value as string;
    } else {
      updatedEntries[index][field] = Number(value);
    }
    setFishEntries(updatedEntries);
  };

  const addNewEntry = () => {
    setFishEntries([...fishEntries, {
      fishName: "",
      sizeKg: 0,
      quantity: 1,
      pricePerUnit: 0
    }]);
  };

  const removeEntry = (index: number) => {
    if (fishEntries.length > 1) {
      const updatedEntries = [...fishEntries];
      updatedEntries.splice(index, 1);
      setFishEntries(updatedEntries);
    }
  };

  const calculateTotalForEntry = (entry: FishEntry) => {
    return entry.sizeKg * entry.quantity * entry.pricePerUnit;
  };

  const calculateGrandTotal = () => {
    return fishEntries.reduce((total, entry) => total + calculateTotalForEntry(entry), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entries
    const validEntries = fishEntries.filter(entry => 
      entry.fishName && entry.sizeKg > 0 && entry.quantity > 0 && entry.pricePerUnit > 0
    );
    
    if (validEntries.length === 0) {
      alert("Please add at least one valid fish entry");
      return;
    }
    
    addMultiplePurchases(companyName, buyerName, purchaseDate, validEntries);
    onClose();
    
    // Reset form
    setCompanyName("");
    setBuyerName("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setFishEntries([{
      fishName: "",
      sizeKg: 0,
      quantity: 1,
      pricePerUnit: 0
    }]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Add New Purchases</DialogTitle>
          <DialogDescription>
            Enter company and buyer information once, then add multiple fish entries.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 pt-2 space-y-6">
              {/* Company Header Section */}
              <Card className="border-2 border-blue-100 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 p-4 text-center">
                  <h3 className="font-bold text-blue-800">Company Information</h3>
                </div>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={companyName}
                      onChange={handleCompanyChange}
                      required
                      className="border-blue-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="buyerName">Buyer Name</Label>
                    <Input
                      id="buyerName"
                      name="buyerName"
                      value={buyerName}
                      onChange={handleBuyerChange}
                      required
                      className="border-blue-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      name="purchaseDate"
                      type="date"
                      value={purchaseDate}
                      onChange={handleDateChange}
                      required
                      className="border-blue-200"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Fish Entries Table */}
              <Card className="border-2 border-blue-100 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex justify-between items-center">
                  <h3 className="font-bold text-blue-800">Fish Entries</h3>
                  <Button 
                    type="button" 
                    onClick={addNewEntry}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Fish
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="excel-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Fish Name</TableHead>
                          <TableHead>Size (KG)</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price/Unit</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fishEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <Input
                                value={entry.fishName}
                                onChange={(e) => handleEntryChange(index, 'fishName', e.target.value)}
                                required
                                placeholder="Fish name"
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={entry.sizeKg || ""}
                                onChange={(e) => handleEntryChange(index, 'sizeKg', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={entry.quantity}
                                onChange={(e) => handleEntryChange(index, 'quantity', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={entry.pricePerUnit || ""}
                                onChange={(e) => handleEntryChange(index, 'pricePerUnit', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              ${calculateTotalForEntry(entry).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {fishEntries.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEntry(index)}
                                  className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-blue-50 font-bold">
                          <TableCell colSpan={5} className="text-right">
                            Grand Total:
                          </TableCell>
                          <TableCell colSpan={2}>
                            ${calculateGrandTotal().toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-6 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add All Purchases</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
