// lib/cors.ts
import { NextResponse } from "next/server";

const allowedOrigin = "https://print-sol-frontend-react.vercel.app";

export const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function corsResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export function corsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
