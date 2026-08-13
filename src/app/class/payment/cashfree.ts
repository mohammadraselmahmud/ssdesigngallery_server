import axios from 'axios';
import config from '../../config';
import {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyPayload,
  PaymentVerificationResult,
} from './payment.interface';

class CashfreeService {
  private getBaseConfig() {
    return {
      apiUrl: process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg',
      clientId: process.env.CASHFREE_CLIENT_ID,
      clientSecret: process.env.CASHFREE_CLIENT_SECRET,
      returnUrl: process.env.CASHFREE_RETURN_URL || config.client_Url,
      cancelUrl: process.env.CASHFREE_CANCEL_URL || config.client_Url,
    };
  }

  public async initializePayment(
    payload: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const cfg = this.getBaseConfig();

    if (!cfg.clientId || !cfg.clientSecret) {
      throw new Error('Cashfree credentials are not configured');
    }

    const body = {
      order_id: payload.orderId,
      order_amount: payload.amount,
      order_currency: payload.currency || 'INR',
      customer_details: {
        customer_id: payload.orderId,
        customer_name: payload.customerName || 'Customer',
        customer_email: payload.customerEmail || 'customer@example.com',
        customer_phone: payload.customerPhone || '01700000000',
      },
      order_meta: {
        return_url: payload.successUrl || cfg.returnUrl,
        notify_url: payload.successUrl || cfg.returnUrl,
      },
    };

    const response = await axios.post(`${cfg.apiUrl}/orders`, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cfg.clientId,
        'x-client-secret': cfg.clientSecret,
      },
      timeout: 20000,
    });

    const paymentSessionId = response?.data?.payment_session_id;

    // TODO: verify this against current Cashfree docs — this was built
    // off the /pg API base, not their actual hosted-checkout page. Cashfree
    // typically expects the payment_session_id to be handed to their JS SDK
    // (cashfree.checkout()) on the frontend rather than a plain GET URL.
    const paymentUrl = paymentSessionId
      ? `${cfg.apiUrl}/checkout?paymentSessionId=${paymentSessionId}`
      : undefined;

    if (!paymentUrl) {
      throw new Error(
        `Cashfree did not return a payment_session_id: ${JSON.stringify(response?.data)}`,
      );
    }

    return {
      provider: 'cashfree',
      gatewayUrl: paymentUrl,
      orderId: payload.orderId,
      paymentId: paymentSessionId,
      redirectUrl: paymentUrl,
      rawResponse: response?.data,
    };
  }

  public async verifyPayment(
    payload: PaymentVerifyPayload,
  ): Promise<PaymentVerificationResult> {
    const cfg = this.getBaseConfig();
    const orderId = payload.orderId;

    const response = await axios.get(`${cfg.apiUrl}/orders/${orderId}`, {
      headers: {
        'x-client-id': cfg.clientId,
        'x-client-secret': cfg.clientSecret,
      },
      timeout: 20000,
    });

    return {
      success: response?.data?.order_status === 'PAID',
      provider: 'cashfree',
      orderId,
      paymentId: payload.paymentId,
      status: response?.data?.order_status,
      rawResponse: response?.data,
    };
  }
}

export default new CashfreeService();
