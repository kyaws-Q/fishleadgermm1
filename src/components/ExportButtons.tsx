
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File, Download } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { FishPurchase, ExportFormat } from "@/types";

export function ExportButtons() {
  const { purchases, companyName } = useApp();
  
  const handleExport = (format: ExportFormat) => {
    if (purchases.length === 0) {
      toast.error("No purchase data to export");
      return;
    }
    
    // Start export process
    toast.loading(`Preparing ${format.toUpperCase()} export...`);
    
    setTimeout(() => {
      switch (format) {
        case 'xlsx':
          exportToExcel(purchases, companyName);
          break;
        case 'csv':
          exportToCSV(purchases, companyName);
          break;
        case 'pdf':
          exportToPDF(purchases, companyName);
          break;
        default:
          toast.error("Unsupported export format");
      }
    }, 1000);
  };
  
  // Export to CSV function
  const exportToCSV = (data: FishPurchase[], companyName: string) => {
    try {
      // CSV Header
      let csvContent = "Company,Buyer,Fish Name,Size (KG),Quantity,Price Per Unit,Purchase Date,Total Price\n";
      
      // Add rows
      data.forEach(item => {
        const row = [
          item.companyName || '',
          item.buyerName || '',
          item.fishName,
          item.sizeKg,
          item.quantity,
          item.pricePerUnit,
          item.purchaseDate,
          item.totalPrice
        ].join(',');
        csvContent += row + "\n";
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement("a");
      const fileName = `${companyName.replace(/\s+/g, '_')}_Purchases_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("CSV Export Error:", error);
      toast.error("Failed to export as CSV");
    }
  };
  
  // Export to Excel function (simplified without actual Excel formatting)
  const exportToExcel = (data: FishPurchase[], companyName: string) => {
    try {
      // In a real app, we'd use a library like xlsx or exceljs
      // For this demo, we'll create a CSV with Excel extension
      let csvContent = "Company,Buyer,Fish Name,Size (KG),Quantity,Price Per Unit,Purchase Date,Total Price\n";
      
      // Add rows
      data.forEach(item => {
        const row = [
          item.companyName || '',
          item.buyerName || '',
          item.fishName,
          item.sizeKg,
          item.quantity,
          item.pricePerUnit,
          item.purchaseDate,
          item.totalPrice
        ].join(',');
        csvContent += row + "\n";
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement("a");
      const fileName = `${companyName.replace(/\s+/g, '_')}_Purchases_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Excel Export Error:", error);
      toast.error("Failed to export as Excel");
    }
  };
  
  // Export to PDF function (simplified)
  const exportToPDF = (data: FishPurchase[], companyName: string) => {
    try {
      // In a real app, we'd use a library like jspdf or pdfmake
      // For this demo, we'll create a simple HTML and print it to PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow pop-ups to download PDF");
        return;
      }
      
      // Basic HTML with table styling
      printWindow.document.write(`
        <html>
          <head>
            <title>${companyName} - Purchase Records</title>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { text-align: center; color: #0284c7; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #0284c7; color: white; padding: 8px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              .text-right { text-align: right; }
              .total-row { font-weight: bold; border-top: 2px solid #0284c7; }
            </style>
          </head>
          <body>
            <h1>${companyName} - Purchase Records</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Buyer</th>
                  <th>Fish Name</th>
                  <th class="text-right">Size (KG)</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Price/Unit</th>
                  <th>Purchase Date</th>
                  <th class="text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
      `);
      
      // Add table rows
      data.forEach(item => {
        const date = new Date(item.purchaseDate).toLocaleDateString();
        printWindow.document.write(`
          <tr>
            <td>${item.companyName || '-'}</td>
            <td>${item.buyerName || '-'}</td>
            <td>${item.fishName}</td>
            <td class="text-right">${item.sizeKg.toFixed(1)}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">$${item.pricePerUnit.toFixed(2)}</td>
            <td>${date}</td>
            <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
          </tr>
        `);
      });
      
      // Add grand total
      const grandTotal = data.reduce((total, item) => total + item.totalPrice, 0);
      printWindow.document.write(`
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="7" class="text-right">Grand Total:</td>
                  <td class="text-right">$${grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </body>
        </html>
      `);
      
      // Print to PDF
      printWindow.document.close();
      printWindow.onload = function() {
        printWindow.print();
        toast.success("PDF ready for download");
      };
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export as PDF");
    }
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
      
      <Button 
        variant="outline"
        onClick={() => {
          handleExport('xlsx');
          handleExport('pdf');
        }}
        className="flex items-center bg-blue-50 hover:bg-blue-100 border-blue-200"
      >
        <Download className="h-4 w-4 mr-2" />
        Export All Formats
      </Button>
    </div>
  );
}
