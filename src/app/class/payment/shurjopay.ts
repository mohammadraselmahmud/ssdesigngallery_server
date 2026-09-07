import axios from 'axios';
import {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerificationResult,
} from './payment.interface';

type ShurjoPayConfig = {
  baseUrl: string;
  username?: string;
  password?: string;
  prefix?: string;
};

type ShurjoPayToken = {
  token: string;
  storeId: string;
  expiresAt: number;
};

class ShurjoPayService {
  private auth?: ShurjoPayToken;

  private getConfig(): ShurjoPayConfig {
    const sandbox = process.env.SHURJOPAY_SANDBOX !== 'false';
    return {
      baseUrl:
        process.env.SHURJOPAY_BASE_URL ||
        (sandbox
          ? 'https://sandbox.shurjopayment.com/api'
          : 'https://engine.shurjopayment.com/api'),
      username: process.env.SHURJOPAY_USERNAME,
      password: process.env.SHURJOPAY_PASSWORD,
      prefix: process.env.SHURJOPAY_PREFIX,
    };
  }

  private requireConfig(): Required<ShurjoPayConfig> {
    const config = this.getConfig();
    if (!config.username || !config.password || !config.prefix) {
      throw new Error('ShurjoPay credentials are not configured');
    }
    return config as Required<ShurjoPayConfig>;
  }

  private async authenticate(): Promise<ShurjoPayToken> {
    if (this.auth && this.auth.expiresAt > Date.now()) return this.auth;

    const config = this.requireConfig();
    const response = await axios.post(
      `${config.baseUrl}/get_token`,
      { username: config.username, password: config.password },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    );

    const token = response.data?.token;
    const storeId = response.data?.store_id;
    if (!token || storeId === undefined || storeId === null) {
      throw new Error(
        `ShurjoPay authentication failed: ${JSON.stringify(response.data)}`,
      );
    }

    const expiresIn = Number(response.data?.expires_in) || 900;
    this.auth = {
      token,
      storeId: String(storeId),
      expiresAt:
        Date.now() + Math.max(Math.min(expiresIn, 900) - 60, 60) * 1000,
    };
    return this.auth;
  }

  public async initializePayment(
    payload: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const config = this.requireConfig();
    if (!payload.orderId || !payload.successUrl || !payload.cancelUrl) {
      throw new Error('ShurjoPay requires an orderId and callback URLs');
    }

    const auth = await this.authenticate();
    const form = new URLSearchParams({
      prefix: config.prefix,
      token: auth.token,
      return_url: payload.successUrl,
      cancel_url: payload.cancelUrl,
      store_id: auth.storeId,
      amount: Number(payload.amount).toFixed(2),
      order_id: payload.orderId,
      currency: 'BDT',
      customer_name: payload.customerName || 'Customer',
      customer_address: 'Dhaka',
      customer_email: payload.customerEmail || 'customer@example.com',
      customer_phone: payload.customerPhone || '01700000000',
      customer_city: 'Dhaka',
      customer_post_code: '1000',
      client_ip: '0.0.0.0',
      customer_state: 'Dhaka',
      customer_country: 'BD',
      value1: payload.subscriptionId || '',
      value2: String(payload.metadata?.description || 'Subscription'),
      value3: '',
      value4: '',
    });

    const response = await axios.post(`${config.baseUrl}/secret-pay`, form, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 20000,
    });

    const redirectUrl = response.data?.checkout_url;
    if (!redirectUrl || !response.data?.sp_order_id) {
      throw new Error(
        `ShurjoPay did not initialize payment: ${JSON.stringify(response.data)}`,
      );
    }

    return {
      provider: 'shurjopay',
      gatewayUrl: redirectUrl,
      redirectUrl,
      paymentId: response.data.sp_order_id,
      orderId: payload.orderId,
      rawResponse: response.data,
    };
  }

  public async verifyPayment(
    shurjoPayOrderId: string,
  ): Promise<PaymentVerificationResult> {
    const config = this.requireConfig();
    const auth = await this.authenticate();
    const response = await axios.post(
      `${config.baseUrl}/verification`,
      { order_id: shurjoPayOrderId },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      },
    );

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;
    const code = Number(data?.sp_code);
    return {
      success: code === 1000,
      provider: 'shurjopay',
      paymentId: data?.order_id || shurjoPayOrderId,
      orderId: data?.customer_order_id,
      status: String(data?.sp_message || code),
      rawResponse: data,
    };
  }
}

export default new ShurjoPayService();
