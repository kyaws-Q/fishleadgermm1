
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Fish, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ActiveTasksList() {
  const { purchases } = useApp();
  const today = new Date();

  // Get just the most recent 4 purchases for the upcoming list
  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 4);

  // Generate upcoming tasks for the next few days
  const upcomingTasks = [
    {
      id: 1,
      title: "Review pending payments",
      date: addDays(today, 1),
      type: "payment",
      priority: "high"
    },
    {
      id: 2,
      title: "Check inventory levels",
      date: addDays(today, 2),
      type: "inventory",
      priority: "medium"
    },
    {
      id: 3,
      title: "Contact new suppliers",
      date: addDays(today, 3),
      type: "supplier",
      priority: "low"
    },
    {
      id: 4,
      title: "Prepare monthly report",
      date: addDays(today, 5),
      type: "report",
      priority: "medium"
    }
  ];

  return (
    <Card className="bg-white border border-ocean-100 shadow-soft hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">Upcoming Tasks</CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </div>
          <div className="p-2 rounded-full bg-ocean-100 text-ocean-600">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative pl-6">
          {/* Time indicator line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ocean-300 to-ocean-100"></div>

          <div className="space-y-4">
            {upcomingTasks.map((task, index) => {
              // Get icon based on task type
              const getIcon = () => {
                switch(task.type) {
                  case 'payment': return <DollarSign className="h-4 w-4" />;
                  case 'inventory': return <Fish className="h-4 w-4" />;
                  case 'supplier': return <ShoppingCart className="h-4 w-4" />;
                  default: return <Clock className="h-4 w-4" />;
                }
              };

              // Get color based on priority
              const getColor = () => {
                switch(task.priority) {
                  case 'high': return 'bg-red-100 text-red-600 border-red-200';
                  case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200';
                  default: return 'bg-green-100 text-green-600 border-green-200';
                }
              };

              return (
                <div key={task.id} className="relative group">
                  {/* Time dot with pulse effect on hover */}
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white bg-ocean-500 group-hover:animate-pulse"></div>

                  {/* Date */}
                  <div className="text-sm font-medium mb-1 text-ocean-800 flex items-center">
                    {format(task.date, "EEE, MMM d")}
                    <Badge variant="outline" className={`ml-2 text-xs ${getColor()}`}>
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Content with hover effect */}
                  <div className="p-3 rounded-md border border-ocean-100 text-sm bg-white hover:bg-ocean-50/50 transition-colors duration-200 group-hover:border-ocean-300 flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-ocean-100 text-ocean-600 mt-0.5">
                      {getIcon()}
                    </div>
                    <div>
                      <p className="font-medium text-ocean-900">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(task.date, "h:mm a")} • {task.type}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-ocean-100 bg-ocean-50/50 py-2">
        <Button variant="ghost" size="sm" className="w-full justify-center text-ocean-600 hover:text-ocean-700 hover:bg-ocean-100">
          View All Tasks <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
