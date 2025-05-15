import { useState } from 'react';
// Removed DashboardLayout import
import { PurchaseTable } from '@/components/PurchaseTable';
import { PurchaseForm } from '@/components/PurchaseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecycleBin } from '@/components/RecycleBin';

export default function PurchasesPage() {
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const { companyName, setCompanyName } = useApp();

  return (
    <div className="bg-[#f6f7f9] min-h-screen w-full pb-8">
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 md:px-6 pt-6">
        {/* Header Card */}
        <div className="bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans leading-tight">Purchase History</h1>
            <p className="mt-0.5 text-gray-500 text-base font-sans">View and manage all your fish purchase records</p>
        </div>
          <div className="flex gap-2 items-center mt-2 sm:mt-0">
            <Button
              onClick={() => setIsAddPurchaseOpen(true)}
              className="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 shadow-xl text-base font-sans"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Purchase
          </Button>
        </div>
      </div>

        {/* Settings and Data Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="rounded-2xl shadow-xl border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Company Settings</span>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name (for Reports)</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className="rounded-2xl shadow-xl border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Data Management</span>
              <Trash2 className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Deleted purchases will be moved to the recycle bin for 30 days before permanent deletion.
            </p>
            <Button variant="destructive" size="sm" onClick={() => document.getElementById('deletedTab')?.click()}>
              View Recycle Bin
            </Button>
          </CardContent>
        </Card>
      </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-8">
      <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6 bg-gray-50 rounded-lg p-1 flex gap-2">
              <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow text-base rounded-lg">Active Purchases</TabsTrigger>
              <TabsTrigger value="deleted" id="deletedTab" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow text-base rounded-lg">Recycle Bin</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <PurchaseTable />
        </TabsContent>

        <TabsContent value="deleted">
          <RecycleBin />
        </TabsContent>
      </Tabs>
        </div>
      </div>

      <PurchaseForm
        isOpen={isAddPurchaseOpen}
        onClose={() => setIsAddPurchaseOpen(false)}
      />
    </div>
  );
}
