import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { MicroInteraction } from '@/components/ui/micro-interaction';
import { useLoading } from '@/hooks/use-loading-state';
import { saveAs } from 'file-saver';
import * as XLSX from 'exceljs';

interface DataExportProps<T> {
  data: T[];
  filename?: string;
  title?: string;
  description?: string;
  formats?: ('xlsx' | 'csv' | 'pdf' | 'json')[];
  exportConfig?: {
    xlsx?: {
      sheetName?: string;
      columns?: { header: string; key: keyof T; width?: number }[];
    };
    csv?: {
      delimiter?: string;
      includeHeaders?: boolean;
    };
    pdf?: {
      pageSize?: 'A4' | 'Letter';
      orientation?: 'portrait' | 'landscape';
    };
  };
  onExportStart?: (format: string) => void;
  onExportComplete?: (format: string, success: boolean) => void;
}

/**
 * Component for exporting data in various formats
 */
export function DataExport<T extends Record<string, any>>({
  data,
  filename = 'export',
  title = 'Export Data',
  description = 'Export your data in various formats',
  formats = ['xlsx', 'csv', 'pdf', 'json'],
  exportConfig = {},
  onExportStart,
  onExportComplete,
}: DataExportProps<T>) {
  const [activeFormat, setActiveFormat] = useState<string>(formats[0] || 'xlsx');
  const { isLoading, startLoading, stopLoading } = useLoading('data-export');
  
  // Format the filename with date
  const getFormattedFilename = (format: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `${filename}_${date}.${format}`;
  };
  
  // Export to Excel (XLSX)
  const exportToExcel = async () => {
    try {
      startLoading();
      onExportStart?.('xlsx');
      
      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet(exportConfig.xlsx?.sheetName || 'Data');
      
      // Define columns
      if (exportConfig.xlsx?.columns) {
        worksheet.columns = exportConfig.xlsx.columns.map(col => ({
          header: col.header,
          key: col.key as string,
          width: col.width || 20,
        }));
      } else {
        // Auto-generate columns from first data item
        if (data.length > 0) {
          worksheet.columns = Object.keys(data[0]).map(key => ({
            header: key.charAt(0).toUpperCase() + key.slice(1),
            key,
            width: 20,
          }));
        }
      }
      
      // Add header row with styling
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F2FE' }, // Light blue background
      };
      
      // Add data rows
      data.forEach(item => {
        worksheet.addRow(item);
      });
      
      // Style all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          
          // Alternate row colors
          if (rowNumber > 1 && rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' }, // Very light blue
            };
          }
        });
      });
      
      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Save file
      saveAs(new Blob([buffer]), getFormattedFilename('xlsx'));
      
      toast.success('Excel file downloaded successfully');
      onExportComplete?.('xlsx', true);
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error('Failed to export as Excel');
      onExportComplete?.('xlsx', false);
    } finally {
      stopLoading();
    }
  };
  
  // Export to CSV
  const exportToCSV = () => {
    try {
      startLoading();
      onExportStart?.('csv');
      
      const delimiter = exportConfig.csv?.delimiter || ',';
      const includeHeaders = exportConfig.csv?.includeHeaders !== false;
      
      // Generate headers
      let csvContent = '';
      if (includeHeaders && data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent += headers.join(delimiter) + '\\n';
      }
      
      // Generate data rows
      data.forEach(item => {
        const row = Object.values(item)
          .map(value => {
            // Handle special cases
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return value;
          })
          .join(delimiter);
        csvContent += row + '\\n';
      });
      
      // Save file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, getFormattedFilename('csv'));
      
      toast.success('CSV file downloaded successfully');
      onExportComplete?.('csv', true);
    } catch (error) {
      console.error('CSV Export Error:', error);
      toast.error('Failed to export as CSV');
      onExportComplete?.('csv', false);
    } finally {
      stopLoading();
    }
  };
  
  // Export to PDF
  const exportToPDF = () => {
    try {
      startLoading();
      onExportStart?.('pdf');
      
      // Create a printable HTML version
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow pop-ups to download PDF');
        onExportComplete?.('pdf', false);
        stopLoading();
        return;
      }
      
      // Generate HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #e0f2fe; padding: 10px; text-align: left; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f8fafc; }
            h1 { color: #0284c7; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${description}</p>
          <table>
            <thead>
              <tr>
      `;
      
      // Add headers
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
          htmlContent += `<th>${header.charAt(0).toUpperCase() + header.slice(1)}</th>`;
        });
      }
      
      htmlContent += `
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add data rows
      data.forEach(item => {
        htmlContent += '<tr>';
        Object.values(item).forEach(value => {
          htmlContent += `<td>${value !== null && value !== undefined ? value : ''}</td>`;
        });
        htmlContent += '</tr>';
      });
      
      htmlContent += `
            </tbody>
          </table>
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} by FishLedger
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      
      // Write to the new window and trigger print
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      toast.success('PDF file prepared for printing');
      onExportComplete?.('pdf', true);
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to export as PDF');
      onExportComplete?.('pdf', false);
    } finally {
      stopLoading();
    }
  };
  
  // Export to JSON
  const exportToJSON = () => {
    try {
      startLoading();
      onExportStart?.('json');
      
      // Convert data to JSON string with pretty formatting
      const jsonContent = JSON.stringify(data, null, 2);
      
      // Save file
      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, getFormattedFilename('json'));
      
      toast.success('JSON file downloaded successfully');
      onExportComplete?.('json', true);
    } catch (error) {
      console.error('JSON Export Error:', error);
      toast.error('Failed to export as JSON');
      onExportComplete?.('json', false);
    } finally {
      stopLoading();
    }
  };
  
  // Handle export based on format
  const handleExport = () => {
    switch (activeFormat) {
      case 'xlsx':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'json':
        exportToJSON();
        break;
      default:
        toast.error('Unsupported export format');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFormat} onValueChange={setActiveFormat} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            {formats.includes('xlsx') && (
              <TabsTrigger value="xlsx" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Excel</span>
              </TabsTrigger>
            )}
            {formats.includes('csv') && (
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">CSV</span>
              </TabsTrigger>
            )}
            {formats.includes('pdf') && (
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </TabsTrigger>
            )}
            {formats.includes('json') && (
              <TabsTrigger value="json" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="hidden sm:inline">JSON</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="xlsx" className="mt-0">
            <div className="text-sm text-muted-foreground mb-4">
              Export to Excel format (.xlsx) with formatting and multiple sheets.
            </div>
          </TabsContent>
          
          <TabsContent value="csv" className="mt-0">
            <div className="text-sm text-muted-foreground mb-4">
              Export to CSV format for compatibility with spreadsheet applications.
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="mt-0">
            <div className="text-sm text-muted-foreground mb-4">
              Export to PDF format for printing or sharing as a document.
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="mt-0">
            <div className="text-sm text-muted-foreground mb-4">
              Export to JSON format for developers or data processing.
            </div>
          </TabsContent>
          
          <div className="flex justify-end mt-4">
            <MicroInteraction type={['hover-scale', 'click-ripple']}>
              <Button 
                onClick={handleExport} 
                disabled={isLoading || data.length === 0}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export {activeFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </MicroInteraction>
          </div>
        </Tabs>
        
        {data.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No data available to export
          </div>
        )}
      </CardContent>
    </Card>
  );
}
