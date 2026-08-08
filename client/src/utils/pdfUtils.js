import jsPDF from 'jspdf';
import { restaurantConfig } from '../config/restaurant.js';

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString();
};

const buildPdf = (documentData, options = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const lineHeight = 18;
  const title = options.title || 'Invoice';
  const documentNumber = documentData.invoiceNumber || documentData._id || 'N/A';
  const createdAt = documentData.createdAt || documentData.created_at || new Date().toISOString();
  const items = Array.isArray(documentData.items) ? documentData.items : [];
  const subtotal = Number(documentData.subtotal || 0);
  const discount = Number(documentData.discount || 0);
  const gst = Number(documentData.gst || 0);
  const serviceCharge = Number(documentData.serviceCharge || 0);
  const total = Number(documentData.total || subtotal + gst + serviceCharge - discount);

  doc.setFontSize(20);
  doc.text(restaurantConfig.name || 'Restaurant', margin, 60);
  if (restaurantConfig.address) {
    doc.setFontSize(10);
    doc.text(restaurantConfig.address, margin, 84);
  }

  doc.setFontSize(12);
  doc.text(title, margin, 112);
  doc.text(`No: ${documentNumber}`, margin, 136);
  doc.text(`Date: ${formatDateTime(createdAt)}`, margin, 156);
  if (documentData.tableNumber) {
    doc.text(`Table: ${documentData.tableNumber}`, margin, 176);
  }
  if (documentData.notes) {
    doc.text(`Notes: ${documentData.notes}`, margin, 196);
  }

  let y = 230;
  doc.setFontSize(12);
  doc.text('Item', margin, y);
  doc.text('Qty', 290, y);
  doc.text('Price', 360, y);
  doc.text('Line Total', 460, y);
  y += 12;
  doc.line(margin, y, 560, y);
  y += 16;

  items.forEach((item) => {
    doc.text(item.name || 'Custom item', margin, y);
    doc.text(String(item.quantity || 1), 290, y);
    doc.text(formatCurrency(item.price || 0), 360, y);
    doc.text(formatCurrency((item.price || 0) * (item.quantity || 1)), 460, y);
    y += lineHeight;
  });

  y += 8;
  doc.line(margin, y, 560, y);
  y += 24;
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, margin, y);
  if (discount > 0) {
    doc.text(`Discount: -${formatCurrency(discount)}`, margin, y + 20);
  }
  doc.text(`GST: ${formatCurrency(gst)}`, margin, y + 40);
  if (serviceCharge > 0) {
    doc.text(`Service Charge: ${formatCurrency(serviceCharge)}`, margin, y + 60);
  }
  doc.text(`Grand Total: ${formatCurrency(total)}`, margin, y + 80);

  if (documentData.payment?.method || documentData.paymentMethod) {
    doc.text(`Payment Method: ${documentData.payment?.method || documentData.paymentMethod}`, margin, y + 102);
  }
  if (documentData.payment?.paymentId || documentData.paymentId || documentData.transactionId) {
    doc.text(`Transaction ID: ${documentData.payment?.paymentId || documentData.paymentId || documentData.transactionId}`, margin, y + 122);
  }

  return doc;
};

export const downloadInvoicePdf = (bill, options = {}) => {
  const doc = buildPdf(bill, { title: options.title || 'Invoice', ...options });
  const fileName = options.fileName || `invoice_${bill._id || 'custom'}.pdf`;
  doc.save(fileName);
  return doc;
};

export const downloadReceiptPdf = (order, options = {}) => {
  const receiptData = {
    ...order,
    invoiceNumber: order._id,
    notes: order.customerNotes || '',
    payment: order.payment,
  };
  return downloadInvoicePdf(receiptData, { title: options.title || 'Receipt', fileName: options.fileName || `receipt_${order._id}.pdf` });
};

export const printInvoice = (bill, options = {}) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    return;
  }

  const formattedItems = Array.isArray(bill.items) ? bill.items : [];
  const subtotal = Number(bill.subtotal || 0);
  const discount = Number(bill.discount || 0);
  const gst = Number(bill.gst || 0);
  const serviceCharge = Number(bill.serviceCharge || 0);
  const total = Number(bill.total || subtotal + gst + serviceCharge - discount);
  const rows = formattedItems
    .map((item) => `<tr><td>${(item.name || 'Custom item').replace(/</g, '&lt;')}</td><td>${item.quantity || 1}</td><td>₹${Number(item.price || 0).toFixed(2)}</td><td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`)
    .join('');

  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>${options.title || 'Invoice'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .header { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px 0; text-align: left; }
          .summary { margin-top: 16px; line-height: 1.6; }
          .meta { margin-bottom: 16px; color: #555; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${restaurantConfig.name || 'Restaurant'}</h2>
          <div class="meta">${restaurantConfig.address || ''}</div>
          <h3>${options.title || 'Invoice'}</h3>
          <div class="meta">No: ${bill._id || 'N/A'} • ${new Date(bill.createdAt || Date.now()).toLocaleString()}</div>
          ${bill.tableNumber ? `<div class="meta">Table: ${bill.tableNumber}</div>` : ''}
        </div>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary">
          <div>Subtotal: ₹${subtotal.toFixed(2)}</div>
          ${discount > 0 ? `<div>Discount: -₹${discount.toFixed(2)}</div>` : ''}
          <div>GST: ₹${gst.toFixed(2)}</div>
          ${serviceCharge > 0 ? `<div>Service Charge: ₹${serviceCharge.toFixed(2)}</div>` : ''}
          <div><strong>Grand Total: ₹${total.toFixed(2)}</strong></div>
        </div>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
