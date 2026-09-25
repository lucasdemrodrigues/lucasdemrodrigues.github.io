import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

const makeWorksheet = ({ rows, columns, widths = [] }) => {
  const data = rows.map(row =>
    Object.fromEntries(columns.map(({ header, value }) => [header, value(row)]))
  );

  const worksheet = XLSX.utils.json_to_sheet(data);

  if (widths.length) {
    worksheet["!cols"] = widths.map(width => ({ wch: width }));
  }

  return worksheet;
};

export const exportRowsToExcel = ({
  rows,
  columns,
  sheetName,
  fileName,
  widths = []
}) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    makeWorksheet({ rows, columns, widths }),
    sheetName
  );
  XLSX.writeFile(workbook, fileName);
};

export const exportWorkbookToExcel = ({ sheets, fileName }) => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    XLSX.utils.book_append_sheet(
      workbook,
      makeWorksheet(sheet),
      sheet.sheetName
    );
  });

  XLSX.writeFile(workbook, fileName);
};
