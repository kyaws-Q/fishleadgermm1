import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, LineChart, AreaChart, PieChart, Cell, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Line, Area, Pie, ResponsiveContainer
} from 'recharts';
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/contexts/WebSocketProvider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

type ChartType = "bar" | "line" | "area" | "pie";

interface SpendingChartProps {
  title: string;
  description?: string;
  type?: ChartType;
  className?: string;
  height?: number;
  showControls?: boolean;
}

const LIGHT_COLORS = [
  "#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", 
  "#db2777", "#0891b2", "#ea580c", "#4f46e5", "#0d9488"
];
const DARK_COLORS = [
  "#60a5fa", "#f87171", "#34d399", "#fbbf24", "#a78bfa",
  "#f472b6", "#22d3ee", "#fb923c", "#818cf8", "#2dd4bf"
];
const baseColorPalette = [
  'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)',
  'rgba(236, 72, 153, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(14, 165, 233, 0.7)',
  'rgba(249, 115, 22, 0.7)', 'rgba(168, 85, 247, 0.7)'
];
const baseBorderColorPalette = [
  'rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)',
  'rgb(236, 72, 153)', 'rgb(139, 92, 246)', 'rgb(14, 165, 233)',
  'rgb(249, 115, 22)', 'rgb(168, 85, 247)'
];

export function SpendingChart({
  title,
  description,
  type: initialType = "bar",
  className,
  height = 300,
  showControls = false
}: SpendingChartProps) {
  const { spendingByFishType, purchasesByMonth, lastUpdated, isRealTimeEnabled, dateRange, setDateRange, user } = useApp();
  const { isConnected } = useWebSocket();
  const [chartType, setChartType] = useState<ChartType>(initialType);
  const [timeRange, setTimeRange] = useState<string>("1");

  const colorPalette = useMemo(() => baseColorPalette, []);
  const borderColorPalette = useMemo(() => baseBorderColorPalette, []);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20, font: { size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', titleColor: '#1f2937', bodyColor: '#4b5563',
        borderColor: '#e5e7eb', borderWidth: 1, padding: 12, boxPadding: 4, usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
      y: {
        beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          font: { size: 12 },
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
          }
        }
      }
    }
  }), []);

  const chartData = useMemo(() => {
    if (chartType === 'pie') {
      const labels = spendingByFishType ? Object.keys(spendingByFishType) : [];
      const dataValues = spendingByFishType ? Object.values(spendingByFishType).map(Number) : [];
      return {
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: colorPalette.slice(0, dataValues.length),
          borderColor: borderColorPalette.slice(0, dataValues.length),
          borderWidth: 1, hoverOffset: 4
        }]
      };
    } else {
      const labels = purchasesByMonth ? Object.keys(purchasesByMonth) : [];
      const dataValues = purchasesByMonth ? Object.values(purchasesByMonth).map(Number) : [];
      return {
        labels,
        datasets: [{
          label: 'Monthly Spending', data: dataValues, backgroundColor: colorPalette[0],
          borderColor: borderColorPalette[0], borderWidth: 2, tension: 0.3,
          pointStyle: 'circle', pointRadius: 4, pointHoverRadius: 6
        }]
      };
    }
  }, [chartType, spendingByFishType, purchasesByMonth, colorPalette, borderColorPalette]);

  useEffect(() => {
    console.log("Chart Data Debug:", { spendingByFishType, purchasesByMonth, dateRange, chartData });
  }, [spendingByFishType, purchasesByMonth, dateRange, chartData]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const now = new Date();
    const months = parseInt(value);
    setDateRange({ start: startOfMonth(subMonths(now, months - 1)), end: endOfMonth(now) });
  };

  const hasData = useMemo(() => 
    (chartType === "bar" || chartType === "pie") 
      ? (spendingByFishType && Object.keys(spendingByFishType).length > 0)
      : (purchasesByMonth && Object.keys(purchasesByMonth).length > 0),
  [chartType, spendingByFishType, purchasesByMonth]);

  const fishTypeData = useMemo(() => spendingByFishType ? 
    Object.entries(spendingByFishType)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) : 
    [], 
  [spendingByFishType]);

  const monthlyData = useMemo(() => purchasesByMonth ?
    Object.entries(purchasesByMonth)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => {
        const [aMonthStr, aYearStr] = a.name.split('/');
        const [bMonthStr, bYearStr] = b.name.split('/');
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const aDate = new Date(parseInt(aYearStr), monthOrder.indexOf(aMonthStr));
        const bDate = new Date(parseInt(bYearStr), monthOrder.indexOf(bMonthStr));
        return aDate.getTime() - bDate.getTime();
      }) : 
    [], 
  [purchasesByMonth]);
          
  const tooltipStyle = useMemo(() => ({ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', color: 'var(--foreground)', padding: '10px 12px', fontSize: '0.875rem' }), []);
  const chartStyles = useMemo(() => ({ text: { fill: 'var(--muted-foreground)', fontSize: '12px' }, grid: { stroke: 'var(--border)', strokeDasharray: '2 4' } }), []);

  const renderChart = () => {
    if (!hasData) {
      return (
        <Alert variant="default" className="bg-background border-border shadow-sm">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <AlertDescription className="text-muted-foreground">
            No data available for the selected time period. Please adjust your filters or ensure data has been imported.
          </AlertDescription>
        </Alert>
      );
    }

    const dataToRender = (chartType === "bar" || chartType === "pie") ? fishTypeData : monthlyData;
    const currentChartColors = document.documentElement.classList.contains('dark') ? DARK_COLORS : LIGHT_COLORS;

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={dataToRender} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4} barCategoryGap="20%">
              <CartesianGrid {...chartStyles.grid} />
              <XAxis dataKey="name" tick={chartStyles.text} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} interval={0} angle={dataToRender.length > 6 ? -30 : 0} textAnchor={dataToRender.length > 6 ? 'end' : 'middle'} height={dataToRender.length > 6 ? 50 : 30} />
              <YAxis tick={chartStyles.text} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} tickFormatter={(value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} width={70} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent)', fillOpacity: 0.2 }} formatter={(value: number) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
              <Bar dataKey="value" animationDuration={800} radius={[4, 4, 0, 0]}>
                {dataToRender.map((entry, index) => <Cell key={`cell-${index}`} fill={currentChartColors[index % currentChartColors.length]} className="transition-opacity hover:opacity-80 focus:opacity-90" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
      case "area":
        const isAreaChart = chartType === "area";
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={dataToRender} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              {isAreaChart && <defs><linearGradient id="areaGradientFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={currentChartColors[0]} stopOpacity={0.4}/><stop offset="95%" stopColor={currentChartColors[0]} stopOpacity={0.05}/></linearGradient></defs>}
              <CartesianGrid {...chartStyles.grid} />
              <XAxis dataKey="name" tick={chartStyles.text} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} interval={Math.max(0, Math.floor(dataToRender.length / 10) -1)} height={30} />
              <YAxis tick={chartStyles.text} axisLine={{ stroke: 'var(--border)' }} tickLine={{ stroke: 'var(--border)' }} tickFormatter={(value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} width={70} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
              <Area type="monotone" dataKey="value" stroke={currentChartColors[0]} strokeWidth={2.5} fill={isAreaChart ? "url(#areaGradientFill)" : "none"} dot={{ fill: currentChartColors[0], strokeWidth: 1, r: 3, stroke: 'var(--background)' }} activeDot={{ r: 5, strokeWidth: 2, stroke: currentChartColors[0], fill: 'var(--background)' }} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie data={dataToRender} cx="50%" cy="50%" innerRadius={height * 0.25} outerRadius={height * 0.38} paddingAngle={3} dataKey="value" animationDuration={800} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                {dataToRender.map((_, index) => <Cell key={`cell-${index}`} fill={currentChartColors[index % currentChartColors.length]} className="transition-opacity hover:opacity-80 focus:opacity-90 outline-none" stroke="var(--background)" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`$${Number(value).toLocaleString()}`, name]} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} iconSize={10} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        );
      default: return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg border border-border", className)}>
      <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-sm text-muted-foreground mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-full sm:w-[150px] text-xs h-9"><SelectValue placeholder="Select range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="text-xs">Last Month</SelectItem>
                <SelectItem value="3" className="text-xs">Last 3 Months</SelectItem>
                <SelectItem value="6" className="text-xs">Last 6 Months</SelectItem>
                <SelectItem value="12" className="text-xs">Last Year</SelectItem>
              </SelectContent>
            </Select>
            {isRealTimeEnabled && (
              <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted h-9">
                <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-destructive")} />
                <span className="text-xs text-muted-foreground font-medium">{isConnected ? "Live" : "Offline"}</span>
              </div>
            )}
          </div>
        </div>
        {showControls && (
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)} className="mt-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-[360px] h-auto p-1">
              <TabsTrigger value="bar" className="text-xs px-2 py-1.5 h-auto"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Bar</TabsTrigger>
              <TabsTrigger value="line" className="text-xs px-2 py-1.5 h-auto"><LineChartIcon className="h-3.5 w-3.5 mr-1.5" />Line</TabsTrigger>
              <TabsTrigger value="area" className="text-xs px-2 py-1.5 h-auto"><LineChartIcon className="h-3.5 w-3.5 mr-1.5" />Area</TabsTrigger>
              <TabsTrigger value="pie" className="text-xs px-2 py-1.5 h-auto"><PieChartIcon className="h-3.5 w-3.5 mr-1.5" />Pie</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        {renderChart()}
        {lastUpdated && <div className="text-xs text-muted-foreground text-right mt-3">Last updated: {format(lastUpdated, "PPpp")}</div>}
      </CardContent>
    </Card>
  );
}
