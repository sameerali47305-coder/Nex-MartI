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
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  );

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Outer Border
  doc
    .lineWidth(1)
    .strokeColor("#DDDDDD")
    .rect(20, 20, pageWidth - 40, pageHeight - 40)
    .stroke();

  //----------------------------------
  // Header
  //----------------------------------

  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#2D6CDF")
    .text("NexMart", 40, 45);

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#222")
    .text("INVOICE", 400, 45);

  // Fix 4: Invoice Number splitting & constrained width
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#555")
    .text("Invoice #:", 400, 80);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(order.id, 400, 95, { width: 150 });

  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
    400,
    115
  );

  doc.text(
    `Payment: ${order.paymentStatus.toUpperCase()}`,
    400,
    130
  );

  doc.moveTo(40, 150).lineTo(555, 150).stroke();

  //----------------------------------
  // Billing Box
  //----------------------------------

  // Fix 2: Increased box height from 105 to 135
  doc
    .roundedRect(40, 160, 235, 135, 4)
    .stroke("#D9D9D9");

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#333")
    .text("BILLED TO", 55, 172);

  // Fix 1 & Fix 5: Applied width wrapping and 10pt font size
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#333");

  doc.text(order.shippingAddress.name, 55, 195, { width: 200 });
  doc.text(order.shippingAddress.phone, { width: 200 });
  doc.text(order.shippingAddress.address, { width: 200 });
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
    { width: 200 }
  );

  //----------------------------------
  // Shipping Box
  //----------------------------------

  // Fix 2: Increased box height from 105 to 135
  doc
    .roundedRect(320, 160, 235, 135, 4)
    .stroke("#D9D9D9");

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#333")
    .text("SHIPPING ADDRESS", 335, 172);

  // Fix 1 & Fix 5: Applied width wrapping and 10pt font size
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#333");

  doc.text(order.shippingAddress.name, 335, 195, { width: 200 });
  doc.text(order.shippingAddress.address, { width: 200 });
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
    { width: 200 }
  );

  //----------------------------------
  // Table Header
  //----------------------------------

  // Fix 3: Shifted table down to y = 335 to give room to taller address boxes
  let y = 335;

  doc
    .rect(40, y, 515, 28)
    .fill("#2D6CDF");

  doc.fillColor("#fff").font("Helvetica-Bold");

  doc.text("ITEM", 55, y + 8);
  doc.text("QTY", 335, y + 8);
  doc.text("PRICE", 395, y + 8);
  doc.text("TOTAL", 485, y + 8);

  y += 28;

  //----------------------------------
  // Table Rows
  //----------------------------------

  doc.fillColor("#000").font("Helvetica");

  order.items.forEach((item) => {
    doc
      .rect(40, y, 515, 30)
      .stroke("#EEEEEE");

    doc.text(item.name, 55, y + 9, {
      width: 250,
    });

    doc.text(String(item.quantity), 340, y + 9);

    doc.text(`$${item.price.toFixed(2)}`, 395, y + 9);

    doc.text(
      `$${(item.price * item.quantity).toFixed(2)}`,
      485,
      y + 9
    );

    y += 30;
  });

  //----------------------------------
  // Totals Box
  //----------------------------------

  y += 25;

  doc
    .roundedRect(330, y, 225, 105, 4)
    .stroke("#D9D9D9");

  doc.font("Helvetica");

  doc.text("Subtotal", 345, y + 15);
  doc.text(`$${order.subtotal.toFixed(2)}`, 500, y + 15);

  doc.text("Shipping", 345, y + 40);
  doc.text(`$${order.shipping.toFixed(2)}`, 500, y + 40);

  doc
    .moveTo(340, y + 65)
    .lineTo(545, y + 65)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#2D6CDF");

  doc.text("Grand Total", 345, y + 75);

  doc.text(`$${order.total.toFixed(2)}`, 480, y + 75);

  //----------------------------------
  // Payment Box
  //----------------------------------

  y += 135;

  doc
    .roundedRect(40, y, 515, 70, 4)
    .fillAndStroke("#F7F8FA", "#DDDDDD");

  doc.fillColor("#000");

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Payment Status:", 55, y + 15, {
      continued: true,
    })
    .font("Helvetica")
    .text(` ${order.paymentStatus.toUpperCase()}`);

  //----------------------------------
  // Footer
  //----------------------------------

  doc
    .fontSize(11)
    .fillColor("#777")
    .text(
      "Thank you for shopping with NexMart!",
      0,
      pageHeight - 65,
      {
        align: "center",
      }
    );

  doc.end();

  return done;
}