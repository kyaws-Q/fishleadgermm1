
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, BarChart, Fish } from "lucide-react";

export function SummaryCards() {
  const { purchases, totalSpending } = useApp();
  
  // Get top fish by quantity
  const getTopFish = () => {
    const fishCounts: Record<string, number> = {};
    purchases.forEach((purchase) => {
      if (!fishCounts[purchase.fishName]) {
        fishCounts[purchase.fishName] = 0;
      }
      fishCounts[purchase.fishName] += purchase.quantity;
    });
    
    let topFish = "";
    let topCount = 0;
    
    Object.entries(fishCounts).forEach(([fish, count]) => {
      if (count > topCount) {
        topFish = fish;
        topCount = count;
      }
    });
    
    return topFish || "No data";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{purchases.length}</div>
          <p className="text-xs text-muted-foreground">
            Records in selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalSpending.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            In selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg. Price/KG</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${purchases.length > 0
              ? (totalSpending / purchases.reduce((sum, p) => sum + p.sizeKg, 0)).toFixed(2)
              : "0.00"}
          </div>
          <p className="text-xs text-muted-foreground">
            All purchases averaged
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Top Fish</CardTitle>
          <Fish className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTopFish()}</div>
          <p className="text-xs text-muted-foreground">
            By quantity purchased
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
