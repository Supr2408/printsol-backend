export const runtime = "nodejs";
import { NextRequest } from "next/server";
import { corsResponse, corsOptions } from "@/lib/cors";
import { getCurrentUser, HttpError } from "@/lib/auth";
import { razorpayClient,RazorpayOrder } from "@/lib/razorpayClient";


export async function OPTIONS() {
  return corsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await getCurrentUser(authHeader);

    const { amount } = await req.json();
    const amountPaise = Math.round(amount * 100);

    if (amountPaise <= 0) throw new HttpError(400, "Invalid amount");

    const orderData = {
  amount: amountPaise,
  currency: "INR",
  payment_capture: "1",   // FIXED ✔
  notes: {
    uid: user.uid,
    email: user.email ?? "",
  },
};

const order = (await razorpayClient.orders.create(orderData)) as RazorpayOrder;

return corsResponse({
  order_id: order.id,
  amount: order.amount,     // FIXED ✔
  currency: order.currency, // FIXED ✔
  key_id: process.env.RAZORPAY_KEY_ID,
});

  } catch (err) {
    if (err instanceof HttpError) {
      return corsResponse({ detail: err.message }, err.status);
    }
    return corsResponse({ detail: "Server error" }, 500);
  }
}
