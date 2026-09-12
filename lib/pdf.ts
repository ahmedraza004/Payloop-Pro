import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateStatementPDF(data: {
  userName: string;
  userEmail: string;
  walletNumber: string;
  balance: number;
  currency: string;
  transactions: Array<{
    date: string;
    reference: string;
    type: string;
    description: string;
    amount: number;
    fee: number;
    status: string;
  }>;
}) {
  const doc = new jsPDF();

  // Primary Header Brand
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PayLoop Pro', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ACCOUNT STATEMENT', 14, 30);

  // Statement Meta Info
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 130, 22);
  doc.text(`Wallet: ${data.walletNumber}`, 130, 30);

  // Account Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 48, 182, 30, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Account Holder:', 20, 58);
  doc.text('Current Balance:', 120, 58);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${data.userName} (${data.userEmail})`, 20, 68);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(`$${data.balance.toFixed(2)} ${data.currency}`, 120, 68);

  // Transaction Table
  const tableRows = data.transactions.map((t) => [
    t.date,
    t.reference,
    t.type.replace('_', ' '),
    t.description,
    `${t.type.includes('RECEIVED') || t.type === 'DEPOSIT' || t.type === 'BONUS' ? '+' : '-'}$${t.amount.toFixed(2)}`,
    t.status,
  ]);

  (doc as any).autoTable({
    startY: 86,
    head: [['Date', 'Reference', 'Type', 'Description', 'Amount', 'Status']],
    body: tableRows,
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: 30,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PayLoop Pro Inc. • Encrypted Ledger Audit Trail • Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`PayLoop_Statement_${data.walletNumber}_${Date.now()}.pdf`);
}
