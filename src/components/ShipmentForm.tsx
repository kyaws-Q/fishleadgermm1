
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FishEntry } from "@/types/shipment";
import { Plus, Trash, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
}

export function ShipmentForm({ open, onClose }: ShipmentFormProps) {
  const { companyName } = useApp();
  
  // Form state
  const [buyerName, setBuyerName] = useState("");
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [vesselName, setVesselName] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  
  // Fish entries
  const [fishEntries, setFishEntries] = useState<{
    fishName: string;
    size: string;
    netKgPerMc: number;
    qtyMc: number;
    qtyKgs: number;
    pricePerKg: number;
    totalUsd: number;
  }[]>([{
    fishName: "",
    size: "",
    netKgPerMc: 20,
    qtyMc: 1,
    qtyKgs: 20,
    pricePerKg: 0,
    totalUsd: 0
  }]);
  
  // Common fish names for select
  const commonFishNames = [
    "ROHU-G", 
    "CATLA-G", 
    "MRIGAL-G", 
    "TILAPIA-W", 
    "PANGASIUS"
  ];
  
  // Common sizes
  const commonSizes = [
    "1 UP",
    "1.5 UP",
    "2 UP",
    "3 UP",
    "4 UP",
    "5 UP"
  ];

  // Handle form input changes
  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerName(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipmentDate(e.target.value);
  };

  const handleVesselChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVesselName(e.target.value);
  };

  const handleContainerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContainerNumber(e.target.value);
  };

  // Handle entry changes
  const handleEntryChange = (index: number, field: string, value: string | number) => {
    const updatedEntries = [...fishEntries];
    
    if (field === 'fishName' || field === 'size') {
      updatedEntries[index][field] = value as string;
    } else {
      updatedEntries[index][field] = Number(value);
    }
    
    // Auto-calculate quantity in KGs
    if (field === 'netKgPerMc' || field === 'qtyMc') {
      updatedEntries[index].qtyKgs = 
        updatedEntries[index].netKgPerMc * updatedEntries[index].qtyMc;
    }
    
    // Auto-calculate total USD
    if (field === 'qtyKgs' || field === 'pricePerKg' || field === 'netKgPerMc' || field === 'qtyMc') {
      updatedEntries[index].totalUsd = 
        updatedEntries[index].qtyKgs * updatedEntries[index].pricePerKg;
    }
    
    setFishEntries(updatedEntries);
  };

  const addNewEntry = () => {
    setFishEntries([...fishEntries, {
      fishName: "",
      size: "",
      netKgPerMc: 20,
      qtyMc: 1,
      qtyKgs: 20,
      pricePerKg: 0,
      totalUsd: 0
    }]);
  };

  const removeEntry = (index: number) => {
    if (fishEntries.length > 1) {
      const updatedEntries = [...fishEntries];
      updatedEntries.splice(index, 1);
      setFishEntries(updatedEntries);
    }
  };

  const calculateGrandTotal = () => {
    return fishEntries.reduce((total, entry) => total + entry.totalUsd, 0);
  };

  // Group entries by fish name for preview
  const getGroupedEntries = () => {
    const grouped: { [fishName: string]: typeof fishEntries } = {};
    
    fishEntries.forEach(entry => {
      if (entry.fishName) {
        if (!grouped[entry.fishName]) {
          grouped[entry.fishName] = [];
        }
        grouped[entry.fishName].push(entry);
      }
    });
    
    return grouped;
  };

  // Calculate subtotal for a fish group
  const calculateSubtotal = (entries: typeof fishEntries) => {
    return entries.reduce((total, entry) => total + entry.totalUsd, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entries
    const validEntries = fishEntries.filter(entry => 
      entry.fishName && entry.size && entry.netKgPerMc > 0 && 
      entry.qtyMc > 0 && entry.qtyKgs > 0 && entry.pricePerKg > 0
    );
    
    if (validEntries.length === 0) {
      alert("Please add at least one valid fish entry");
      return;
    }
    
    // Here we would save the shipment data
    console.log({
      buyerName,
      shipmentDate,
      vesselName,
      containerNumber,
      fishEntries: validEntries,
      totalValue: calculateGrandTotal()
    });
    
    // For now, just close the form 
    onClose();
    
    // Reset form
    setBuyerName("");
    setShipmentDate(new Date().toISOString().split("T")[0]);
    setVesselName("");
    setContainerNumber("");
    setFishEntries([{
      fishName: "",
      size: "",
      netKgPerMc: 20,
      qtyMc: 1,
      qtyKgs: 20,
      pricePerKg: 0,
      totalUsd: 0
    }]);
  };

  const groupedEntries = getGroupedEntries();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Create New Shipment</DialogTitle>
          <DialogDescription>
            Enter shipment details and add fish entries.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 pt-2 space-y-6">
              {/* Shipment Header Section */}
              <Card className="border-2 border-blue-100 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 p-4 text-center">
                  <h3 className="font-bold text-blue-800">Shipment Information</h3>
                </div>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="shipmentDate">Shipment Date</Label>
                    <Input
                      id="shipmentDate"
                      name="shipmentDate"
                      type="date"
                      value={shipmentDate}
                      onChange={handleDateChange}
                      required
                      className="border-blue-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vesselName">Vessel Name</Label>
                    <Input
                      id="vesselName"
                      name="vesselName"
                      value={vesselName}
                      onChange={handleVesselChange}
                      className="border-blue-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="containerNumber">Container Number</Label>
                    <Input
                      id="containerNumber"
                      name="containerNumber"
                      value={containerNumber}
                      onChange={handleContainerChange}
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
                    <Plus className="h-4 w-4 mr-1" /> Add Entry
                  </Button>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="excel-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fish Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Net KG/MC</TableHead>
                          <TableHead>QTY MC</TableHead>
                          <TableHead>QTY KGS</TableHead>
                          <TableHead>Price/KG</TableHead>
                          <TableHead>Total USD</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fishEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={entry.fishName}
                                onValueChange={(value) => handleEntryChange(index, 'fishName', value)}
                              >
                                <SelectTrigger className="w-full border-gray-200">
                                  <SelectValue placeholder="Select fish" />
                                </SelectTrigger>
                                <SelectContent>
                                  {commonFishNames.map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={entry.size}
                                onValueChange={(value) => handleEntryChange(index, 'size', value)}
                              >
                                <SelectTrigger className="w-full border-gray-200">
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {commonSizes.map(size => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={entry.netKgPerMc || ""}
                                onChange={(e) => handleEntryChange(index, 'netKgPerMc', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={entry.qtyMc}
                                onChange={(e) => handleEntryChange(index, 'qtyMc', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={entry.qtyKgs || ""}
                                onChange={(e) => handleEntryChange(index, 'qtyKgs', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={entry.pricePerKg || ""}
                                onChange={(e) => handleEntryChange(index, 'pricePerKg', e.target.value)}
                                required
                                className="border-gray-200"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              ${entry.totalUsd.toFixed(2)}
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
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Preview Section */}
              {Object.keys(groupedEntries).length > 0 && (
                <Card className="border-2 border-blue-100 overflow-hidden">
                  <div className="bg-blue-50 border-b border-blue-100 p-4 text-center">
                    <h3 className="font-bold text-blue-800">Preview Invoice</h3>
                  </div>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table className="excel-style">
                        <TableHeader>
                          <TableRow className="border-b-2 border-gray-300">
                            <TableHead colSpan={8} className="text-center py-4 text-lg font-bold">
                              {companyName || "Company Name"}
                            </TableHead>
                          </TableRow>
                          <TableRow className="border-b-2 border-gray-300">
                            <TableHead colSpan={4} className="text-left">
                              Date: {new Date(shipmentDate).toLocaleDateString()}
                            </TableHead>
                            <TableHead colSpan={4} className="text-right">
                              Buyer: {buyerName || "Not Specified"}
                            </TableHead>
                          </TableRow>
                          <TableRow>
                            <TableHead className="border">NO.</TableHead>
                            <TableHead className="border">ITEM</TableHead>
                            <TableHead className="border">DESCRIPTION</TableHead>
                            <TableHead className="border">NET KG/MC</TableHead>
                            <TableHead className="border">QTY MC</TableHead>
                            <TableHead className="border">QTY KGS</TableHead>
                            <TableHead className="border">PRICE (KG)</TableHead>
                            <TableHead className="border">TOTAL USD AMOUNT</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(groupedEntries).map(([fishName, entries], groupIndex) => (
                            <>
                              {entries.map((entry, entryIndex) => (
                                <TableRow key={`${groupIndex}-${entryIndex}`} className="border-b border-gray-200">
                                  <TableCell className="border">{groupIndex + 1}.{entryIndex + 1}</TableCell>
                                  <TableCell className="border">{entry.fishName}</TableCell>
                                  <TableCell className="border">{entry.size}</TableCell>
                                  <TableCell className="border text-center">{entry.netKgPerMc}</TableCell>
                                  <TableCell className="border text-center">{entry.qtyMc}</TableCell>
                                  <TableCell className="border text-right">{entry.qtyKgs.toFixed(2)}</TableCell>
                                  <TableCell className="border text-right">${entry.pricePerKg.toFixed(2)}</TableCell>
                                  <TableCell className="border text-right">${entry.totalUsd.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-gray-100 font-bold">
                                <TableCell colSpan={6} className="border text-right">
                                  Subtotal for {fishName}:
                                </TableCell>
                                <TableCell colSpan={2} className="border text-right">
                                  ${calculateSubtotal(entries).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </>
                          ))}
                          <TableRow className="bg-blue-50 font-bold text-lg">
                            <TableCell colSpan={6} className="border text-right">
                              Grand Total:
                            </TableCell>
                            <TableCell colSpan={2} className="border text-right">
                              ${calculateGrandTotal().toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-6 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Shipment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
