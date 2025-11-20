export interface CreateOrderRequest {
  amount: number; // rupees
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number; // paise
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}
