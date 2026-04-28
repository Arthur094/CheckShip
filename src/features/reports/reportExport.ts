import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ComplianceRow } from './useRoutineCompliance';

export async function exportComplianceToExcel(rows: ComplianceRow[], filename: string = 'conformidade_rotina'): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Conformidade');

  worksheet.columns = [
    { header: '#', key: 'id', width: 5 },
    { header: 'Motorista', key: 'driver_name', width: 30 },
    { header: 'Ocorrências', key: 'occurrences', width: 15 },
  ];

  rows.forEach((row, index) => {
    worksheet.addRow({ id: index + 1, driver_name: row.driver_name, occurrences: row.occurrences });
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}.xlsx`);
}
