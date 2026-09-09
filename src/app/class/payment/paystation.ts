import axios from 'axios';
import {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerificationResult,
} from './payment.interface';

type PayStationConfig = {
  baseUrl: string;
  merchantId?: string;
  password?: string;
};

class PayStationService {
  private getConfig(): PayStationConfig {
    const sandbox = process.env.PAYSTATION_SANDBOX !== 'false';
    return {
      baseUrl:
        process.env.PAYSTATION_BASE_URL ||
        (sandbox
          ? 'https://sandbox.paystation.com.bd'
          : 'https://api.paystation.com.bd'),
      merchantId: process.env.PAYSTATION_MERCHANT_ID,
      password: process.env.PAYSTATION_PASSWORD,
    };
  }

  private requireConfig(): Required<PayStationConfig> {
    const config = this.getConfig();
    if (!config.merchantId || !config.password) {
      throw new Error('PayStation credentials are not configured');
    }
    return config as Required<PayStationConfig>;
  }

  public async initializePayment(
    payload: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const config = this.requireConfig();
    if (!payload.orderId || !payload.successUrl) {
      throw new Error('PayStation requires an orderId and callback URL');
    }

    const response = await axios.post(
      `${config.baseUrl}/initiate-payment`,
      {
        merchantId: config.merchantId,
        password: config.password,
        invoice_number: payload.orderId,
        currency: payload.currency || 'BDT',
        payment_amount: Number(payload.amount),
        pay_with_charge: 0,
        reference: payload.subscriptionId || payload.orderId,
        cust_name: payload.customerName || 'Customer',
        cust_phone: payload.customerPhone || '01700000000',
        cust_email: payload.customerEmail || 'customer@example.com',
        cust_address: 'Dhaka',
        callback_url: payload.successUrl,
        checkout_items: JSON.stringify({
          description: payload.metadata?.description || 'Subscription payment',
          subscriptionId: payload.subscriptionId,
        }),
        opt_a: payload.cancelUrl || '',
        opt_b: payload.redirectUrl || '',
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    );

    const data = response.data as Record<string, unknown>;
    const paymentUrl = data.payment_url;
    const statusCode = String(data.status_code || '');
    if (statusCode !== '200' || typeof paymentUrl !== 'string') {
      throw new Error(
        `PayStation did not initialize payment: ${JSON.stringify(data)}`,
      );
    }

    return {
      provider: 'paystation',
      gatewayUrl: paymentUrl,
      redirectUrl: paymentUrl,
      paymentId: String(data.invoice_number || payload.orderId),
      orderId: payload.orderId,
      rawResponse: data,
    };
  }

  public async verifyPayment(
    invoiceNumber: string,
  ): Promise<PaymentVerificationResult> {
    const config = this.requireConfig();
    const form = new URLSearchParams({ invoice_number: invoiceNumber });
    const response = await axios.post(
      `${config.baseUrl}/transaction-status`,
      form,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          merchantId: config.merchantId,
        },
        timeout: 20000,
      },
    );

    const responseData = response.data as Record<string, unknown>;
    const data = (responseData.data || {}) as Record<string, unknown>;
    const status = String(data.trx_status || responseData.status || '')
      .trim()
      .toLowerCase();
    const statusCode = String(responseData.status_code || '').trim();

    return {
      success:
        statusCode === '200' &&
        ['success', 'successful', 'paid'].includes(status),
      provider: 'paystation',
      paymentId: String(data.trx_id || invoiceNumber),
      orderId: String(data.invoice_number || invoiceNumber),
      status: String(data.trx_status || responseData.message || ''),
      rawResponse: data,
    };
  }
}

export default new PayStationService();
