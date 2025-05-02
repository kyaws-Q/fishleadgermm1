import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ShipmentWithDetails } from "@/types";

export async function exportShipmentToExcel(shipmentData: ShipmentWithDetails, companyName: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Fish Shipment");

  // Set column widths
  sheet.columns = [
    { header: 'NO.', key: 'no', width: 5 },
    { header: 'ITEM', key: 'item', width: 15 },
    { header: 'DESCRIPTION', key: 'description', width: 15 },
    { header: 'NET KG/MC', key: 'netKgPerMc', width: 12 },
    { header: 'QTY MC', key: 'qtyMc', width: 10 },
    { header: 'QTY KGS', key: 'qtyKgs', width: 12 },
    { header: 'PRICE/KG', key: 'pricePerKg', width: 12 },
    { header: 'TOTAL USD', key: 'totalUsd', width: 15 },
  ];

  // Company header
  const companyRow = sheet.addRow([companyName]);
  companyRow.height = 30;
  companyRow.font = { bold: true, size: 16 };
  sheet.mergeCells(`A1:H1`);
  companyRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Date and buyer info
  const dateRow = sheet.addRow([`Date: ${new Date(shipmentData.shipment.shipment_date).toLocaleDateString()}`]);
  sheet.mergeCells(`A2:D2`);
  dateRow.font = { bold: true };
  
  const buyerRow = sheet.addRow([`Buyer: ${shipmentData.buyer.name}`]);
  sheet.mergeCells(`A3:D3`);
  buyerRow.font = { bold: true };
  
  if (shipmentData.shipment.container_number) {
    const containerRow = sheet.addRow([`Container: ${shipmentData.shipment.container_number}`]);
    sheet.mergeCells(`A4:D4`);
    containerRow.font = { bold: true };
  }

  // Add a blank row
  sheet.addRow([]);

  // Add headers with styling
  const headerRow = sheet.addRow(sheet.columns.map(col => col.header));
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Blue color
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add data rows grouped by fish name
  let rowNumber = 1;
  shipmentData.grouped_entries.forEach((group) => {
    group.entries.forEach((entry) => {
      const row = sheet.addRow({
        no: rowNumber,
        item: entry.fish_name,
        description: entry.description || '',
        netKgPerMc: entry.net_kg_per_mc,
        qtyMc: entry.qty_mc,
        qtyKgs: entry.qty_kgs,
        pricePerKg: entry.price_per_kg,
        totalUsd: entry.total_usd
      });
      
      // Add styling to data rows
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Align numbers to the right
        if (typeof cell.value === 'number') {
          cell.alignment = { horizontal: 'right' };
          
          // Format currency cells
          if (cell.column === 7 || cell.column === 8) {
            cell.numFmt = '$#,##0.00';
          }
        }
      });
      
      rowNumber++;
    });
    
    // Add subtotal for each group
    const subtotalRow = sheet.addRow({
      no: '',
      item: `Subtotal - ${group.fish_name}`,
      description: '',
      netKgPerMc: '',
      qtyMc: '',
      qtyKgs: '',
      pricePerKg: '',
      totalUsd: group.total_usd
    });
    
    // Style the subtotal row
    subtotalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Format the total
      if (cell.column === 8) {
        cell.numFmt = '$#,##0.00';
        cell.alignment = { horizontal: 'right' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEEF6FF' } // Light blue background
        };
      }
    });
    
    // Add an empty row after each group
    sheet.addRow([]);
  });
  
  // Add grand total
  const grandTotalRow = sheet.addRow({
    no: '',
    item: 'GRAND TOTAL',
    description: '',
    netKgPerMc: '',
    qtyMc: '',
    qtyKgs: '',
    pricePerKg: '',
    totalUsd: shipmentData.grand_total
  });
  
  // Style the grand total row
  grandTotalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'double' },
      left: { style: 'thin' },
      bottom: { style: 'double' },
      right: { style: 'thin' }
    };
    
    if (cell.column === 8) {
      cell.numFmt = '$#,##0.00';
      cell.alignment = { horizontal: 'right' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD6E8FF' } // Light blue background
      };
    }
    
    if (cell.column === 2) {
      cell.alignment = { horizontal: 'left' };
    }
  });

  // Export the workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `Fish-Shipment-${shipmentData.buyer.name}-${new Date(shipmentData.shipment.shipment_date).toLocaleDateString().replace(/\//g, '-')}.xlsx`;
  saveAs(blob, filename);
}
