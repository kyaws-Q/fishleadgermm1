
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, AreaChart, PieChart, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Area, Pie, ResponsiveContainer } from 'recharts';

type ChartType = "bar" | "line" | "area" | "pie";

interface SpendingChartProps {
  title: string;
  type?: ChartType;
}

export function SpendingChart({ title, type = "bar" }: SpendingChartProps) {
  const { spendingByFishType, purchasesByMonth } = useApp();
  
  // Format data for charts
  const fishTypeData = Object.entries(spendingByFishType).map(([fishName, total]) => ({
    name: fishName,
    value: total
  })).sort((a, b) => b.value - a.value).slice(0, 5);
  
  const monthlyData = Object.entries(purchasesByMonth).map(([month, total]) => ({
    name: month,
    value: total
  })).sort((a, b) => {
    const [aMonth, aYear] = a.name.split('/').map(Number);
    const [bMonth, bYear] = b.name.split('/').map(Number);
    return aYear === bYear ? aMonth - bMonth : aYear - bYear;
  }).slice(-6);
  
  // Colors for the chart
  const COLORS = [
    "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", 
    "#e11d48", "#f43f5e", "#fb7185", "#fda4af", "#fecdd3"
  ];

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fishTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Total"]} />
              <Legend />
              <Bar dataKey="value" fill="#0ea5e9">
                {fishTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Total"]} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Total"]} />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#bae6fd" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={fishTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {fishTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Total"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
