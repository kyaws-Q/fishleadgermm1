
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";

export function ActiveTasksList() {
  const { purchases } = useApp();
  const today = new Date();
  
  // Get just the most recent 4 purchases for the upcoming list
  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 4);

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Upcoming</CardTitle>
        <p className="text-xs text-muted-foreground">
          {format(today, "EEEE, d MMMM, yyyy")}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative pl-6">
          {/* Time indicator line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {recentPurchases.length > 0 ? (
            <div className="space-y-6">
              {recentPurchases.map((purchase, index) => {
                // Generate some fake times for visualization
                const hour = 9 + index;
                const ampm = hour >= 12 ? "PM" : "AM";
                const displayHour = hour > 12 ? hour - 12 : hour;
                
                return (
                  <div key={purchase.id} className="relative">
                    {/* Time dot */}
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white" 
                         style={{backgroundColor: getRandomColor(index)}}></div>
                    
                    {/* Time */}
                    <div className="text-sm font-medium mb-1">
                      {displayHour} {ampm}
                    </div>
                    
                    {/* Content */}
                    <div className={`p-3 rounded-md border-l-4 text-sm`} 
                         style={{borderLeftColor: getRandomColor(index), backgroundColor: `${getRandomColor(index)}10`}}>
                      <p className="font-medium">{purchase.fishName}</p>
                      <p className="text-xs text-muted-foreground">
                        {purchase.quantity} units, ${purchase.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No recent purchases to display
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate colors for the timeline
function getRandomColor(index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
  ];
  
  return colors[index % colors.length];
}
