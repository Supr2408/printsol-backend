export const runtime = "nodejs";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { admin } from "@/lib/firebaseAdmin";
import { getCurrentUser, HttpError } from "@/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://print-sol-frontend-react.vercel.app",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 🔥 REQUIRED for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    // -----------------------------
    // AUTH
    // -----------------------------
    const authHeader = req.headers.get("authorization");
    const user = await getCurrentUser(authHeader);

    // -----------------------------
    // BODY
    // -----------------------------
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
      body;

    // -----------------------------
    // SIGNATURE VERIFY
    // -----------------------------
    const toSign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(toSign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new HttpError(400, "Invalid payment signature");
    }

    // -----------------------------
    // UPDATE FIRESTORE
    // -----------------------------
    const db = admin.firestore();
    await db
      .collection("users")
      .doc(user.uid)
      .update({
        balance: admin.firestore.FieldValue.increment(amount / 100),
      });

    // -----------------------------
    // SUCCESS RESPONSE
    // -----------------------------
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        message:
          err instanceof HttpError ? err.message : "Verification failed",
      }),
      {
        status: err instanceof HttpError ? err.status : 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}
