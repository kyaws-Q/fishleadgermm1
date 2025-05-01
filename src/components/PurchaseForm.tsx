
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Purchases</DialogTitle>
          <DialogDescription>
            Enter company and buyer information once, then add multiple fish entries.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6 pb-4">
              {/* Company and Buyer Information Card */}
              <Card className="border-2 border-blue-100">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="grid gap-2 md:col-span-2">
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
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Fish Entries</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addNewEntry}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Another Fish
                </Button>
              </div>
              
              {/* Fish Entries */}
              <div className="space-y-4">
                {fishEntries.map((entry, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Entry #{index + 1}</h4>
                        {fishEntries.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(index)}
                            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2 md:col-span-2">
                          <Label htmlFor={`fishName-${index}`}>Fish Name</Label>
                          <Input
                            id={`fishName-${index}`}
                            value={entry.fishName}
                            onChange={(e) => handleEntryChange(index, 'fishName', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor={`sizeKg-${index}`}>Size (KG)</Label>
                          <Input
                            id={`sizeKg-${index}`}
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={entry.sizeKg || ""}
                            onChange={(e) => handleEntryChange(index, 'sizeKg', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={entry.quantity}
                            onChange={(e) => handleEntryChange(index, 'quantity', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor={`pricePerUnit-${index}`}>Price Per Unit</Label>
                          <Input
                            id={`pricePerUnit-${index}`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={entry.pricePerUnit || ""}
                            onChange={(e) => handleEntryChange(index, 'pricePerUnit', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Total for this fish</Label>
                          <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                            ${calculateTotalForEntry(entry).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Grand Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Grand Total:</span>
                  <span className="text-xl font-bold">${calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-6">
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
