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
        case 'excel':
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
      // Group purchases by company, date, and buyer
      const groupedData: Record<string, FishPurchase[]> = {};
      data.forEach(purchase => {
        const key = `${purchase.companyName || 'Unknown'}-${purchase.purchaseDate}-${purchase.buyerName || 'Unknown'}`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(purchase);
      });
      
      // CSV Content
      let csvContent = "";
      
      // Process each group
      Object.entries(groupedData).forEach(([groupKey, groupPurchases], index) => {
        const [company, date, buyer] = groupKey.split('-');
        
        // Add company header
        csvContent += `"${company}"\n`;
        
        // Add date and buyer
        csvContent += `"Date: ${new Date(date).toLocaleDateString()}","","","","Buyer: ${buyer}"\n`;
        
        // Add headers
        csvContent += "Fish Name,Size (KG),Quantity,Price Per Unit,Total Price\n";
        
        // Add data rows
        groupPurchases.forEach(item => {
          const row = [
            item.fishName,
            item.sizeKg.toFixed(1),
            item.quantity,
            item.pricePerUnit.toFixed(2),
            item.totalPrice.toFixed(2)
          ].join(',');
          csvContent += row + "\n";
        });
        
        // Add grand total
        const grandTotal = groupPurchases.reduce((total, item) => total + item.totalPrice, 0);
        csvContent += `"","","","Grand Total",${grandTotal.toFixed(2)}\n\n`;
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
  
  // Export to Excel function with proper formatting
  const exportToExcel = (data: FishPurchase[], companyName: string) => {
    try {
      // Group purchases by company, date, and buyer
      const groupedData: Record<string, FishPurchase[]> = {};
      data.forEach(purchase => {
        const key = `${purchase.companyName || 'Unknown'}-${purchase.purchaseDate}-${purchase.buyerName || 'Unknown'}`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(purchase);
      });
      
      // In real implementation, we'd use a proper Excel library like ExcelJS
      // For this simplified version, we'll create an HTML table that can be opened in Excel
      
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Purchase Records</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
            }
            .company-header {
              text-align: center;
              font-weight: bold;
              background-color: #e6f2ff;
              font-size: 16px;
            }
            .date-buyer-row {
              background-color: #f5f5f5;
            }
            .date-cell {
              text-align: left;
            }
            .buyer-cell {
              text-align: right;
            }
            .header-row {
              background-color: #d9d9d9;
              font-weight: bold;
            }
            .fish-name {
              text-align: left;
            }
            .size-kg, .quantity {
              text-align: center;
            }
            .price, .total {
              text-align: right;
            }
            .total-row {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total-label {
              text-align: right;
            }
            .total-value {
              text-align: right;
            }
          </style>
        </head>
        <body>
      `;
      
      Object.entries(groupedData).forEach(([groupKey, groupPurchases], index) => {
        const [company, date, buyer] = groupKey.split('-');
        const formattedDate = new Date(date).toLocaleDateString();
        const grandTotal = groupPurchases.reduce((total, item) => total + item.totalPrice, 0);
        
        htmlContent += `
          <table>
            <tr>
              <td colspan="5" class="company-header">${company}</td>
            </tr>
            <tr class="date-buyer-row">
              <td colspan="2" class="date-cell">Date: ${formattedDate}</td>
              <td colspan="3" class="buyer-cell">Buyer: ${buyer}</td>
            </tr>
            <tr class="header-row">
              <th>Fish Name</th>
              <th>Size (KG)</th>
              <th>Quantity</th>
              <th>Price/Unit</th>
              <th>Total</th>
            </tr>
        `;
        
        groupPurchases.forEach(item => {
          htmlContent += `
            <tr>
              <td class="fish-name">${item.fishName}</td>
              <td class="size-kg">${item.sizeKg.toFixed(1)}</td>
              <td class="quantity">${item.quantity}</td>
              <td class="price">$${item.pricePerUnit.toFixed(2)}</td>
              <td class="total">$${item.totalPrice.toFixed(2)}</td>
            </tr>
          `;
        });
        
        htmlContent += `
            <tr class="total-row">
              <td colspan="4" class="total-label">Grand Total:</td>
              <td class="total-value">$${grandTotal.toFixed(2)}</td>
            </tr>
          </table>
          <br>
        `;
      });
      
      htmlContent += `</body></html>`;
      
      // Create download link
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement("a");
      const fileName = `${companyName.replace(/\s+/g, '_')}_Purchases_${new Date().toISOString().split('T')[0]}.xls`;
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
  
  // Export to PDF function (improved with better formatting)
  const exportToPDF = (data: FishPurchase[], companyName: string) => {
    try {
      // Group purchases by company, date, and buyer
      const groupedData: Record<string, FishPurchase[]> = {};
      data.forEach(purchase => {
        const key = `${purchase.companyName || 'Unknown'}-${purchase.purchaseDate}-${purchase.buyerName || 'Unknown'}`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(purchase);
      });
      
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
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
              }
              h1 { 
                text-align: center; 
                color: #0284c7; 
                margin-bottom: 5px;
              }
              .subtitle {
                text-align: center;
                margin-bottom: 30px;
                color: #64748b;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 30px;
              }
              th { 
                background-color: #e2e8f0; 
                padding: 8px; 
                text-align: left;
                border: 1px solid #94a3b8;
              }
              td { 
                padding: 8px; 
                border: 1px solid #94a3b8;
              }
              .company-header {
                text-align: center; 
                font-size: 18px;
                font-weight: bold; 
                padding: 10px; 
                background-color: #dbeafe;
                border: 1px solid #93c5fd;
              }
              .date-buyer-row {
                background-color: #f1f5f9;
              }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .total-row { 
                font-weight: bold; 
                background-color: #f1f5f9;
              }
              .page-break {
                page-break-after: always;
              }
              @media print {
                .no-break { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <h1>${companyName}</h1>
            <p class="subtitle">Purchase Records - Generated on ${new Date().toLocaleDateString()}</p>
      `);
      
      Object.entries(groupedData).forEach(([groupKey, groupPurchases], index) => {
        const [company, date, buyer] = groupKey.split('-');
        const formattedDate = new Date(date).toLocaleDateString();
        const grandTotal = groupPurchases.reduce((total, item) => total + item.totalPrice, 0);
        
        printWindow.document.write(`
          <div class="no-break">
            <table>
              <tr>
                <td colspan="5" class="company-header">${company}</td>
              </tr>
              <tr class="date-buyer-row">
                <td colspan="2">Date: ${formattedDate}</td>
                <td colspan="3" class="text-right">Buyer: ${buyer}</td>
              </tr>
              <tr>
                <th>Fish Name</th>
                <th class="text-center">Size (KG)</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Price/Unit</th>
                <th class="text-right">Total</th>
              </tr>
        `);
        
        groupPurchases.forEach(item => {
          printWindow.document.write(`
            <tr>
              <td>${item.fishName}</td>
              <td class="text-center">${item.sizeKg.toFixed(1)}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">$${item.pricePerUnit.toFixed(2)}</td>
              <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
            </tr>
          `);
        });
        
        printWindow.document.write(`
              <tr class="total-row">
                <td colspan="4" class="text-right">Grand Total:</td>
                <td class="text-right">$${grandTotal.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        `);
      });
      
      printWindow.document.write(`
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
