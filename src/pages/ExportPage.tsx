
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "@/components/ExportButtons";
import { FileDown } from "lucide-react";

export default function ExportPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground mt-1">
          Download your fish purchase data in different formats
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <FileDown className="h-8 w-8 text-ocean-600 mb-2" />
            <CardTitle>Excel Export</CardTitle>
            <CardDescription>
              Download your purchase history in Microsoft Excel format (.xlsx)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Includes all data with proper formatting, filters, and calculations.
              Perfect for further analysis in Excel.
            </p>
            <Button variant="outline" onClick={() => {}}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <FileDown className="h-8 w-8 text-ocean-600 mb-2" />
            <CardTitle>CSV Export</CardTitle>
            <CardDescription>
              Download your purchase history in CSV format (.csv)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Simple text-based format that can be imported into various applications
              including spreadsheets and databases.
            </p>
            <Button variant="outline" onClick={() => {}}>
              <FileText className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <FileDown className="h-8 w-8 text-ocean-600 mb-2" />
            <CardTitle>PDF Export</CardTitle>
            <CardDescription>
              Download your purchase history in PDF format (.pdf)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Professional formatted report with your purchase history that can be
              easily printed or shared.
            </p>
            <Button variant="outline" onClick={() => {}}>
              <FilePdf className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>
            Export all your purchase data with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButtons />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

// Missing imports for buttons
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, FilePdf } from "lucide-react";
