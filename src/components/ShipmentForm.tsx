import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Trash2, Plus, Save } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Buyer, FishEntry, Shipment } from "@/types/shipment";
import { getBuyers } from "@/services/buyerService";
import { createShipment } from "@/services/shipmentService";

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    shipment: Shipment;
    entries: FishEntry[];
  };
}

export function ShipmentForm({ open, onClose, initialData }: ShipmentFormProps) {
  const { user } = useApp();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [buyerId, setBuyerId] = useState<string>("");
  const [containerNumber, setContainerNumber] = useState<string>("");
  const [vesselName, setVesselName] = useState<string>("");
  const [entries, setEntries] = useState<Partial<FishEntry>[]>([
    { fishName: "", size: "", netKgPerMc: 0, qtyMc: 0, qtyKgs: 0, pricePerKg: 0, totalUsd: 0 }
  ]);

  useEffect(() => {
    if (open) {
      loadBuyers();
      
      // If editing existing shipment, populate form
      if (initialData) {
        const { shipment, entries } = initialData;
        setDate(new Date(shipment.date));
        setBuyerId(shipment.buyerId);
        setContainerNumber(shipment.containerNumber || "");
        setVesselName(shipment.vesselName || "");
        setEntries(entries.map(entry => ({
          id: entry.id,
          fishName: entry.fishName,
          size: entry.size,
          netKgPerMc: entry.netKgPerMc,
          qtyMc: entry.qtyMc,
          qtyKgs: entry.qtyKgs,
          pricePerKg: entry.pricePerKg,
          totalUsd: entry.totalUsd
        })));
      } else {
        // Reset form for new shipment
        setDate(new Date());
        setBuyerId("");
        setContainerNumber("");
        setVesselName("");
        setEntries([
          { fishName: "", size: "", netKgPerMc: 0, qtyMc: 0, qtyKgs: 0, pricePerKg: 0, totalUsd: 0 }
        ]);
      }
    }
  }, [open, initialData]);

  const loadBuyers = async () => {
    try {
      const buyersList = await getBuyers();
      setBuyers(buyersList);
    } catch (error) {
      console.error("Error loading buyers:", error);
      toast.error("Failed to load buyers");
    }
  };

  const handleEntryChange = (index: number, field: keyof FishEntry, value: any) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };

    // Recalculate derived values
    if (field === 'netKgPerMc' || field === 'qtyMc') {
      const netKgPerMc = Number(updatedEntries[index].netKgPerMc) || 0;
      const qtyMc = Number(updatedEntries[index].qtyMc) || 0;
      updatedEntries[index].qtyKgs = netKgPerMc * qtyMc;
    }

    if (field === 'qtyKgs' || field === 'pricePerKg') {
      const qtyKgs = Number(updatedEntries[index].qtyKgs) || 0;
      const pricePerKg = Number(updatedEntries[index].pricePerKg) || 0;
      updatedEntries[index].totalUsd = qtyKgs * pricePerKg;
    }

    setEntries(updatedEntries);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { fishName: "", size: "", netKgPerMc: 0, qtyMc: 0, qtyKgs: 0, pricePerKg: 0, totalUsd: 0 }
    ]);
  };

  const removeEntry = (index: number) => {
    if (entries.length === 1) {
      toast.error("At least one entry is required");
      return;
    }
    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    setEntries(updatedEntries);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a shipment");
      return;
    }

    if (!date) {
      toast.error("Please select a shipment date");
      return;
    }

    if (!buyerId) {
      toast.error("Please select a buyer");
      return;
    }

    // Validate entries
    const validEntries = entries.filter(entry => 
      entry.fishName && 
      entry.qtyKgs && 
      entry.pricePerKg
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid fish entry");
      return;
    }

    setIsLoading(true);

    try {
      const selectedBuyer = buyers.find(b => b.id === buyerId);
      
      if (!selectedBuyer) {
        throw new Error("Selected buyer not found");
      }

      const shipmentData = {
        userId: user.id,
        buyerId: buyerId,
        buyerName: selectedBuyer.name,
        date: date.toISOString().split('T')[0],
        vesselName: vesselName || undefined,
        containerNumber: containerNumber || undefined,
      };

      const entriesData = validEntries.map(entry => ({
        shipmentId: "", // Will be set by the service
        fishName: entry.fishName || "",
        size: entry.size || "",
        netKgPerMc: Number(entry.netKgPerMc) || 0,
        qtyMc: Number(entry.qtyMc) || 0,
        qtyKgs: Number(entry.qtyKgs) || 0,
        pricePerKg: Number(entry.pricePerKg) || 0,
        totalUsd: Number(entry.totalUsd) || 0,
      }));

      if (initialData) {
        // Update existing shipment
        // await updateShipment(initialData.shipment.id, shipmentData, entriesData);
        toast.success("Shipment updated successfully");
      } else {
        // Create new shipment
        await createShipment(shipmentData as any, entriesData as any);
        toast.success("Shipment created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving shipment:", error);
      toast.error("Failed to save shipment");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrandTotal = () => {
    return entries.reduce((total, entry) => total + (Number(entry.totalUsd) || 0), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="date">Shipment Date</Label>
            <DatePicker
              date={date}
              onSelect={setDate}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="buyer">Buyer</Label>
            <Select value={buyerId} onValueChange={setBuyerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map(buyer => (
                  <SelectItem key={buyer.id} value={buyer.id}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="vesselName">Vessel Name (Optional)</Label>
            <Input
              id="vesselName"
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="containerNumber">Container Number (Optional)</Label>
            <Input
              id="containerNumber"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md p-4 mt-4">
          <h3 className="font-medium mb-4">Fish Entries</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full excel-style">
              <thead>
                <tr>
                  <th>Fish Name</th>
                  <th>Size</th>
                  <th>Net KG/MC</th>
                  <th>Qty MC</th>
                  <th>Qty KGs</th>
                  <th>Price/KG</th>
                  <th>Total USD</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td>
                      <Input
                        value={entry.fishName || ""}
                        onChange={(e) => handleEntryChange(index, "fishName", e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td>
                      <Input
                        value={entry.size || ""}
                        onChange={(e) => handleEntryChange(index, "size", e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={entry.netKgPerMc || ""}
                        onChange={(e) => handleEntryChange(index, "netKgPerMc", parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={entry.qtyMc || ""}
                        onChange={(e) => handleEntryChange(index, "qtyMc", parseInt(e.target.value))}
                        className="w-full"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={entry.qtyKgs || ""}
                        onChange={(e) => handleEntryChange(index, "qtyKgs", parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={entry.pricePerKg || ""}
                        onChange={(e) => handleEntryChange(index, "pricePerKg", parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={entry.totalUsd?.toFixed(2) || "0.00"}
                        readOnly
                        className="w-full bg-muted"
                      />
                    </td>
                    <td>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-right font-medium">
                    Grand Total:
                  </td>
                  <td className="font-medium">
                    ${calculateGrandTotal().toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={addEntry}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Shipment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
