
import { DashboardLayout } from "@/components/DashboardLayout";
import { SpendingChart } from "@/components/SpendingChart";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Visualize and analyze your fish purchase data
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SpendingChart title="Top Fish Types by Spending" type="bar" />
        <SpendingChart title="Spending Distribution" type="pie" />
      </div>
      
      <div className="mb-8">
        <SpendingChart title="Monthly Purchase Trends" type="line" />
      </div>
    </DashboardLayout>
  );
}
