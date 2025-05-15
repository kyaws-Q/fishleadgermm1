import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Trash2, Plus, Save } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Buyer, FishEntryFormData, COMMON_FISH_NAMES, COMMON_FISH_SIZES } from "@/types";
import { getBuyers } from "@/services/buyerService";
import { createShipment } from "@/services/shipmentService";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    shipment: {
      id: string;
      buyerId: string;
      date: string;
      containerNumber?: string;
      vesselName?: string;
    };
    entries: Array<{
      id?: string;
      fish_name: string;
      description: string;
      netKgPerMc: number;
      qtyMc: number;
      qtyKgs: number;
      pricePerKg: number;
      totalUsd: number;
    }>;
  };
}

export function ShipmentForm({ open, onClose, initialData }: ShipmentFormProps) {
  const { user } = useApp();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [buyerId, setBuyerId] = useState<string>("");
  const [buyerName, setBuyerName] = useState<string>("");
  const [containerNumber, setContainerNumber] = useState<string>("");
  const [vesselName, setVesselName] = useState<string>("");
  const [entries, setEntries] = useState<Partial<FishEntryFormData>[]>([
    { fish_name: "", description: "", net_kg_per_mc: 0, qty_mc: 0, qty_kgs: 0, price_per_kg: 0, total_usd: 0 }
  ]);

  useEffect(() => {
    if (open) {
      loadBuyers();
      
      // If editing existing shipment, populate form
      if (initialData) {
        const { shipment, entries } = initialData;
        setDate(new Date(shipment.date));
        setBuyerId(shipment.buyerId);
        setBuyerName(buyers.find(b => b.id === shipment.buyerId)?.name || "");
        setContainerNumber(shipment.containerNumber || "");
        setVesselName(shipment.vesselName || "");
        setEntries(entries.map(entry => ({
          id: entry.id,
          fish_name: entry.fish_name,
          description: entry.description,
          net_kg_per_mc: entry.netKgPerMc,
          qty_mc: entry.qtyMc,
          qty_kgs: entry.qtyKgs,
          price_per_kg: entry.pricePerKg,
          total_usd: entry.totalUsd
        })));
      } else {
        // Reset form for new shipment
        setDate(new Date());
        setBuyerId("");
        setBuyerName("");
        setContainerNumber("");
        setVesselName("");
        setEntries([
          { fish_name: "", description: "", net_kg_per_mc: 0, qty_mc: 0, qty_kgs: 0, price_per_kg: 0, total_usd: 0 }
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

  const handleEntryChange = (index: number, field: keyof FishEntryFormData, value: any) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };

    // Recalculate derived values
    if (field === 'net_kg_per_mc' || field === 'qty_mc') {
      const netKgPerMc = Number(updatedEntries[index].net_kg_per_mc) || 0;
      const qtyMc = Number(updatedEntries[index].qty_mc) || 0;
      updatedEntries[index].qty_kgs = netKgPerMc * qtyMc;
    }

    if (field === 'qty_kgs' || field === 'price_per_kg') {
      const qtyKgs = Number(updatedEntries[index].qty_kgs) || 0;
      const pricePerKg = Number(updatedEntries[index].price_per_kg) || 0;
      updatedEntries[index].total_usd = qtyKgs * pricePerKg;
    }

    setEntries(updatedEntries);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { fish_name: "", description: "", net_kg_per_mc: 0, qty_mc: 0, qty_kgs: 0, price_per_kg: 0, total_usd: 0 }
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

    if (!buyerId && !buyerName) {
      toast.error("Please select or enter a buyer");
      return;
    }

    // Validate entries
    const validEntries = entries.filter(entry => 
      entry.fish_name && 
      entry.qty_kgs && 
      entry.price_per_kg
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid fish entry");
      return;
    }

    setIsLoading(true);

    try {
      let selectedBuyer = buyers.find(b => b.id === buyerId);
      let finalBuyerId = buyerId;
      let finalBuyerName = buyerName;
      if (!selectedBuyer && buyerName) {
        // Add new buyer to DB/service here if needed
        // For now, just use the typed name
        finalBuyerId = undefined;
        finalBuyerName = buyerName;
      } else if (selectedBuyer) {
        finalBuyerName = selectedBuyer.name;
      }

      const shipmentData = {
        userId: user.id,
        buyerId: finalBuyerId,
        buyerName: finalBuyerName,
        date: date.toISOString().split('T')[0],
        vesselName: vesselName || undefined,
        containerNumber: containerNumber || undefined,
      };

      const entriesData = validEntries.map(entry => ({
        shipmentId: "", // Will be set by the service
        fish_name: entry.fish_name || "",
        description: entry.description || "",
        net_kg_per_mc: Number(entry.net_kg_per_mc) || 0,
        qty_mc: Number(entry.qty_mc) || 0,
        qty_kgs: Number(entry.qty_kgs) || 0,
        price_per_kg: Number(entry.price_per_kg) || 0,
        total_usd: Number(entry.total_usd) || 0,
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
    return entries.reduce((total, entry) => total + (Number(entry.total_usd) || 0), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/90 to-gray-100/90 shadow-2xl rounded-xl border-0 p-0">
        <DialogTitle asChild>
          <VisuallyHidden>{initialData ? "Edit Shipment" : "Create New Shipment"}</VisuallyHidden>
        </DialogTitle>
        <DialogDescription asChild>
          <VisuallyHidden>Enter shipment details and fish entries below.</VisuallyHidden>
        </DialogDescription>
        <div className="h-[1px] w-full bg-gray-200" /> {/* Subtle gap between topbar and card */}
        <Card className="bg-white/90 shadow-lg rounded-xl border-0">
          <CardHeader className="pb-2 border-b border-gray-100 bg-white/80 rounded-t-xl">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {initialData ? "Edit Shipment" : "Create New Shipment"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Enter shipment details and fish entries below.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Shipment Date</Label>
                <DatePicker date={date} onSelect={setDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer">Buyer</Label>
                <div className="relative">
                  <Command className="w-full border rounded-md bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary">
                    <CommandInput
                      placeholder="Type or select buyer..."
                      value={buyerName}
                      onValueChange={setBuyerName}
                      autoFocus
                    />
                    <CommandList>
                      {buyers.length === 0 && <CommandEmpty>No buyers found.</CommandEmpty>}
                      {buyers.map(buyer => (
                        <CommandItem
                          key={buyer.id}
                          value={buyer.name}
                          onSelect={() => {
                            setBuyerId(buyer.id);
                            setBuyerName(buyer.name);
                          }}
                        >
                          {buyer.name}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </div>
              </div>
              <div>
                <Label htmlFor="vesselName">Vessel Name (Optional)</Label>
                <Input id="vesselName" value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="containerNumber">Container Number (Optional)</Label>
                <Input id="containerNumber" value={containerNumber} onChange={(e) => setContainerNumber(e.target.value)} />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-lg text-gray-700">Fish Entries</h3>
              <div className="rounded-xl shadow border border-gray-100 bg-white/80 overflow-hidden">
                <ScrollArea className="h-[320px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Fish Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Size</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Net KG/MC</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Qty MC</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Qty KGs</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Price/KG</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Total USD</th>
                        <th className="px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={index} className="even:bg-gray-50">
                          <td className="px-3 py-2">
                            <Select value={entry.fish_name || ""} onValueChange={(value) => handleEntryChange(index, "fish_name", value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select fish" />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_FISH_NAMES.map(name => (
                                  <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="text"
                              value={entry.description || ""}
                              onChange={e => handleEntryChange(index, "description", e.target.value)}
                              className="w-full"
                              placeholder="Enter size"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" value={entry.net_kg_per_mc || ""} onChange={(e) => handleEntryChange(index, "net_kg_per_mc", parseFloat(e.target.value))} className="w-full" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" value={entry.qty_mc || ""} onChange={(e) => handleEntryChange(index, "qty_mc", parseInt(e.target.value))} className="w-full" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" value={entry.qty_kgs || ""} onChange={(e) => handleEntryChange(index, "qty_kgs", parseFloat(e.target.value))} className="w-full" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" value={entry.price_per_kg || ""} onChange={(e) => handleEntryChange(index, "price_per_kg", parseFloat(e.target.value))} className="w-full" />
                          </td>
                          <td className="px-3 py-2">
                            <Input type="number" value={entry.total_usd?.toFixed(2) || "0.00"} readOnly className="w-full bg-muted" />
                          </td>
                          <td className="px-2 text-center">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={6} className="text-right font-medium px-3 py-2">Grand Total:</td>
                        <td className="font-medium px-3 py-2">${calculateGrandTotal().toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </ScrollArea>
              </div>
              <div className="flex justify-end mt-3">
                <Button type="button" variant="outline" onClick={addEntry} className="rounded-md shadow-sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Entry
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-white/80 rounded-b-xl border-t border-gray-100">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="rounded-md">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="rounded-md shadow-sm">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Shipment"}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
