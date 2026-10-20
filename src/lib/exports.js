import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  PageOrientation,
} from 'docx';
import { CUSTOMERS, JUSTIFICATION_LABEL } from '../data/mockData';
import { fmt, fmtDate, fmtDateTime, nowISO, todayISO, methodLabel } from './format';
import { remitterNotes } from './selectors';
import { STATUS_META } from '../theme';

// In production these documents would be generated server-side so the OCFO
// record and the download are the same artifact. Client-side generation is a
// POC stand-in.

const saveBlob = (filename, blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

const HEADERS = [
  'Request ID',
  'Customer',
  'Customer ID',
  'Date submitted',
  'Status',
  'Status date',
  'Amount',
];

const rowArrays = (rows) =>
  rows.map((r) => [
    r.id,
    CUSTOMERS[r.customer].name,
    r.customer,
    fmtDate(r.submittedAt),
    STATUS_META[r.status].label,
    fmtDate(r.statusDate),
    fmt(r.total),
  ]);

export function downloadHistoryCsv(rows) {
  const quote = (v) => {
    const s = String(v ?? '');
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv =
    '﻿' + [HEADERS, ...rowArrays(rows)].map((cols) => cols.map(quote).join(',')).join('\r\n');
  saveBlob(`fee-refund-requests-${todayISO()}.csv`, new Blob([csv], { type: 'text/csv' }));
}

export function downloadHistoryPdf(rows) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Fee Refund Requests', 40, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Exported ${fmtDateTime(nowISO())} · ${rows.length} request${rows.length === 1 ? '' : 's'}`, 40, 62);
  doc.setTextColor(0);
  autoTable(doc, {
    head: [HEADERS],
    body: rowArrays(rows),
    startY: 78,
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 113, 187], textColor: 255 },
    columnStyles: { 6: { halign: 'right' } },
  });
  saveBlob(
    `fee-refund-requests-${todayISO()}.pdf`,
    new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
  );
}

export async function downloadHistoryDocx(rows) {
  const cell = (text, opts = {}) =>
    new TableCell({
      children: [
        new Paragraph({
          alignment: opts.right ? AlignmentType.RIGHT : undefined,
          children: [new TextRun({ text: String(text), bold: Boolean(opts.bold), size: 20 })],
        }),
      ],
    });
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: HEADERS.map((t) => cell(t, { bold: true })) }),
      ...rowArrays(rows).map(
        (r) => new TableRow({ children: r.map((v, i) => cell(v, { right: i === 6 })) })
      ),
    ],
  });
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
        children: [
          new Paragraph({ text: 'Fee Refund Requests', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            text: `Exported ${fmtDateTime(nowISO())} · ${rows.length} request${rows.length === 1 ? '' : 's'}`,
          }),
          new Paragraph({ text: '' }),
          table,
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveBlob(`fee-refund-requests-${todayISO()}.docx`, blob);
}

export function downloadRequestPdf(request) {
  const c = CUSTOMERS[request.customer];
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const width = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Fee Refund Request ${request.id}`, 40, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(
    `Status: ${STATUS_META[request.status].label} (${fmtDate(request.statusDate)}) · Routed to the Office of the Chief Financial Officer, Refund Review`,
    40,
    66
  );
  doc.setTextColor(0);

  autoTable(doc, {
    body: [
      ['Submitted', `${fmtDateTime(request.submittedAt)} by ${request.submittedBy.name} (${request.submittedBy.email})`],
      ['Customer', `${c.name} · ${c.id} · ${c.team}, ${c.position}`],
      [
        'Justification',
        JUSTIFICATION_LABEL[request.justification.code] +
          (request.justification.text ? ` — ${request.justification.text}` : ''),
      ],
      ['Total refund', fmt(request.total)],
    ],
    startY: 80,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 110 } },
  });

  let y = doc.lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Fees', 40, y);
  autoTable(doc, {
    head: [['Fee', 'Paid', 'Paid amount', 'Refund', 'Remit to']],
    body: request.fees.map((f) => [
      `${f.desc}\n${f.id}`,
      `${fmtDate(f.date)}\n${f.method}${f.card !== '—' ? ' ' + f.card : ''}`,
      fmt(f.cents),
      fmt(f.refund) + (f.refund < f.cents ? '\n(partial)' : ''),
      `${f.remitter.name}\n${f.remitter.address}\n${methodLabel(f, f.remitter.method)}${
        f.remitterSource === 'manual'
          ? '\nEntered manually'
          : f.remitterSource === 'customized'
            ? '\nChanged from payment record'
            : ''
      }`,
    ]),
    startY: y + 8,
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 113, 187], textColor: 255 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { cellWidth: 190 } },
  });

  y = doc.lastAutoTable.finalY + 18;
  const notes = remitterNotes(
    request.fees,
    (f) => f.remitterSource,
    (f) => f.recordRemitter
  );
  if (notes.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Remitter notes', 40, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    notes.forEach((n) => {
      const lines = doc.splitTextToSize(`• ${n.feeId} — ${n.text}`, width - 80);
      y += 14;
      doc.text(lines, 40, y);
      y += (lines.length - 1) * 12;
    });
    y += 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Status history', 40, y);
  autoTable(doc, {
    body: request.timeline.map((t) => [STATUS_META[t.status].label, fmtDateTime(t.at), t.note || '']),
    startY: y + 8,
    theme: 'plain',
    styles: { fontSize: 9.5, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150 }, 1: { cellWidth: 140 } },
  });

  y = doc.lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Notifications sent', 40, y);
  autoTable(doc, {
    body: request.notifications.map((n) => [
      n.role,
      n.name,
      n.to || 'Notified by mail to the remittance address',
    ]),
    startY: y + 8,
    theme: 'plain',
    styles: { fontSize: 9.5, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90 } },
  });

  y = doc.lastAutoTable.finalY + 20;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    doc.splitTextToSize(
      `Certified and submitted by ${request.submittedBy.name} on ${fmtDateTime(request.certifiedAt)}. Generated ${fmtDateTime(nowISO())}.`,
      width - 80
    ),
    40,
    y
  );

  saveBlob(`${request.id}.pdf`, new Blob([doc.output('arraybuffer')], { type: 'application/pdf' }));
}
