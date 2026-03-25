/**
 * Data export utilities for the admin panel
 */

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column configuration: { key, label }
 * @param {string} filename - Output filename
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  const headers = columns.map((col) => `"${col.label}"`).join(',');
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      if (value == null) return '""';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return `"${value}"`;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename
 */
export function exportToJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel (basic CSV that opens in Excel)
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column configuration: { key, label }
 * @param {string} filename - Output filename
 */
export function exportToExcel(data, columns, filename = 'export.xlsx') {
  // For now, use CSV format which Excel can read
  // In production, consider using a library like xlsx or exceljs
  exportToCSV(data, columns, filename.replace('.xlsx', '.csv'));
}

/**
 * Print data in a formatted table
 * @param {Array} data - Array of objects to print
 * @param {Array} columns - Column configuration: { key, label }
 */
export function printData(data, columns, title = 'Report') {
  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .no-print { display: none; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${columns.map((col) => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row) =>
              `<tr>${columns.map((col) =>
                `<td>${row[col.key] || '-'}</td>`
              ).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
        <script>
          window.onload = () => { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;
  
  const win = window.open('', '', 'height=600,width=800');
  win.document.write(html);
  win.document.close();
}

/**
 * Generate analytics summary from data
 * @param {Array} data - Array of objects
 * @param {string} groupBy - Field to group by
 * @param {Array} metrics - Metrics to calculate: { field, type: 'sum'|'count'|'avg' }
 */
export function generateAnalytics(data, groupBy, metrics = []) {
  const grouped = {};

  data.forEach((item) => {
    const key = item[groupBy] || 'Unknown';
    if (!grouped[key]) {
      grouped[key] = {
        count: 0,
        items: [],
        ...metrics.reduce((acc, m) => ({ ...acc, [m.field]: 0 }), {})
      };
    }
    grouped[key].count += 1;
    grouped[key].items.push(item);

    metrics.forEach((metric) => {
      const val = parseFloat(item[metric.field]) || 0;
      if (metric.type === 'sum') {
        grouped[key][metric.field] += val;
      } else if (metric.type === 'count') {
        grouped[key][metric.field] += 1;
      }
    });
  });

  // Calculate averages
  Object.keys(grouped).forEach((key) => {
    metrics.forEach((metric) => {
      if (metric.type === 'avg') {
        const sum = grouped[key].items.reduce((s, item) => s + (parseFloat(item[metric.field]) || 0), 0);
        grouped[key][metric.field] = grouped[key].count > 0 ? (sum / grouped[key].count).toFixed(2) : 0;
      }
    });
  });

  return grouped;
}
