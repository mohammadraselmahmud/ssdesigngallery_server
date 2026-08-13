import axios from 'axios';
import config from '../../config';
import {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyPayload,
  PaymentVerificationResult,
} from './payment.interface';

class AamarpayService {
  private getBaseConfig() {
    return {
      store_id: process.env.AAMARPAY_STORE_ID,
      signature_key: process.env.AAMARPAY_SIGNATURE_KEY,
      sandbox: process.env.AAMARPAY_SANDBOX === 'true',
      api_url: process.env.AAMARPAY_API_URL || 'https://sandbox.aamarpay.com',
      return_url: `${config.client_Url}/payment/success`,
      cancel_url: `${config.client_Url}/payment/cancel`,
    };
  }

  private normalizePaymentUrl(value: unknown, apiUrl: string) {
    if (typeof value !== 'string' || !value) {
      return undefined;
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    if (value.startsWith('/')) {
      return `${apiUrl}${value}`;
    }
    return `${apiUrl}/${value}`;
  }

  public async initializePayment(
    payload: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const cfg = this.getBaseConfig();

    if (!cfg.store_id || !cfg.signature_key) {
      throw new Error('Aamarpay credentials are not configured');
    }

    const formData = {
      store_id: cfg.store_id,
      signature_key: cfg.signature_key,
      cus_name: payload.customerName || 'Customer',
      cus_email: payload.customerEmail || 'customer@example.com',
      amount: payload.amount,
      currency: payload.currency || 'BDT',
      tran_id: payload.orderId,
      desc: payload.metadata?.description || 'Subscription payment',
      success_url: payload.successUrl || cfg.return_url,
      fail_url: payload.cancelUrl || cfg.cancel_url,
      cancel_url: payload.cancelUrl || cfg.cancel_url,
      type: 'json',
      cus_phone: payload.customerPhone || '01700000000',
    };

    const response = await axios.post(`${cfg.api_url}/request.php`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 20000,
    });

    const paymentPath =
      response?.data?.payment_url ||
      response?.data?.redirectUrl ||
      response?.data;
    const paymentUrl = this.normalizePaymentUrl(paymentPath, cfg.api_url);

    // Don't fall back to our own "success" URL — that would send the user
    // to a page that claims success without any payment happening.
    if (!paymentUrl) {
      throw new Error(
        `Aamarpay did not return a payment URL: ${JSON.stringify(response?.data)}`,
      );
    }

    return {
      provider: 'aamarpay',
      gatewayUrl: paymentUrl,
      orderId: payload.orderId,
      redirectUrl: paymentUrl,
      rawResponse: response?.data,
    };
  }

  public async verifyPayment(
    payload: PaymentVerifyPayload,
  ): Promise<PaymentVerificationResult> {
    const cfg = this.getBaseConfig();

    if (!cfg.store_id || !cfg.signature_key) {
      throw new Error('Aamarpay credentials are not configured');
    }

    // Built explicitly with our own credentials + orderId — do NOT forward
    // payload.requestBody as-is, it's the query string of OUR success_url
    // and doesn't contain store_id/signature_key/request_id at all.
    // NOTE: double-check this endpoint/param names against current Aamarpay
    // docs — verify carefully before going live.
    const response = await axios.get(
      `${cfg.api_url}/api/v1/trxcheck/request.php`,
      {
        params: {
          request_id: payload.orderId,
          store_id: cfg.store_id,
          signature_key: cfg.signature_key,
          type: 'json',
        },
        timeout: 20000,
      },
    );

    const status = response?.data?.pay_status || response?.data?.status;

    return {
      success: status === 'Successful' || status === 'Completed',
      provider: 'aamarpay',
      orderId: payload.orderId,
      paymentId: payload.paymentId,
      status,
      rawResponse: response?.data,
    };
  }
}

export default new AamarpayService();
