
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SummaryCards } from "@/components/SummaryCards";
import { PurchaseTable } from "@/components/PurchaseTable";
import { SpendingChart } from "@/components/SpendingChart";
import { PurchaseForm } from "@/components/PurchaseForm";

export default function DashboardPage() {
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  
  return (
    <DashboardLayout>
      <DashboardHeader onAddPurchase={() => setIsAddPurchaseOpen(true)} />
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SpendingChart title="Spending by Fish Type" type="bar" />
        <SpendingChart title="Monthly Spending" type="area" />
      </div>
      
      <PurchaseTable />
      <PurchaseForm open={isAddPurchaseOpen} onClose={() => setIsAddPurchaseOpen(false)} />
    </DashboardLayout>
  );
}
