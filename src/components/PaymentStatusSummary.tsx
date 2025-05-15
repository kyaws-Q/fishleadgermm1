import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export function PaymentStatusSummary() {
  const { purchases } = useApp();
  const navigate = useNavigate();

  // Calculate payment status counts
  const paidCount = purchases.filter(p => p.paymentStatus === 'paid').length;
  const unpaidCount = purchases.filter(p => p.paymentStatus === 'unpaid').length;
  const pendingCount = purchases.filter(p => p.paymentStatus === 'pending').length;
  const totalCount = purchases.length;

  // Calculate payment status totals
  const paidTotal = purchases
    .filter(p => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + p.totalPrice, 0);

  const unpaidTotal = purchases
    .filter(p => p.paymentStatus === 'unpaid')
    .reduce((sum, p) => sum + p.totalPrice, 0);

  const pendingTotal = purchases
    .filter(p => p.paymentStatus === 'pending')
    .reduce((sum, p) => sum + p.totalPrice, 0);

  // Calculate percentages
  const paidPercentage = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  const unpaidPercentage = totalCount > 0 ? (unpaidCount / totalCount) * 100 : 0;
  const pendingPercentage = totalCount > 0 ? (pendingCount / totalCount) * 100 : 0;

  // Navigate to purchases page with filter
  const navigateToPaymentStatus = (status: string) => {
    navigate(`/purchases?status=${status}`);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
      <div className="grid grid-cols-1 gap-4">
        {/* Paid Summary */}
        <Card className="shadow-sm border-green-100 overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-4 px-4 border-b bg-green-50/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium text-green-800 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Paid Purchases
                </CardTitle>
                <CardDescription className="text-xs text-green-700 mt-0.5">
                  Completed payments
                </CardDescription>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {paidCount}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-xl font-semibold text-green-600">${paidTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-500">Completion</span>
                  <span className="font-medium text-green-700">{Math.round(paidPercentage)}%</span>
                </div>
                <Progress value={paidPercentage} className="h-1.5 bg-green-100" indicatorClassName="bg-green-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-green-600 hover:text-green-800 hover:bg-green-50 text-xs font-medium"
                onClick={() => navigateToPaymentStatus('paid')}
              >
                View Details <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Summary */}
        <Card className="shadow-sm border-red-100 overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-4 px-4 border-b bg-red-50/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium text-red-800 flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Unpaid Purchases
                </CardTitle>
                <CardDescription className="text-xs text-red-700 mt-0.5">
                  Pending payments
                </CardDescription>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {unpaidCount}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-xl font-semibold text-red-600">${unpaidTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-500">Completion</span>
                  <span className="font-medium text-red-700">{Math.round(unpaidPercentage)}%</span>
                </div>
                <Progress value={unpaidPercentage} className="h-1.5 bg-red-100" indicatorClassName="bg-red-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-red-600 hover:text-red-800 hover:bg-red-50 text-xs font-medium"
                onClick={() => navigateToPaymentStatus('unpaid')}
              >
                View Details <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Summary */}
        <Card className="shadow-sm border-amber-100 overflow-hidden bg-white">
          <CardHeader className="pb-3 pt-4 px-4 border-b bg-amber-50/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium text-amber-800 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Pending Purchases
                </CardTitle>
                <CardDescription className="text-xs text-amber-700 mt-0.5">
                  In progress
                </CardDescription>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {pendingCount}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-xl font-semibold text-amber-600">${pendingTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-500">Completion</span>
                  <span className="font-medium text-amber-700">{Math.round(pendingPercentage)}%</span>
                </div>
                <Progress value={pendingPercentage} className="h-1.5 bg-amber-100" indicatorClassName="bg-amber-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-amber-600 hover:text-amber-800 hover:bg-amber-50 text-xs font-medium"
                onClick={() => navigateToPaymentStatus('pending')}
              >
                View Details <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
