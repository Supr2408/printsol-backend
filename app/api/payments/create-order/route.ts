import { NextRequest, NextResponse } from "next/server";
import { corsResponse, corsHeaders } from "@/lib/cors";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { razorpayClient, RazorpayOrder } from "@/lib/razorpayClient";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await getCurrentUser(authHeader);

    const { amount } = await req.json();
    const amountPaise = Math.round(amount * 100);

    if (amountPaise <= 0) {
      return corsResponse({ detail: "Invalid amount" }, 400);
    }

    const orderData = {
      amount: amountPaise,
      currency: "INR",
      payment_capture: "1",
      notes: {
        uid: user.uid,
        email: user.email ?? "",
      },
    };

    const order = (await razorpayClient.orders.create(orderData)) as RazorpayOrder;

    // ✅ IMPORTANT: USE corsResponse
    return corsResponse({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err: any) {
    if (err instanceof HttpError) {
      return corsResponse({ detail: err.message }, err.status);
    }

    return corsResponse({ detail: "Server error" }, 500);
  }
}
