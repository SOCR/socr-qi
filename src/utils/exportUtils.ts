
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exports the content of a specified element to a PDF file
 * 
 * @param elementId - The ID of the HTML element to export
 * @param filename - The name of the PDF file to generate
 */
export const exportToPDF = async (elementId: string, filename: string = "report.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  // Create a clone of the element to ensure proper rendering
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = element.offsetWidth + "px";
  
  // Remove elements with class 'print:hidden'
  const elementsToRemove = clone.querySelectorAll('.print\\:hidden');
  elementsToRemove.forEach(el => el.remove());
  
  // Temporarily append clone to document for rendering
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  document.body.appendChild(clone);
  
  try {
    // Use html2canvas to capture the element
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    });
    
    // Initialize PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;
    
    pdf.addImage(
      imgData, 
      'PNG', 
      imgX, 
      imgY, 
      imgWidth * ratio, 
      imgHeight * ratio
    );
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© SOCR - Statistics Online Computational Resource', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    
    // Save the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    // Remove the clone from document
    document.body.removeChild(clone);
  }
};

/**
 * Exports data as a CSV file
 * 
 * @param data - Array of objects to export
 * @param filename - The name of the CSV file to generate
 */
export const exportToCSV = (data: any[], filename: string = "data.csv") => {
  if (!data || !data.length) {
    throw new Error("No data to export");
  }
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        // Handle values that may contain commas
        const value = row[header];
        const stringValue = value === null || value === undefined 
          ? '' 
          : String(value);
          
        // Escape quotes and wrap in quotes if needed
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',')
    )
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Trigger download and clean up
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};
