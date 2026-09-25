import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

export const exportRowsToExcel = ({
  rows,
  columns,
  sheetName,
  fileName,
  widths = []
}) => {
  const data = rows.map(row =>
    Object.fromEntries(columns.map(({ header, value }) => [header, value(row)]))
  );

  const worksheet = XLSX.utils.json_to_sheet(data);

  if (widths.length) {
    worksheet["!cols"] = widths.map(width => ({ wch: width }));
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};
