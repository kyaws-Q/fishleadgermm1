
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FishPurchase } from '@/types';
import { format } from 'date-fns';
import { ShipmentWithEntries } from '@/types/shipment';
import { toast } from 'sonner';

export const exportPurchasesToExcel = async (purchases: FishPurchase[], companyName: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Purchases');

  // Configure for A4 paper size
  sheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2,
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  // Set fixed width columns that match A4 printable area
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Company Name', key: 'companyName', width: 15 },
    { header: 'Buyer Name', key: 'buyerName', width: 15 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Fish Name', key: 'fishName', width: 15 },
    { header: 'Size', key: 'size', width: 8 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Price per Unit', key: 'pricePerUnit', width: 12 },
    { header: 'Total', key: 'total', width: 10 },
  ];

  // Add headers
  const headerRow = sheet.addRow([
    'ID',
    'Company Name',
    'Buyer Name',
    'Date',
    'Fish Name',
    'Size',
    'Quantity',
    'Price per Unit',
    'Total',
  ]);

  // Style header row
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Add data rows with "up" format for size
  purchases.forEach((purchase) => {
    // Convert numeric size to "up" format
    const sizeValue = typeof purchase.sizeKg === 'number' ? 
      `${purchase.sizeKg} up` : 
      purchase.sizeKg;
    
    const row = sheet.addRow([
      purchase.id,
      purchase.companyName,
      purchase.buyerName,
      purchase.date,
      purchase.fishName,
      sizeValue,
      purchase.quantity,
      purchase.pricePerUnit,
      purchase.total,
    ]);
    
    // Set alignment for each cell
    row.eachCell((cell, colNumber) => {
      // Set alignment based on column content type
      if (colNumber === 1) { // ID
        cell.alignment = { horizontal: 'center' };
      } else if ([2, 3, 5].includes(colNumber)) { // Company, Buyer, Fish - text columns
        cell.alignment = { horizontal: 'left' };
      } else if (colNumber === 4) { // Date
        cell.alignment = { horizontal: 'center' };
      } else if (colNumber === 6) { // Size
        cell.alignment = { horizontal: 'center' };
      } else { // Quantity, Price, Total - numeric columns
        cell.alignment = { horizontal: 'right' };
      }
      
      // Add border to each cell
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  try {
    toast.loading("Preparing Excel export...");
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileDate = format(new Date(), 'yyyyMMdd_HHmmss');
    saveAs(new Blob([buffer]), `${companyName}_purchases_${fileDate}.xlsx`);
    
    toast.dismiss();
    toast.success("Excel file downloaded successfully");
  } catch (error) {
    console.error("Error generating Excel file:", error);
    toast.dismiss();
    toast.error("Failed to generate Excel file");
  }
};

export const exportShipmentToExcel = async (shipment: ShipmentWithEntries) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Shipment Invoice');
  
  try {
    toast.loading("Preparing Excel export...");
    
    // Configure for A4 paper size
    sheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };
    
    // Set fixed width columns that match A4 printable area
    sheet.columns = [
      { header: 'Item', key: 'item', width: 8 },
      { header: 'Fish Type', key: 'fish', width: 18 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Size', key: 'size', width: 10 },
      { header: 'Price per Unit', key: 'price', width: 14 },
      { header: 'Total', key: 'total', width: 14 },
    ];
    
    // Add header with company and shipment details
    sheet.addRow([]).height = 20;
    const titleRow = sheet.addRow(['SHIPMENT INVOICE']);
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: 'center' };
    sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
    
    sheet.addRow([]).height = 10;
    
    // Add shipment details
    sheet.addRow([`Tracking Number: ${shipment.shipment.tracking_number || 'N/A'}`]);
    sheet.mergeCells(`A${sheet.rowCount}:F${sheet.rowCount}`);
    
    sheet.addRow([`Date: ${format(new Date(shipment.shipment.date), 'dd/MM/yyyy')}`]);
    sheet.mergeCells(`A${sheet.rowCount}:F${sheet.rowCount}`);
    
    sheet.addRow([`Status: ${shipment.shipment.status || 'N/A'}`]);
    sheet.mergeCells(`A${sheet.rowCount}:F${sheet.rowCount}`);
    
    sheet.addRow([`Buyer: ${shipment.shipment.buyerName || 'N/A'}`]);
    sheet.mergeCells(`A${sheet.rowCount}:F${sheet.rowCount}`);
    
    sheet.addRow([`Shipping Line: ${shipment.shipment.shipping_line || 'N/A'}`]);
    sheet.mergeCells(`A${sheet.rowCount}:F${sheet.rowCount}`);
    
    sheet.addRow([`Route: ${shipment.shipment.route || 'N/A'}`]);
    sheet.mergeCells(`A${sheet.rowCount}:F${sheet.rowCount}`);
    
    sheet.addRow([]).height = 10;
    
    // Add column headers with styling
    const headerRow = sheet.addRow(['Item', 'Fish Type', 'Quantity', 'Size (up)', 'Price per Unit', 'Total']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    
    // Add items - convert fish size to "up" format
    if (shipment.entries && shipment.entries.length > 0) {
      shipment.entries.forEach((entry, index) => {
        // Convert size to "up" format
        const sizeFormatted = `${entry.netKgPerMc} up`;
        
        const row = sheet.addRow([
          index + 1,
          entry.fishName,
          entry.qtyMc,
          sizeFormatted,
          entry.pricePerKg.toFixed(2),
          (entry.qtyMc * entry.netKgPerMc * entry.pricePerKg).toFixed(2)
        ]);
        
        // Set alignment for each cell
        row.eachCell((cell, colNumber) => {
          if (colNumber === 1) { // Item number
            cell.alignment = { horizontal: 'center' };
          } else if (colNumber === 2) { // Fish type
            cell.alignment = { horizontal: 'left' };
          } else if ([3, 4].includes(colNumber)) { // Quantity, Size
            cell.alignment = { horizontal: 'center' };
          } else { // Price, Total
            cell.alignment = { horizontal: 'right' };
          }
          
          // Add border to each cell
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Add total row
      const totalAmount = shipment.entries.reduce((sum, entry) => 
        sum + (entry.qtyMc * entry.netKgPerMc * entry.pricePerKg), 0);
      
      sheet.addRow([]);
      const totalRow = sheet.addRow([
        '',
        '',
        '',
        '',
        'Total:',
        totalAmount.toFixed(2)
      ]);
      totalRow.font = { bold: true };
      totalRow.getCell(5).alignment = { horizontal: 'right' };
      totalRow.getCell(6).alignment = { horizontal: 'right' };
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber > 4) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'double' },
            right: { style: 'thin' }
          };
        }
      });
    } else {
      sheet.addRow(['No items in this shipment']);
    }
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileDate = format(new Date(), 'yyyyMMdd_HHmmss');
    saveAs(new Blob([buffer]), `shipment_${fileDate}.xlsx`);
    toast.dismiss();
    toast.success("Excel file downloaded successfully");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    toast.dismiss();
    toast.error("Failed to export to Excel");
  }
};
