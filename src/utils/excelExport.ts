
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FishPurchase } from '@/types';
import { ShipmentWithDetails } from '@/types/shipment';

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

// Function to export shipment data to Excel
export const exportShipmentToExcel = async (shipmentData: ShipmentWithDetails, companyName: string) => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Shipment Invoice');
  
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
  
  // Company header
  sheet.mergeCells('A1:H1');
  const companyHeader = sheet.getCell('A1');
  companyHeader.value = companyName;
  companyHeader.font = { size: 16, bold: true };
  companyHeader.alignment = { horizontal: 'center' };
  
  // Invoice title
  sheet.mergeCells('A3:H3');
  const invoiceTitle = sheet.getCell('A3');
  invoiceTitle.value = 'COMMERCIAL INVOICE';
  invoiceTitle.font = { size: 14, bold: true };
  invoiceTitle.alignment = { horizontal: 'center' };
  
  // Add shipment information
  sheet.mergeCells('A5:D5');
  sheet.getCell('A5').value = 'Buyer:';
  sheet.getCell('A5').font = { bold: true };
  
  sheet.mergeCells('E5:H5');
  sheet.getCell('E5').value = 'Shipment Details:';
  sheet.getCell('E5').font = { bold: true };
  
  sheet.mergeCells('A6:D6');
  sheet.getCell('A6').value = shipmentData.buyer?.name || 'N/A';
  
  sheet.mergeCells('E6:F6');
  sheet.getCell('E6').value = 'Date:';
  sheet.getCell('E6').font = { bold: true };
  
  sheet.mergeCells('G6:H6');
  sheet.getCell('G6').value = new Date(shipmentData.shipment.shipment_date).toLocaleDateString();
  
  sheet.mergeCells('A7:D7');
  sheet.getCell('A7').value = shipmentData.buyer?.address || '';
  
  sheet.mergeCells('E7:F7');
  sheet.getCell('E7').value = 'Container:';
  sheet.getCell('E7').font = { bold: true };
  
  sheet.mergeCells('G7:H7');
  sheet.getCell('G7').value = shipmentData.shipment.container_number || shipmentData.shipment.tracking_number || 'N/A';
  
  // Add table headers - row 9
  const headerRow = sheet.getRow(9);
  sheet.getCell('A9').value = 'Fish Type';
  sheet.getCell('B9').value = 'Description';
  sheet.getCell('C9').value = 'Net Kg/MC';
  sheet.getCell('D9').value = 'Qty MC';
  sheet.getCell('E9').value = 'Total Kg';
  sheet.getCell('F9').value = 'Unit Price';
  sheet.getCell('G9').value = 'Total USD';
  // Bold headers
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11 };
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
    cell.alignment = { horizontal: 'center' };
  });
  
  // Add data rows starting from row 10
  let rowIndex = 10;
  let totalAmount = 0;
  
  // Check if we have grouped_entries (preferred) or regular entries
  if (shipmentData.grouped_entries && shipmentData.grouped_entries.length > 0) {
    // Use grouped entries
    shipmentData.grouped_entries.forEach(group => {
      const fishNameRow = sheet.getRow(rowIndex);
      sheet.mergeCells(`A${rowIndex}:G${rowIndex}`);
      sheet.getCell(`A${rowIndex}`).value = `${group.fish_name}`;
      fishNameRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11, color: { argb: '000000FF' } };
      });
      rowIndex++;
      
      // Add entries for this fish type
      group.entries.forEach(entry => {
        const dataRow = sheet.getRow(rowIndex);
        sheet.getCell(`A${rowIndex}`).value = entry.fish_name;
        sheet.getCell(`B${rowIndex}`).value = entry.description || '';
        sheet.getCell(`C${rowIndex}`).value = entry.net_kg_per_mc;
        sheet.getCell(`D${rowIndex}`).value = entry.qty_mc;
        sheet.getCell(`E${rowIndex}`).value = entry.qty_kgs;
        sheet.getCell(`F${rowIndex}`).value = entry.price_per_kg;
        sheet.getCell(`G${rowIndex}`).value = entry.total_usd;
        
        // Format cells
        dataRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.font = { size: 11 };
        });
        
        // Format numeric cells
        sheet.getCell(`F${rowIndex}`).numFmt = '"$"#,##0.00';
        sheet.getCell(`G${rowIndex}`).numFmt = '"$"#,##0.00';
        
        rowIndex++;
      });
      
      // Add subtotal for this fish type
      const subtotalRow = sheet.getRow(rowIndex);
      sheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
      sheet.getCell(`A${rowIndex}`).value = `${group.fish_name} Subtotal:`;
      sheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'right' };
      sheet.getCell(`A${rowIndex}`).font = { bold: true, size: 11 };
      sheet.getCell(`G${rowIndex}`).value = group.total_usd;
      sheet.getCell(`G${rowIndex}`).numFmt = '"$"#,##0.00';
      sheet.getCell(`G${rowIndex}`).font = { bold: true, size: 11 };
      sheet.getCell(`G${rowIndex}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      totalAmount += group.total_usd;
      rowIndex += 2; // Skip a row between fish types
    });
  } else if (shipmentData.entries && shipmentData.entries.length > 0) {
    // Use regular entries directly
    shipmentData.entries.forEach(entry => {
      const dataRow = sheet.getRow(rowIndex);
      sheet.getCell(`A${rowIndex}`).value = entry.fish_name;
      sheet.getCell(`B${rowIndex}`).value = entry.description || '';
      sheet.getCell(`C${rowIndex}`).value = entry.net_kg_per_mc;
      sheet.getCell(`D${rowIndex}`).value = entry.qty_mc;
      sheet.getCell(`E${rowIndex}`).value = entry.qty_kgs;
      sheet.getCell(`F${rowIndex}`).value = entry.price_per_kg;
      sheet.getCell(`G${rowIndex}`).value = entry.total_usd;
      
      // Format cells
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Format numeric cells
      sheet.getCell(`F${rowIndex}`).numFmt = '"$"#,##0.00';
      sheet.getCell(`G${rowIndex}`).numFmt = '"$"#,##0.00';
      
      totalAmount += entry.total_usd;
      rowIndex++;
    });
  }
  
  // Add grand total
  const grandTotalRow = sheet.getRow(rowIndex + 1);
  sheet.mergeCells(`A${rowIndex + 1}:F${rowIndex + 1}`);
  sheet.getCell(`A${rowIndex + 1}`).value = 'GRAND TOTAL:';
  sheet.getCell(`A${rowIndex + 1}`).alignment = { horizontal: 'right' };
  sheet.getCell(`A${rowIndex + 1}`).font = { bold: true, size: 12 };
  
  sheet.getCell(`G${rowIndex + 1}`).value = shipmentData.grand_total || totalAmount;
  sheet.getCell(`G${rowIndex + 1}`).numFmt = '"$"#,##0.00';
  sheet.getCell(`G${rowIndex + 1}`).font = { bold: true, size: 12 };
  sheet.getCell(`G${rowIndex + 1}`).border = {
    top: { style: 'double' },
    left: { style: 'thin' },
    bottom: { style: 'double' },
    right: { style: 'thin' }
  };
  
  // Set column widths
  sheet.columns = [
    { width: 15 }, // Fish Type
    { width: 15 }, // Description
    { width: 10 }, // Net Kg/MC
    { width: 10 }, // Qty MC
    { width: 10 }, // Total Kg
    { width: 12 }, // Unit Price
    { width: 12 }, // Total USD
  ];
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Get the shipment date for the filename
  const shipmentDate = new Date(shipmentData.shipment.shipment_date).toISOString().split('T')[0];
  const buyerName = (shipmentData.buyer?.name || 'Unknown').replace(/\s+/g, '-');
  
  // Save the file using file-saver
  saveAs(new Blob([buffer]), `shipment-${buyerName}-${shipmentDate}.xlsx`);
};
