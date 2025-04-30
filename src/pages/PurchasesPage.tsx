
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PurchaseTable } from "@/components/PurchaseTable";
import { PurchaseForm } from "@/components/PurchaseForm";
import { ExportButtons } from "@/components/ExportButtons";
import { Plus } from "lucide-react";

export default function PurchasesPage() {
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your fish purchase records
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsAddPurchaseOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Purchase
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Export Options</h2>
        <ExportButtons />
      </div>
      
      <PurchaseTable />
      <PurchaseForm open={isAddPurchaseOpen} onClose={() => setIsAddPurchaseOpen(false)} />
    </DashboardLayout>
  );
}
