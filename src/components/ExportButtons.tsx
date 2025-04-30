
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

export function ExportButtons() {
  const { purchases, companyName } = useApp();
  
  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    // In a real app, we'd generate the export file using a library
    // For now, just simulate with a toast
    setTimeout(() => {
      toast.success(`Data exported as ${format.toUpperCase()} format`, {
        description: `${purchases.length} purchase records for ${companyName} exported`
      });
    }, 1000);
  };
  
  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        variant="outline" 
        onClick={() => handleExport('xlsx')}
        className="flex items-center bg-white hover:bg-gray-50"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export to Excel
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => handleExport('csv')}
        className="flex items-center bg-white hover:bg-gray-50"
      >
        <FileText className="h-4 w-4 mr-2" />
        Export to CSV
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => handleExport('pdf')}
        className="flex items-center bg-white hover:bg-gray-50"
      >
        <File className="h-4 w-4 mr-2" />
        Export to PDF
      </Button>
    </div>
  );
}
