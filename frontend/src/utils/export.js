/**
 * Export utilities for downloading data as CSV or JSON
 */

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Array of column names/keys to include
 * @returns {string} CSV formatted string
 */
export function toCSV(data, columns = null) {
  if (!data || !data.length) return '';
  
  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  
  const rows = data.map(row => {
    return cols.map(col => {
      const value = row[col];
      // Escape values that contain commas or quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Download data as a file
 * @param {string} content - File content
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 * @param {Array} columns - Optional array of column names to include
 */
export function exportCSV(data, filename = 'export.csv', columns = null) {
  const csv = toCSV(data, columns);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data as JSON file
 * @param {any} data - Data to export
 * @param {string} filename - Name of the JSON file
 */
export function exportJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

/**
 * Format transaction data for export
 * @param {Array} transactions - Transaction array
 * @returns {Array} Formatted transactions
 */
export function formatTransactionsForExport(transactions) {
  return transactions.map(tx => ({
    'Transaction ID': tx.txId,
    'From': tx.from,
    'To': tx.to,
    'Amount': tx.amount,
    'Timestamp': tx.timestamp,
    'Block': tx.blockNumber || 'N/A',
    'Status': tx.status || 'N/A'
  }));
}

/**
 * Format validator data for export
 * @param {Array} validators - Validator array
 * @returns {Array} Formatted validators
 */
export function formatValidatorsForExport(validators) {
  return validators.map(v => ({
    'Address': v.address,
    'Power': v.power,
    'Status': v.status,
    'Uptime': v.uptime || 'N/A',
    'Last Block': v.lastBlock || 'N/A'
  }));
}
