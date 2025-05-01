
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "@/components/ExportButtons";
import { FileDown, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { DateFilter } from "@/types";

export default function ExportPage() {
  const { companyName, purchases } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground mt-1">
          Download your fish purchase data in different formats
        </p>
      </div>
      
      {/* Company Information */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold text-blue-800">{companyName}</h2>
          <p className="text-blue-600 mt-1">Purchase Records Export</p>
          <p className="text-sm text-blue-600 mt-1">Total Records: {purchases.length}</p>
        </CardContent>
      </Card>
      
      {/* Export Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Export Filters
          </CardTitle>
          <CardDescription>
            Select which data you want to include in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="mb-2 font-medium">Date Range</p>
              <Select
                value={dateFilter}
                onValueChange={(value) => setDateFilter(value as DateFilter)}
              >
                <SelectTrigger className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateFilter === "custom" && (
              <>
                <div>
                  <p className="mb-2 font-medium">Start Date</p>
                  <DatePicker date={startDate} onSelect={setStartDate} />
                </div>
                <div>
                  <p className="mb-2 font-medium">End Date</p>
                  <DatePicker date={endDate} onSelect={setEndDate} />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
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
            <Button 
              variant="outline" 
              onClick={() => document.querySelector(".ExportButtons button:nth-child(1)")?.dispatchEvent(new Event("click"))}
            >
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
            <Button 
              variant="outline" 
              onClick={() => document.querySelector(".ExportButtons button:nth-child(2)")?.dispatchEvent(new Event("click"))}
            >
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
            <Button 
              variant="outline" 
              onClick={() => document.querySelector(".ExportButtons button:nth-child(3)")?.dispatchEvent(new Event("click"))}
            >
              <File className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Quick Export for {companyName}
          </CardTitle>
          <CardDescription>
            Export all your purchase data with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="ExportButtons">
            <ExportButtons />
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
