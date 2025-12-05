/**
 * Data Export Utility - Export blockchain data in multiple formats
 * Supports CSV, JSON, and Excel formats
 */

const logger = require('./logger');

/**
 * Formats data for CSV export
 */
function formatAsCSV(data, headers = null) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Use provided headers or infer from first object
  const keys = headers || Object.keys(data[0]);

  // Create header row
  const csvHeaders = keys.map(k => `"${String(k).replace(/"/g, '""')}"`).join(',');

  // Create data rows
  const csvRows = data.map(row => {
    return keys.map(key => {
      const val = row[key];
      if (val === null || val === undefined) {
        return '';
      }

      const strVal = String(val);
      // Quote fields containing commas, quotes, or newlines
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }

      return strVal;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Formats data for JSON export
 */
function formatAsJSON(data, pretty = true) {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Formats data for JSONL (JSON Lines) export
 */
function formatAsJSONL(data) {
  if (!Array.isArray(data)) {
    return JSON.stringify(data);
  }

  return data.map(item => JSON.stringify(item)).join('\n');
}

/**
 * Formats data as TSV (Tab-Separated Values)
 */
function formatAsTSV(data, headers = null) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const keys = headers || Object.keys(data[0]);

  // Create header row
  const tsvHeaders = keys.join('\t');

  // Create data rows
  const tsvRows = data.map(row => {
    return keys.map(key => {
      const val = row[key];
      if (val === null || val === undefined) {
        return '';
      }
      return String(val).replace(/\t/g, ' '); // Replace tabs with spaces
    }).join('\t');
  });

  return [tsvHeaders, ...tsvRows].join('\n');
}

/**
 * Export configuration
 */
const exportFormats = {
  csv: {
    mimeType: 'text/csv',
    extension: 'csv',
    formatter: formatAsCSV,
    description: 'Comma-separated values'
  },
  json: {
    mimeType: 'application/json',
    extension: 'json',
    formatter: formatAsJSON,
    description: 'JSON format'
  },
  jsonl: {
    mimeType: 'application/x-ndjson',
    extension: 'jsonl',
    formatter: formatAsJSONL,
    description: 'JSON Lines format'
  },
  tsv: {
    mimeType: 'text/tab-separated-values',
    extension: 'tsv',
    formatter: formatAsTSV,
    description: 'Tab-separated values'
  }
};

/**
 * Export data with specified format
 */
function exportData(data, format = 'json', options = {}) {
  const {
    filename = 'export',
    headers = null,
    pretty = true
  } = options;

  const formatConfig = exportFormats[format];

  if (!formatConfig) {
    throw new Error(`Unsupported format: ${format}`);
  }

  const content = formatConfig.formatter(data, headers, pretty);

  return {
    content,
    mimeType: formatConfig.mimeType,
    filename: `${filename}.${formatConfig.extension}`,
    size: Buffer.byteLength(content, 'utf8')
  };
}

/**
 * Create export response middleware
 */
function createExportMiddleware(dataResolver) {
  return async (req, res) => {
    try {
      const format = (req.query.format || 'json').toLowerCase();
      const filename = req.query.filename || 'export';

      if (!exportFormats[format]) {
        return res.status(400).json({
          error: 'Invalid format',
          supported: Object.keys(exportFormats)
        });
      }

      // Get data to export
      const data = await dataResolver(req);

      if (!data) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Export data
      const exported = exportData(data, format, { filename });

      // Log export
      logger.info('Data exported', {
        format,
        filename: exported.filename,
        size: exported.size,
        records: Array.isArray(data) ? data.length : 1
      });

      // Set response headers
      res.setHeader('Content-Type', exported.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
      res.setHeader('Content-Length', exported.size);

      // Send content
      res.send(exported.content);
    } catch (error) {
      logger.error('Export error', { error: error.message });
      res.status(500).json({ error: 'Export failed' });
    }
  };
}

/**
 * Filter data for export
 */
function filterForExport(data, allowedFields = null) {
  if (!Array.isArray(data)) {
    return data;
  }

  if (!allowedFields) {
    return data;
  }

  return data.map(item => {
    const filtered = {};
    allowedFields.forEach(field => {
      if (field in item) {
        filtered[field] = item[field];
      }
    });
    return filtered;
  });
}

/**
 * Paginate data for large exports
 */
function paginateExport(data, pageSize = 1000) {
  if (!Array.isArray(data)) {
    return [data];
  }

  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }

  return pages;
}

module.exports = {
  exportFormats,
  exportData,
  createExportMiddleware,
  filterForExport,
  paginateExport,
  formatAsCSV,
  formatAsJSON,
  formatAsJSONL,
  formatAsTSV
};
