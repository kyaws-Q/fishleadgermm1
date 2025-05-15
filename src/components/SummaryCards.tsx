import { useApp } from "@/contexts/AppContext";
import { ArrowUpRight, ArrowDownRight, ShoppingCart, DollarSign, LineChart, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SummaryCards() {
  const { purchases } = useApp();
  
  const totalPurchases = purchases.length;
  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
  const averagePurchase = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
  const uniqueSuppliers = new Set(purchases.map(p => p.companyName)).size;

  const purchaseTrend = { value: "+5%", positive: true };
  const spentTrend = { value: "-2%", positive: false };
  const avgTrend = { value: "+1.5%", positive: true };
  const supplierTrend = { value: "+2", positive: true };

  const TrendIndicator = ({ trend }: { trend: { value: string, positive: boolean } }) => (
    <div className={`flex items-center text-xs mt-1 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
      {trend.positive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
      <span>{trend.value} vs last period</span>
    </div>
  );

  const cardData = [
    {
      title: "Total Purchases",
      value: totalPurchases,
      trend: purchaseTrend,
      icon: <ShoppingCart className="text-indigo-500 w-8 h-8" />, // larger icon
      formatAsCurrency: false
    },
    {
      title: "Total Spent",
      value: totalSpent,
      trend: spentTrend,
      icon: <DollarSign className="text-emerald-500 w-8 h-8" />, // larger icon
      formatAsCurrency: true
    },
    {
      title: "Average Purchase",
      value: averagePurchase,
      trend: avgTrend,
      icon: <LineChart className="text-sky-500 w-8 h-8" />, // larger icon
      formatAsCurrency: true
    },
    {
      title: "Unique Suppliers",
      value: uniqueSuppliers,
      trend: supplierTrend,
      icon: <Users className="text-purple-500 w-8 h-8" />, // larger icon
      formatAsCurrency: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
      {cardData.map((card, index) => (
        <Card
          key={index}
          className="w-full h-full flex flex-col items-start justify-center rounded-2xl shadow-xl bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-100 p-5 sm:p-6 md:p-8 text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            {card.icon}
            <span className="text-lg md:text-xl font-semibold text-gray-700">{card.title}</span>
        </div>
          <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
            {card.formatAsCurrency
              ? `$${card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : card.value}
        </div>
          <TrendIndicator trend={card.trend} />
        </Card>
      ))}
    </div>
  );
}
