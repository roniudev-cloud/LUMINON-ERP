import * as XLSX from "xlsx";

interface ExportOptions {
  fileName: string;
  sheetName?: string;
  data: any[];
  columns: { header: string; key: string }[];
}

export function exportToExcel({ fileName, sheetName = "Sheet1", data, columns }: ExportOptions) {
  // 1. Format data to match columns
  const formattedData = data.map((item) => {
    const row: any = {};
    columns.forEach((col) => {
      // Handle nested keys like "customer.name"
      const keys = col.key.split(".");
      let val = item;
      for (const k of keys) {
        if (val) val = val[k];
        else break;
      }
      row[col.header] = val !== undefined && val !== null ? val : "";
    });
    return row;
  });

  // 2. Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 3. Generate buffer and download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
