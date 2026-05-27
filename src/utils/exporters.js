import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatDateTime } from "./formatters.js";

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadExcelXml(filename, sheetName, rows) {
  const columns = Object.keys(rows[0] || {});
  const xmlRows = [
    `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${escapeXml(column)}</Data></Cell>`).join("")}</Row>`,
    ...rows.map((row) =>
      `<Row>${columns
        .map((column) => {
          const value = row[column];
          const type = typeof value === "number" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
        })
        .join("")}</Row>`,
    ),
  ].join("");

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${escapeXml(sheetName)}">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportBooksToExcel(books) {
  downloadExcelXml(
    "library-books.xls",
    "Books",
    books.map((book) => ({
      Title: book.title,
      Author: book.author,
      Category: book.category,
      Barcode: book.barcode,
      Quantity: book.quantity,
      Available: book.available_quantity,
      Status: book.status,
      Created: formatDate(book.created_at),
    })),
  );
}

export function exportStudentsToExcel(students) {
  downloadExcelXml(
    "library-students.xls",
    "Students",
    students.map((student) => ({
      Name: student.full_name,
      "Student ID": student.student_id,
      Faculty: student.faculty,
      Group: student.study_group,
      Email: student.email,
      Phone: student.phone,
      Status: student.status,
    })),
  );
}

export function exportHistoryToPdf(issues) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("University Library Issue History", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated ${formatDateTime(new Date())}`, 14, 26);

  autoTable(doc, {
    startY: 34,
    head: [["Book", "Student", "Issued", "Due", "Returned", "Status", "Fine"]],
    body: issues.map((issue) => [
      issue.book?.title || issue.book_title || "Unknown",
      issue.student?.full_name || issue.student_name || "Unknown",
      formatDate(issue.issue_date),
      formatDate(issue.due_date),
      formatDate(issue.return_date),
      issue.status,
      `$${Number(issue.fine_amount || 0).toFixed(2)}`,
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [8, 145, 178] },
  });

  doc.save("library-history.pdf");
}
