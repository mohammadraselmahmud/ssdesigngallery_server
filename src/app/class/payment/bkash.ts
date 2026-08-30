import axios from 'axios';
import {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerificationResult,
} from './payment.interface';
type BkashToken = { idToken: string; expiresAt: number };
type BkashConfig = {
  baseUrl: string;
  appKey?: string;
  appSecret?: string;
  username?: string;
  password?: string;
};
class BkashService {
  private token?: BkashToken;
  private getConfig(): BkashConfig {
    return {
      baseUrl:
        process.env.BKASH_BASE_URL ||
        'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      appKey: process.env.BKASH_APP_KEY,
      appSecret: process.env.BKASH_APP_SECRET,
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD,
    };
  }
  private requireConfig(): Required<BkashConfig> {
    const config = this.getConfig();
    if (
      !config.appKey ||
      !config.appSecret ||
      !config.username ||
      !config.password
    )
      throw new Error('bKash credentials are not configured');
    return config as Required<BkashConfig>;
  }
  private async getToken() {
    if (this.token && this.token.expiresAt > Date.now())
      return this.token.idToken;
    const config = this.requireConfig();
    const response = await axios.post(
      `${config.baseUrl}/tokenized/checkout/token/grant`,
      { app_key: config.appKey, app_secret: config.appSecret },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          username: config.username,
          password: config.password,
        },
        timeout: 20000,
      },
    );
    const idToken = response.data?.id_token;
    if (!idToken)
      throw new Error(
        `bKash did not return an id_token: ${JSON.stringify(response.data)}`,
      );
    const expiresIn = Number(response.data?.expires_in) || 3600;
    this.token = {
      idToken,
      expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
    };
    return idToken;
  }
  private async headers() {
    const config = this.requireConfig();
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: await this.getToken(),
      'x-app-key': config.appKey,
    };
  }
  public async initializePayment(
    payload: PaymentInitRequest,
  ): Promise<PaymentInitResponse> {
    const config = this.requireConfig();
    if (!payload.orderId || !payload.successUrl)
      throw new Error('bKash requires an orderId and callback URL');
    const response = await axios.post(
      `${config.baseUrl}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference: payload.customerPhone || 'Customer',
        callbackURL: payload.successUrl,
        amount: Number(payload.amount).toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: payload.orderId,
      },
      { headers: await this.headers(), timeout: 20000 },
    );
    if (!response.data?.bkashURL || !response.data?.paymentID)
      throw new Error(
        `bKash did not return a payment URL: ${JSON.stringify(response.data)}`,
      );
    return {
      provider: 'bkash',
      gatewayUrl: response.data.bkashURL,
      paymentId: response.data.paymentID,
      orderId: payload.orderId,
      redirectUrl: response.data.bkashURL,
      rawResponse: response.data,
    };
  }
  public async executePayment(
    paymentId: string,
  ): Promise<PaymentVerificationResult> {
    const config = this.requireConfig();
    const response = await axios.post(
      `${config.baseUrl}/tokenized/checkout/execute`,
      { paymentID: paymentId },
      { headers: await this.headers(), timeout: 20000 },
    );
    const status = response.data?.transactionStatus;
    return {
      success:
        response.data?.statusCode === '0000' ||
        ['COMPLETED', 'SUCCESS'].includes(String(status).toUpperCase()),
      provider: 'bkash',
      paymentId,
      orderId: response.data?.merchantInvoiceNumber,
      status,
      rawResponse: response.data,
    };
  }
}
export default new BkashService();
