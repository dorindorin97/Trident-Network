# Export Features Documentation

## Overview

The Trident Network Explorer now includes data export functionality, allowing users to download validator lists and transaction data in CSV or JSON formats.

## Features

### 1. Validator List Export

**Location:** `/validators` page

**Features:**
- Export all validators or filtered results
- CSV format with clean column headers
- One-click download
- Filename includes date: `validators_2024-12-04.csv`

**Exported Data:**
- Address
- Power
- Status
- Uptime (if available)
- Last Block (if available)

**Example CSV Output:**
```csv
Address,Power,Status,Uptime,Last Block
T1abc123...,1000,active,99.9%,12345
T1def456...,500,inactive,N/A,N/A
```

### 2. Block Transactions Export

**Location:** `/block/:number` page

**Features:**
- Export all transactions in a block
- CSV format
- Filename includes block number: `block_12345_transactions.csv`

**Exported Data:**
- Transaction ID
- From address
- To address
- Amount
- Timestamp
- Block number
- Status (if available)

**Example CSV Output:**
```csv
Transaction ID,From,To,Amount,Timestamp,Block,Status
0xabc...,T1sender...,T1receiver...,100,2024-12-04T12:00:00Z,12345,N/A
```

## Usage

### In React Components

```javascript
import { exportCSV, exportJSON, formatValidatorsForExport } from '../utils/export';

// Export validators
function exportValidators(validators) {
  const formatted = formatValidatorsForExport(validators);
  exportCSV(formatted, 'validators_export.csv');
}

// Export transactions
function exportTransactions(transactions) {
  const formatted = formatTransactionsForExport(transactions);
  exportCSV(formatted, 'transactions_export.csv');
}

// Export as JSON
function exportAsJSON(data) {
  exportJSON(data, 'export.json');
}
```

### Export Utility Functions

#### `toCSV(data, columns)`

Converts array of objects to CSV format.

```javascript
import { toCSV } from '../utils/export';

const data = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' }
];

const csv = toCSV(data);
// Output:
// name,age,city
// Alice,30,NYC
// Bob,25,LA

// With specific columns
const csv = toCSV(data, ['name', 'age']);
// Output:
// name,age
// Alice,30
// Bob,25
```

#### `downloadFile(content, filename, mimeType)`

Triggers browser download of a file.

```javascript
import { downloadFile } from '../utils/export';

const content = 'Hello, World!';
downloadFile(content, 'hello.txt', 'text/plain');
```

#### `exportCSV(data, filename, columns)`

Export data as CSV file.

```javascript
import { exportCSV } from '../utils/export';

const data = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

exportCSV(data, 'users.csv');
// Optional: specify columns
exportCSV(data, 'users.csv', ['name']); // Only export 'name' column
```

#### `exportJSON(data, filename)`

Export data as JSON file.

```javascript
import { exportJSON } from '../utils/export';

const data = { users: ['Alice', 'Bob'], count: 2 };
exportJSON(data, 'users.json');
// Downloads formatted JSON with 2-space indentation
```

#### `formatValidatorsForExport(validators)`

Formats validator data for export with clean column names.

```javascript
import { formatValidatorsForExport, exportCSV } from '../utils/export';

const validators = [
  { address: 'T1abc...', power: 1000, status: 'active' }
];

const formatted = formatValidatorsForExport(validators);
exportCSV(formatted, 'validators.csv');
```

#### `formatTransactionsForExport(transactions)`

Formats transaction data for export with clean column names.

```javascript
import { formatTransactionsForExport, exportCSV } from '../utils/export';

const transactions = [
  { txId: '0xabc...', from: 'T1...', to: 'T2...', amount: '100' }
];

const formatted = formatTransactionsForExport(transactions);
exportCSV(formatted, 'transactions.csv');
```

## CSV Features

### Escaping Special Characters

The CSV export automatically handles:
- Commas in values (wrapped in quotes)
- Quotes in values (escaped as double quotes)
- Newlines in values (wrapped in quotes)

```javascript
const data = [
  { name: 'Alice, Bob', note: 'Said "Hello"' }
];
// Output: name,note
//         "Alice, Bob","Said ""Hello"""
```

### Null/Undefined Handling

- `null` values → empty string
- `undefined` values → empty string

```javascript
const data = [
  { name: 'Alice', age: null, city: undefined }
];
// Output: name,age,city
//         Alice,,
```

## Browser Compatibility

Export features work in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Uses standard `Blob` and `URL.createObjectURL` APIs.

## File Size Considerations

### Large Datasets

For very large datasets (>10,000 rows), consider:

1. **Pagination**: Export only visible/filtered data
2. **Chunking**: Split into multiple files
3. **Server-side export**: Generate files on backend

### Example: Chunked Export

```javascript
function exportInChunks(data, chunkSize = 1000) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const formatted = formatValidatorsForExport(chunk);
    exportCSV(formatted, `validators_part_${Math.floor(i / chunkSize) + 1}.csv`);
  }
}
```

## Customization

### Custom Column Names

```javascript
function exportCustom(data) {
  const formatted = data.map(item => ({
    'Validator Address': item.address,
    'Voting Power': item.power,
    'Current Status': item.status
  }));
  
  exportCSV(formatted, 'custom_validators.csv');
}
```

### Custom Date Formatting

```javascript
function exportWithFormattedDates(transactions) {
  const formatted = transactions.map(tx => ({
    'Transaction ID': tx.txId,
    'From': tx.from,
    'To': tx.to,
    'Amount': tx.amount,
    'Date': new Date(tx.timestamp).toLocaleString()
  }));
  
  exportCSV(formatted, 'transactions.csv');
}
```

## Integration with Filtering/Sorting

Export respects current filter and sort settings:

```javascript
// In ValidatorList component
const processedValidators = useMemo(() => {
  let filtered = vals;
  
  // Apply filters
  if (filterStatus !== 'all') {
    filtered = filtered.filter(v => v.status === filterStatus);
  }
  
  // Apply sorting
  return filtered.sort(...);
}, [vals, filterStatus, sortBy, sortOrder]);

// Export button uses processed data
const handleExport = () => {
  const formatted = formatValidatorsForExport(processedValidators);
  exportCSV(formatted, `validators_${filterStatus}.csv`);
};
```

## Security Notes

1. **No server-side processing**: All exports happen client-side
2. **Memory usage**: Large exports consume client memory
3. **No data persistence**: Files are generated on-demand
4. **No sensitive data**: Avoid exporting private keys or sensitive info

## Future Enhancements

Planned features:
- [ ] Excel format (.xlsx) export
- [ ] PDF export with charts
- [ ] Email export functionality
- [ ] Scheduled exports
- [ ] Custom column selection UI
- [ ] Export history tracking

## Troubleshooting

### Export Button Not Working

1. Check browser console for errors
2. Verify data is not empty
3. Check popup blocker settings
4. Try a different browser

### File Not Downloading

1. Check browser download settings
2. Verify sufficient disk space
3. Check antivirus/security software
4. Try saving to a different location

### Corrupted CSV Files

1. Try opening with different program (Excel, Google Sheets, LibreOffice)
2. Check for special characters in data
3. Verify UTF-8 encoding support
4. Use a text editor to inspect raw file

### Large Export Freezes Browser

1. Reduce exported data size
2. Use filtering before export
3. Export in chunks
4. Consider server-side export for very large datasets
