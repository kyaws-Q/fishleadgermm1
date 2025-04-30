
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FishPurchase } from "@/types";

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
}

export function PurchaseForm({ open, onClose }: PurchaseFormProps) {
  const { addPurchase } = useApp();
  const [formData, setFormData] = useState<Omit<FishPurchase, "id" | "totalPrice">>({
    fishName: "",
    sizeKg: 0,
    quantity: 1,
    pricePerUnit: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPurchase(formData);
    onClose();
    
    // Reset form
    setFormData({
      fishName: "",
      sizeKg: 0,
      quantity: 1,
      pricePerUnit: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Purchase</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fishName">Fish Name</Label>
              <Input
                id="fishName"
                name="fishName"
                value={formData.fishName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sizeKg">Size (KG)</Label>
              <Input
                id="sizeKg"
                name="sizeKg"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.sizeKg || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerUnit">Price Per Unit</Label>
              <Input
                id="pricePerUnit"
                name="pricePerUnit"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.pricePerUnit || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate.toString().split("T")[0]}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Purchase</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
