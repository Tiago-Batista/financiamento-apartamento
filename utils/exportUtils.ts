
export interface ColumnDefinition<T = any> {
  key: keyof T | string; // Allow string for nested paths, handle in getter
  label: string;
  formatter?: (value: any, item: T) => string | number; // Optional formatter
}

// Helper to get nested properties, e.g., 'proof.name'
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function convertToCSV<T>(data: T[], columns: ColumnDefinition<T>[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  const header = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',') + '\r\n';

  const rows = data.map(item => {
    return columns.map(col => {
      let value = typeof col.key === 'string' ? getNestedValue(item, col.key) : item[col.key as keyof T];
      if (col.formatter) {
        value = col.formatter(value, item);
      }
      if (value === null || typeof value === 'undefined') {
        value = '';
      }
      // Escape double quotes and handle commas/newlines within fields
      const stringValue = String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  }).join('\r\n');

  return header + rows;
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
