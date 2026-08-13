export interface PaymentInitRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  successUrl?: string;
  cancelUrl?: string;
  redirectUrl?: string;
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitResponse {
  provider: 'aamarpay' | 'cashfree' | 'stripe';
  gatewayUrl?: string;
  paymentId?: string;
  orderId?: string;
  redirectUrl?: string;
  rawResponse?: Record<string, unknown>;
}

export interface PaymentVerifyPayload {
  provider: 'aamarpay' | 'cashfree' | 'stripe';
  paymentId?: string;
  orderId?: string;
  requestBody?: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  success: boolean;
  provider: 'aamarpay' | 'cashfree' | 'stripe';
  paymentId?: string;
  orderId?: string;
  status?: string;
  rawResponse?: Record<string, unknown>;
}
