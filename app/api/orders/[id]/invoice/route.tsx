import { NextRequest, NextResponse } from "next/server";

import { getOrderById, ServiceError } from "@/services/order.service";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { withAuth } from "@/middleware/auth";

// pdfkit needs a real Node.js environment (not the Edge runtime).
export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withAuth<[RouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { id } = await params;
      const order = await getOrderById(user.userId, id);
      const pdfBuffer = await generateInvoicePdf(order);

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${order.id}.pdf"`,
        },
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.status });
      }
      console.error(error);
      return NextResponse.json({ success: false, message: "Failed to generate invoice" }, { status: 500 });
    }
  }
);