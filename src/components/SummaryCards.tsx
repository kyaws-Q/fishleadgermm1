
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign, LineChart, ShoppingCart, TrendingUp } from "lucide-react";

export function SummaryCards() {
  const { purchases, timeFrame } = useApp();
  
  // Calculate total purchases
  const totalPurchases = purchases.length;
  
  // Calculate total spent
  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
  
  // Calculate average purchase
  const averagePurchase = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
  
  // Calculate unique suppliers
  const uniqueSuppliers = new Set(purchases.map(p => p.companyName)).size;

  const cards = [
    {
      title: "Total Purchases",
      value: totalPurchases.toString(),
      label: "purchases",
      color: "bg-indigo-500",
      increase: "+12%",
      icon: <ShoppingCart className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      label: "spent",
      color: "bg-green-500",
      increase: "+5.2%",
      icon: <CircleDollarSign className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Average Purchase",
      value: `$${averagePurchase.toFixed(2)}`,
      label: "per transaction",
      color: "bg-blue-500",
      increase: "+3.1%",
      icon: <LineChart className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Unique Suppliers",
      value: uniqueSuppliers.toString(),
      label: "suppliers",
      color: "bg-rose-500",
      increase: "+2",
      icon: <TrendingUp className="h-5 w-5 text-rose-500" />,
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="border shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                  <span className="text-xs text-green-600 ml-2 flex items-center">
                    {card.increase}
                  </span>
                </div>
              </div>
              <div className="rounded-full p-2 bg-muted">{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
