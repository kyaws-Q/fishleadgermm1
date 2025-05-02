
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FishPurchase } from '@/types';

// Function to export fish purchase data to Excel
export const exportToExcel = async (data: FishPurchase[], fileName: string = 'fish-purchases') => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Fish Purchases');
  
  // Set A4 paper size and properties
  sheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    fitToPage: true,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.4,
      bottom: 0.4,
      header: 0.2,
      footer: 0.2
    }
  };
  
  // Define columns to match A4 printable area width
  sheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Buyer', key: 'buyer', width: 20 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Fish Type', key: 'fish', width: 20 },
    { header: 'Size (kg)', key: 'size', width: 10 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Unit Price ($)', key: 'price', width: 14 },
    { header: 'Total ($)', key: 'total', width: 14 },
  ];
  
  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Add data rows
  data.forEach(item => {
    const row = sheet.addRow({
      date: item.purchaseDate || item.date,
      buyer: item.buyerName,
      company: item.companyName,
      fish: item.fishName,
      size: item.sizeKg,
      quantity: item.quantity,
      price: item.pricePerUnit,
      total: item.totalPrice || item.total,
    });
    
    // Apply consistent font size
    row.font = { size: 11 };
    
    // Add borders to all cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Format currency cells
    const priceCell = row.getCell('price');
    priceCell.numFmt = '"$"#,##0.00';
    
    const totalCell = row.getCell('total');
    totalCell.numFmt = '"$"#,##0.00';
  });
  
  // Freeze the header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Save the file using file-saver
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};
