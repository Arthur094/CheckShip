import * as XLSX from 'xlsx';
import type { ComplianceRow } from './useRoutineCompliance';

export function exportComplianceToExcel(rows: ComplianceRow[], filename: string = 'conformidade_rotina'): void {
  const worksheetData = rows.map((row, index) => ({
    '#': index + 1,
    'Motorista': row.driver_name,
    'Ocorrências': row.occurrences,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Column widths
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Conformidade');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
