export interface PaymentInitRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  successUrl?: string;
  failUrl?: string;
  cancelUrl?: string;
  redirectUrl?: string;
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitResponse {
  provider: 'paystation' | 'stripe' | 'google_pay' | 'google_play';
  gatewayUrl?: string;
  paymentId?: string;
  orderId?: string;
  redirectUrl?: string;
  rawResponse?: Record<string, unknown>;
}

export interface PaymentVerifyPayload {
  provider: 'paystation' | 'stripe' | 'google_pay' | 'google_play';
  paymentId?: string;
  orderId?: string;
  requestBody?: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  success: boolean;
  provider: 'paystation' | 'stripe' | 'google_pay' | 'google_play';
  paymentId?: string;
  orderId?: string;
  status?: string;
  rawResponse?: Record<string, unknown>;
}
