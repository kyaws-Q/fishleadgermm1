import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, File, Download } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { FishPurchase, ExportFormat, DateFilter } from "@/types";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExportButtonsProps {
  dateFilter?: DateFilter;
}

export function ExportButtons({ dateFilter }: ExportButtonsProps = {}) {
  const { purchases, companyName } = useApp();
  
  const handleExport = (format: ExportFormat) => {
    // Make a copy to avoid modifying the original
    let dataToExport = [...purchases]; 
    
    // Log original data for debugging
    console.log(`EXPORT DEBUG | Filter: ${dateFilter} | Total records: ${dataToExport.length}`);
    
    // Apply date filtering if it's not 'all'
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      const todayStr = formatDateString(today);
      
      console.log("Today's date (YYYY-MM-DD):", todayStr);
      
      // Debug first few items
      if (dataToExport.length > 0) {
        dataToExport.slice(0, 3).forEach(p => {
          console.log(`Item date: ${p.purchaseDate || p.date}, formatted: ${formatDateString(new Date(p.purchaseDate || p.date))}`);
        });
      }
      
      if (dateFilter === 'today') {
        dataToExport = dataToExport.filter(p => {
          // Get purchase date and format it consistently
          const purchaseDateObj = new Date(p.purchaseDate || p.date);
          const purchaseDateStr = formatDateString(purchaseDateObj);
          
          // Log for debugging
          console.log(`Comparing ${purchaseDateStr} === ${todayStr} | Result: ${purchaseDateStr === todayStr}`);
          
          // Keep only if it's today
          return purchaseDateStr === todayStr;
        });
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        dataToExport = dataToExport.filter(p => {
          const purchaseDate = new Date(p.purchaseDate || p.date);
          return purchaseDate >= weekAgo && purchaseDate <= today;
        });
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        dataToExport = dataToExport.filter(p => {
          const purchaseDate = new Date(p.purchaseDate || p.date);
          return purchaseDate >= monthAgo && purchaseDate <= today;
        });
      }
      
      console.log(`After filtering: ${dataToExport.length} records`);
    }
    
    if (dataToExport.length === 0) {
      toast.error("No purchase data matches your filter criteria");
      return;
    }
    
    // Start export process
    const loadingToastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);
    console.log(`Exporting ${dataToExport.length} records in ${format} format`);
    
    setTimeout(() => {
      switch (format) {
        case 'xlsx':
        case 'excel':
          exportToExcel(dataToExport, companyName, loadingToastId);
          break;
        case 'csv':
          exportToCSV(dataToExport, companyName, loadingToastId);
          break;
        case 'pdf':
          exportToPDF(dataToExport, companyName, loadingToastId);
          break;
        default:
          toast.error("Unsupported export format");
          toast.dismiss(loadingToastId);
      }
    }, 1000);
  };
  
  // Helper function to format dates consistently as YYYY-MM-DD
  const formatDateString = (date: Date): string => {
    if (isNaN(date.getTime())) return ""; // Handle invalid dates
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // Export to CSV function
  const exportToCSV = (data: FishPurchase[], companyName: string, loadingToastId?: string | number) => {
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
      
      // Dismiss loading toast
      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("CSV Export Error:", error);
      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Failed to export as CSV");
    }
  };
  
  // Export to Excel function with proper formatting
  const exportToExcel = (data: FishPurchase[], companyName: string, loadingToastId?: string | number) => {
    try {
      console.log("Starting Excel export with data:", data);
      
      if (!data || data.length === 0) {
        console.error("No data to export to Excel");
        if (loadingToastId !== undefined) {
          toast.dismiss(loadingToastId);
        }
        toast.error("No data to export");
        return;
      }

      // Create a new Excel workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = companyName;
      workbook.lastModifiedBy = companyName;
      workbook.created = new Date();
      workbook.modified = new Date();

      // Create a worksheet with compact margins for invoice-like appearance
      const worksheet = workbook.addWorksheet('Purchase Invoice', {
        pageSetup: {
          paperSize: 9, // A4 paper
          orientation: 'portrait',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.25,
            right: 0.25,
            top: 0.25,
            bottom: 0.25,
            header: 0.1,
            footer: 0.1
          }
        }
      });

      // Define columns exactly as in the picture
      worksheet.columns = [
        { header: 'NO', key: 'no', width: 4 },
        { header: 'ITEM', key: 'item', width: 12 },
        { header: 'DESCRIPTION', key: 'description', width: 13 },
        { header: 'NET KG PER MC', key: 'netKgPerMc', width: 12 },
        { header: 'QTY MC', key: 'qtyMc', width: 7 },
        { header: 'QTY KGS', key: 'qtyKgs', width: 8 },
        { header: 'PRICE (KG) FOR YNG', key: 'pricePerKg', width: 12 },
        { header: 'TOTAL USD AMOUNT', key: 'totalAmount', width: 14 }
      ];

      // Group fish purchases by fish name
      const fishTypes = [...new Set(data.map(item => item.fishName))];
      
      // Add company info above the COMMERCIAL INVOICE header
      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').value = 'AYAAN-YGN';
      worksheet.getCell('A1').font = { bold: true };
      
      worksheet.mergeCells('E1:H1');
      worksheet.getCell('E1').value = '1 Yr-AUG 23-JUL 2024';
      worksheet.getCell('E1').alignment = { horizontal: 'right' };
      
      // Add SH-JED and FSC info
      worksheet.mergeCells('A2:D2');
      worksheet.getCell('A2').value = 'SH-JED';
      
      worksheet.mergeCells('E2:H2');
      worksheet.getCell('E2').value = '06-11/SEP/Etd-06-11-23';
      worksheet.getCell('E2').alignment = { horizontal: 'right' };
      
      // Add additional reference
      worksheet.mergeCells('A3:D3');
      worksheet.getCell('A3').value = 'FSC-598364-7';
      
      // Add buyer info
      worksheet.mergeCells('A4:H4');
      const buyerName = data[0] && data[0].buyerName ? data[0].buyerName.toString() : 'CUSTOMER';
      worksheet.getCell('A4').value = `BUYER: ${buyerName}`;
      worksheet.getCell('A4').font = { bold: true, color: { argb: 'FF0000' } };
      
      // Add invoice header centered with underline
      worksheet.mergeCells('A5:H5');
      const titleCell = worksheet.getCell('A5');
      titleCell.value = 'COMMERCIAL INVOICE';
      titleCell.font = { bold: true, size: 14, underline: true };
      titleCell.alignment = { horizontal: 'center' };
      
      // Format the header row
      const headerRow = worksheet.getRow(6);
      headerRow.height = 20;
      
      // Explicitly set header values to ensure they appear
      headerRow.getCell(1).value = 'NO';
      headerRow.getCell(2).value = 'ITEM';
      headerRow.getCell(3).value = 'DESCRIPTION';
      headerRow.getCell(4).value = 'NET KG PER MC';
      headerRow.getCell(5).value = 'QTY MC';
      headerRow.getCell(6).value = 'QTY KGS';
      headerRow.getCell(7).value = 'PRICE (KG) FOR YNG';
      headerRow.getCell(8).value = 'TOTAL USD AMOUNT';
      
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EFEFEF' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      
      // Initialize variables
      let currentRow = 7;
      let itemNumber = 1;
      let grandTotal = 0;
      
      // Process each fish type as a group
      fishTypes.forEach(fishType => {
        const fishItems = data.filter(p => p.fishName === fishType);
        
        if (fishItems.length === 0) return;
        
        let fishTypeRow = currentRow;
        worksheet.getCell(`A${fishTypeRow}`).value = itemNumber;
        worksheet.getCell(`B${fishTypeRow}`).value = fishType;
        itemNumber++;
        
        // Add all sizes for this fish type
        let subTotal = 0;
        let rowCount = 0;
        
        fishItems.forEach(item => {
          const description = `${item.sizeKg} UP`;
          const netKgPerMc = Math.round(item.sizeKg * 20);
          const qtyMc = item.quantity;
          const qtyKgs = netKgPerMc * qtyMc;
          const pricePerKg = item.pricePerUnit;
          const totalAmount = qtyKgs * pricePerKg;
          
          // Skip the first row as we've already added the fish type
          if (rowCount > 0) {
            worksheet.getCell(`A${currentRow}`).value = '';
            worksheet.getCell(`B${currentRow}`).value = '';
          }
          
          worksheet.getCell(`C${currentRow}`).value = description;
          worksheet.getCell(`D${currentRow}`).value = netKgPerMc;
          worksheet.getCell(`E${currentRow}`).value = qtyMc;
          worksheet.getCell(`F${currentRow}`).value = qtyKgs;
          worksheet.getCell(`G${currentRow}`).value = pricePerKg;
          worksheet.getCell(`H${currentRow}`).value = totalAmount;
          
          // Format cells
          worksheet.getCell(`D${currentRow}`).numFmt = '0';
          worksheet.getCell(`E${currentRow}`).numFmt = '0';
          worksheet.getCell(`F${currentRow}`).numFmt = '0.00';
          worksheet.getCell(`G${currentRow}`).numFmt = '0.00';
          worksheet.getCell(`H${currentRow}`).numFmt = '0.00';
          
          // Align text/numbers
          worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
          worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'center' };
          worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'center' };
          worksheet.getCell(`F${currentRow}`).alignment = { horizontal: 'right' };
          worksheet.getCell(`G${currentRow}`).alignment = { horizontal: 'right' };
          worksheet.getCell(`H${currentRow}`).alignment = { horizontal: 'right' };
          
          // Add borders to all cells in the row
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
            worksheet.getCell(`${col}${currentRow}`).border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
          
          subTotal += totalAmount;
          currentRow++;
          rowCount++;
        });
        
        // Add subtotal row
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        worksheet.getCell(`A${currentRow}`).value = 'Sub Total';
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        
        // Format subtotal row with gray background
        ['A', 'F', 'G', 'H'].forEach(col => {
          worksheet.getCell(`${col}${currentRow}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'EFEFEF' }
          };
          worksheet.getCell(`${col}${currentRow}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        
        // Calculate and add the subtotal for this fish type
        const totalQtyKgs = fishItems.reduce((total, item) => {
          const netKgPerMc = Math.round(item.sizeKg * 20);
          return total + (netKgPerMc * item.quantity);
        }, 0);
        
        worksheet.getCell(`F${currentRow}`).value = totalQtyKgs;
        worksheet.getCell(`F${currentRow}`).numFmt = '0.00';
        worksheet.getCell(`F${currentRow}`).alignment = { horizontal: 'right' };
        worksheet.getCell(`F${currentRow}`).font = { bold: true };
        worksheet.getCell(`F${currentRow}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        worksheet.getCell(`G${currentRow}`).value = '';
        worksheet.getCell(`G${currentRow}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        worksheet.getCell(`H${currentRow}`).value = subTotal;
        worksheet.getCell(`H${currentRow}`).numFmt = '0.00';
        worksheet.getCell(`H${currentRow}`).alignment = { horizontal: 'right' };
        worksheet.getCell(`H${currentRow}`).font = { bold: true };
        worksheet.getCell(`H${currentRow}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        grandTotal += subTotal;
        currentRow++; // Move to next row after subtotal
      });
      
      // Add grand total row
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'Grand Total';
      worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`A${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0' } // Light red color like in the image
      };
      worksheet.getCell(`A${currentRow}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      worksheet.getCell(`H${currentRow}`).value = grandTotal;
      worksheet.getCell(`H${currentRow}`).numFmt = '0.00';
      worksheet.getCell(`H${currentRow}`).alignment = { horizontal: 'right' };
      worksheet.getCell(`H${currentRow}`).font = { bold: true, color: { argb: 'FF0000' } }; // Red color like in the image
      worksheet.getCell(`H${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0' } // Light red color like in the image
      };
      worksheet.getCell(`H${currentRow}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Set row heights to be compact
      for (let i = 7; i < currentRow; i++) {
        worksheet.getRow(i).height = 16; // Compact row height
      }
      
      // Generate Excel File
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${companyName.replace(/\s+/g, '_')}_Invoice_${new Date().toISOString().split('T')[0]}.xlsx`;
        saveAs(blob, fileName);
        
        // Dismiss loading toast and show success
        if (loadingToastId !== undefined) {
          toast.dismiss(loadingToastId);
        }
        toast.success("Excel invoice downloaded successfully");
      }).catch(err => {
        console.error("Error generating Excel buffer:", err);
        if (loadingToastId !== undefined) {
          toast.dismiss(loadingToastId);
        }
        toast.error("Error generating Excel file");
      });

    } catch (error) {
      console.error("Excel Export Error:", error);
      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Failed to export as Excel");
    }
  };
  
  // Export to PDF function to match the Excel format exactly
  const exportToPDF = (data: FishPurchase[], companyName: string, loadingToastId?: string | number) => {
    try {
      if (!data || data.length === 0) {
        console.error("No data to export to PDF");
        if (loadingToastId !== undefined) {
          toast.dismiss(loadingToastId);
        }
        toast.error("No data to export");
        return;
      }
      
      // Group fish purchases by fish name
      const fishTypes = [...new Set(data.map(item => item.fishName))];
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        if (loadingToastId !== undefined) {
          toast.dismiss(loadingToastId);
        }
        toast.error("Please allow pop-ups to download PDF");
        return;
      }
      
      // Basic HTML with table styling to match Excel format
      printWindow.document.write(`
        <html>
          <head>
            <title>${companyName} - Commercial Invoice</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 10px;
                font-size: 11px;
              }
              .invoice-title { 
                text-align: center; 
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
                text-decoration: underline;
              }
              .company-info {
                margin-bottom: 5px;
              }
              .company-name {
                float: left;
                font-weight: bold;
                width: 60%;
              }
              .date-info {
                float: right;
                text-align: right;
                width: 40%;
              }
              .reference-info {
                clear: both;
                margin-bottom: 5px;
              }
              .reference-left {
                float: left;
                width: 60%;
              }
              .reference-right {
                float: right;
                text-align: right;
                width: 40%;
              }
              .buyer-info {
                margin-bottom: 10px;
                font-weight: bold;
                color: red;
                clear: both;
              }
              .clear {
                clear: both;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 15px;
                font-size: 10px;
              }
              th { 
                background-color: #EFEFEF; 
                padding: 5px; 
                text-align: center;
                border: 1px solid #000;
                font-weight: bold;
                font-size: 10px;
              }
              td { 
                padding: 3px; 
                border: 1px solid #000;
                height: 16px;
              }
              .center-align { text-align: center; }
              .right-align { text-align: right; }
              .sub-total {
                background-color: #EFEFEF;
                font-weight: bold;
              }
              .grand-total {
                background-color: #FFC0C0;
                font-weight: bold;
              }
              .grand-total-value {
                color: red;
                font-weight: bold;
                background-color: #FFC0C0;
              }
              .no-break { page-break-inside: avoid; }
            </style>
          </head>
          <body>
            <div class="company-info">
              <div class="company-name">AYAAN-YGN</div>
              <div class="date-info">1 Yr-AUG 23-JUL 2024</div>
              <div class="clear"></div>
            </div>
            
            <div class="reference-info">
              <div class="reference-left">SH-JED</div>
              <div class="reference-right">06-11/SEP/Etd-06-11-23</div>
              <div class="clear"></div>
            </div>
            
            <div class="reference-info">
              <div class="reference-left">FSC-598364-7</div>
              <div class="clear"></div>
            </div>
            
            <div class="buyer-info">BUYER: ${data[0] && data[0].buyerName ? data[0].buyerName.toString() : 'CUSTOMER'}</div>
            
            <div class="invoice-title">COMMERCIAL INVOICE</div>
            
            <table>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>ITEM</th>
                  <th>DESCRIPTION</th>
                  <th>NET KG PER MC</th>
                  <th>QTY MC</th>
                  <th>QTY KGS</th>
                  <th>PRICE (KG) FOR YNG</th>
                  <th>TOTAL USD AMOUNT</th>
                </tr>
              </thead>
              <tbody>
      `);
      
      let itemNumber = 1;
      let grandTotal = 0;
      
      // Process each fish type as a group
      fishTypes.forEach(fishType => {
        const fishItems = data.filter(p => p.fishName === fishType);
        
        if (fishItems.length === 0) return;
        
        printWindow.document.write(`
          <tr class="no-break">
            <td>${itemNumber}</td>
            <td>${fishType}</td>
        `);
        
        let rowsPrinted = 0;
        let subTotal = 0;
        
        fishItems.forEach((item, index) => {
          const description = `${item.sizeKg} UP`;
          const netKgPerMc = Math.round(item.sizeKg * 20);
          const qtyMc = item.quantity;
          const qtyKgs = netKgPerMc * qtyMc;
          const pricePerKg = item.pricePerUnit;
          const totalAmount = qtyKgs * pricePerKg;
          
          if (index === 0) {
            // First row already started
            printWindow.document.write(`
              <td class="center-align">${description}</td>
              <td class="center-align">${netKgPerMc}</td>
              <td class="center-align">${qtyMc}</td>
              <td class="right-align">${qtyKgs.toFixed(2)}</td>
              <td class="right-align">${pricePerKg.toFixed(2)}</td>
              <td class="right-align">${totalAmount.toFixed(2)}</td>
            </tr>
            `);
          } else {
            // Additional rows
            printWindow.document.write(`
              <tr>
                <td></td>
                <td></td>
                <td class="center-align">${description}</td>
                <td class="center-align">${netKgPerMc}</td>
                <td class="center-align">${qtyMc}</td>
                <td class="right-align">${qtyKgs.toFixed(2)}</td>
                <td class="right-align">${pricePerKg.toFixed(2)}</td>
                <td class="right-align">${totalAmount.toFixed(2)}</td>
              </tr>
            `);
          }
          
          subTotal += totalAmount;
          rowsPrinted++;
        });
        
        // Calculate total quantity for this group
        const totalQtyKgs = fishItems.reduce((total, item) => {
          const netKgPerMc = Math.round(item.sizeKg * 20);
          return total + (netKgPerMc * item.quantity);
        }, 0);
        
        // Add subtotal row
        printWindow.document.write(`
          <tr class="no-break">
            <td colspan="5" class="sub-total right-align">Sub Total</td>
            <td class="sub-total right-align">${totalQtyKgs.toFixed(2)}</td>
            <td class="sub-total"></td>
            <td class="sub-total right-align">${subTotal.toFixed(2)}</td>
          </tr>
        `);
        
        grandTotal += subTotal;
        itemNumber++;
      });
      
      // Add grand total row
      printWindow.document.write(`
              <tr>
                <td colspan="7" class="grand-total right-align">Grand Total</td>
                <td class="grand-total-value right-align">${grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
      `);
      
      printWindow.document.write(`
          </body>
        </html>
      `);
      
      // Print to PDF
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          // Dismiss loading toast and show success
          if (loadingToastId !== undefined) {
            toast.dismiss(loadingToastId);
          }
          toast.success("PDF ready for download");
        }, 500);
      };
    } catch (error) {
      console.error("PDF Export Error:", error);
      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Failed to export as PDF");
    }
  };
  
  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        variant="outline" 
        onClick={() => handleExport('excel')}
        className="flex items-center"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export to Excel
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => handleExport('csv')}
        className="flex items-center"
      >
        <FileText className="mr-2 h-4 w-4" />
        Export to CSV
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => handleExport('pdf')}
        className="flex items-center"
      >
        <File className="mr-2 h-4 w-4" />
        Export to PDF
      </Button>
    </div>
  );
}