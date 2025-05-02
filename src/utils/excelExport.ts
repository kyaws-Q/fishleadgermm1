
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FishPurchase } from '@/types';
import { format } from 'date-fns';
import { ShipmentWithEntries } from '@/types/shipment';

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

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileDate = format(new Date(), 'yyyyMMdd_HHmmss');
  saveAs(new Blob([buffer]), `${companyName}_purchases_${fileDate}.xlsx`);
};

export const exportShipmentToExcel = async (shipment: ShipmentWithEntries) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Shipment Invoice');
  
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
  
  // Set columns with fixed widths to match A4 printable area
  sheet.columns = [
    { header: 'Item', key: 'item', width: 10 },
    { header: 'Fish Type', key: 'fish', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Size (kg)', key: 'size', width: 10 },
    { header: 'Price per Unit', key: 'price', width: 15 },
    { header: 'Total', key: 'total', width: 15 },
  ];
  
  // Add header with company and shipment details
  sheet.addRow([]).height = 20;
  sheet.addRow(['SHIPMENT INVOICE']).font = { bold: true, size: 16 };
  sheet.addRow([]).height = 10;
  sheet.addRow([`Tracking Number: ${shipment.shipment.tracking_number || 'N/A'}`]);
  sheet.addRow([`Date: ${format(new Date(shipment.shipment.date), 'dd/MM/yyyy')}`]);
  sheet.addRow([`Status: ${shipment.shipment.status || 'N/A'}`]);
  sheet.addRow([`Buyer: ${shipment.shipment.buyerName || 'N/A'}`]);
  sheet.addRow([`Shipping Line: ${shipment.shipment.shipping_line || 'N/A'}`]);
  sheet.addRow([`Route: ${shipment.shipment.route || 'N/A'}`]);
  sheet.addRow([]).height = 10;
  
  // Add items
  if (shipment.entries && shipment.entries.length > 0) {
    shipment.entries.forEach((entry, index) => {
      sheet.addRow({
        item: index + 1,
        fish: entry.fishName,
        quantity: entry.qtyMc,
        size: entry.netKgPerMc,
        price: `$${entry.pricePerKg.toFixed(2)}`,
        total: `$${(entry.qtyMc * entry.netKgPerMc * entry.pricePerKg).toFixed(2)}`
      });
    });
    
    // Add total row
    const totalAmount = shipment.entries.reduce((sum, entry) => 
      sum + (entry.qtyMc * entry.netKgPerMc * entry.pricePerKg), 0);
    
    sheet.addRow([]);
    const totalRow = sheet.addRow({
      item: '',
      fish: '',
      quantity: '',
      size: '',
      price: 'Total:',
      total: `$${totalAmount.toFixed(2)}`
    });
    totalRow.font = { bold: true };
  } else {
    sheet.addRow(['No items in this shipment']);
  }
  
  // Apply styling to header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileDate = format(new Date(), 'yyyyMMdd_HHmmss');
  saveAs(new Blob([buffer]), `shipment_${fileDate}.xlsx`);
};
