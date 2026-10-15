// Serialise records to CSV, safe to open in Excel or Google Sheets.

// A cell starting with one of these is treated as a formula by spreadsheet apps
const FORMULA_PREFIX = /^[=@\t\r]/;
// + and - only start a formula when followed by more than a plain number or placeholder like "-"
const SIGNED_FORMULA = /^[+-](?![\d.,\s]*$)/;

function escapeCell(raw: string): string {
  let value = raw ?? '';
  // Neutralise CSV formula injection (OWASP): prefix with an apostrophe so it is read as text
  if (FORMULA_PREFIX.test(value) || SIGNED_FORMULA.test(value)) {
    value = `'${value}`;
  }
  if (/[",\r\n]/.test(value)) {
    value = `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: Record<string, string>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCell).join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCell(row[header] || '')).join(','));
  });
  return lines.join('\n');
}
