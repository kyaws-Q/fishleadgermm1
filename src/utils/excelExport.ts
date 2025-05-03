
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FishPurchase } from '@/types';
import { format } from 'date-fns';
import { ShipmentWithEntries } from '@/types/shipment';
import { toast } from 'sonner';

export const exportPurchasesToExcel = async (purchases: FishPurchase[], companyName: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Purchases');

  // Add headers
  sheet.addRow([
    'ID',
    'Company Name',
    'Buyer Name',
    'Date',
    'Fish Name',
    'Size (kg)',
    'Quantity',
    'Price per Unit',
    'Total',
  ]);

  // Add data rows
  purchases.forEach((purchase) => {
    sheet.addRow([
      purchase.id,
      purchase.companyName,
      purchase.buyerName,
      purchase.date,
      purchase.fishName,
      purchase.sizeKg,
      purchase.quantity,
      purchase.pricePerUnit,
      purchase.total,
    ]);
  });

  // Format as table
  sheet.addTable({
    name: 'PurchasesTable',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true,
    },
    columns: [
      { name: 'ID', filterButton: true },
      { name: 'Company Name', filterButton: true },
      { name: 'Buyer Name', filterButton: true },
      { name: 'Date', filterButton: true },
      { name: 'Fish Name', filterButton: true },
      { name: 'Size (kg)', filterButton: true },
      { name: 'Quantity', filterButton: true },
      { name: 'Price per Unit', filterButton: true },
      { name: 'Total', filterButton: true },
    ],
    rows: purchases.map((purchase) => [
      purchase.id,
      purchase.companyName,
      purchase.buyerName,
      purchase.date,
      purchase.fishName,
      purchase.sizeKg,
      purchase.quantity,
      purchase.pricePerUnit,
      purchase.total,
    ]),
  });

  // Auto-size columns
  sheet.columns.forEach((column) => {
    const excelColumn = column as ExcelJS.Column;
    excelColumn.width = 15;
  });

  try {
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileDate = format(new Date(), 'yyyyMMdd_HHmmss');
    saveAs(new Blob([buffer]), `${companyName}_purchases_${fileDate}.xlsx`);
    toast.success("Excel file downloaded successfully");
  } catch (error) {
    console.error("Error generating Excel file:", error);
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
      }
    };
    
    // Set fixed width columns that match A4 printable area
    sheet.columns = [
      { header: 'Item', key: 'item', width: 8 },
      { header: 'Fish Type', key: 'fish', width: 18 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Size (kg)', key: 'size', width: 10 },
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
    const headerRow = sheet.addRow(['Item', 'Fish Type', 'Quantity', 'Size (kg)', 'Price per Unit', 'Total']);
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
    });
    
    // Add items
    if (shipment.entries && shipment.entries.length > 0) {
      shipment.entries.forEach((entry, index) => {
        const row = sheet.addRow([
          index + 1,
          entry.fishName,
          entry.qtyMc,
          entry.netKgPerMc,
          entry.pricePerKg.toFixed(2),
          (entry.qtyMc * entry.netKgPerMc * entry.pricePerKg).toFixed(2)
        ]);
        
        // Add border to each cell
        row.eachCell((cell) => {
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
    toast.success("Excel file downloaded successfully");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    toast.error("Failed to export to Excel");
  }
};
