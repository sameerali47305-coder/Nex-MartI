import PDFDocument from "pdfkit";

interface InvoiceOrder {
  id: string;
  items: { name: string; price: number; quantity: number }[];
  shippingAddress: { name: string; address: string; city: string; postalCode: string; phone: string };
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: string;
  createdAt: string | Date;
}

export async function generateInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.fontSize(20).font("Helvetica-Bold").text("NexMart");
  doc.fontSize(10).font("Helvetica").fillColor("#666").text("Invoice");
  doc.moveDown(1.5);

  doc.fillColor("#000").fontSize(11);
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
  doc.moveDown();

  doc.font("Helvetica-Bold").text("Shipping Address");
  doc.font("Helvetica");
  doc.text(order.shippingAddress.name);
  doc.text(order.shippingAddress.address);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
  doc.text(order.shippingAddress.phone);
  doc.moveDown();

  doc.font("Helvetica-Bold").text("Items");
  doc.moveDown(0.3);
  const tableTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Item", 50, tableTop);
  doc.text("Qty", 320, tableTop);
  doc.text("Price", 380, tableTop);
  doc.text("Total", 460, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let y = tableTop + 22;
  doc.font("Helvetica").fontSize(10);
  for (const item of order.items) {
    doc.text(item.name, 50, y, { width: 260 });
    doc.text(String(item.quantity), 320, y);
    doc.text(`$${item.price.toFixed(2)}`, 380, y);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 460, y);
    y += 20;
  }

  doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
  y += 15;
  doc.text("Subtotal", 380, y);
  doc.text(`$${order.subtotal.toFixed(2)}`, 460, y);
  y += 18;
  doc.text("Shipping", 380, y);
  doc.text(`$${order.shipping.toFixed(2)}`, 460, y);
  y += 18;
  doc.font("Helvetica-Bold");
  doc.text("Total", 380, y);
  doc.text(`$${order.total.toFixed(2)}`, 460, y);

  doc.end();
  return done;
}