
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PurchaseTable } from "@/components/PurchaseTable";
import { PurchaseForm } from "@/components/PurchaseForm";
import { ExportButtons } from "@/components/ExportButtons";
import { TableStyleSelector } from "@/components/TableStyleSelector";
import { Plus, FileDown, Settings, Palette } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppTheme } from "@/types";

export default function PurchasesPage() {
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const { companyName, setCompanyName, appTheme, setAppTheme } = useApp();
  
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your fish purchase records
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsAddPurchaseOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Purchase
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Company Settings</span>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name (for Reports)</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Display Settings</span>
              <Palette className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appTheme">App Theme</Label>
                <Select
                  value={appTheme}
                  onValueChange={(value) => setAppTheme(value as AppTheme)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="blue">Blue Theme</SelectItem>
                    <SelectItem value="green">Green Theme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Table Style</Label>
                <div className="mt-1">
                  <TableStyleSelector />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportButtons />
        </CardContent>
      </Card>
      
      <PurchaseTable />
      <PurchaseForm open={isAddPurchaseOpen} onClose={() => setIsAddPurchaseOpen(false)} />
    </DashboardLayout>
  );
}
