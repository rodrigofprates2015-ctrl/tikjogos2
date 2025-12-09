import { MercadoPagoConfig, Payment } from 'mercadopago';

let _client: MercadoPagoConfig | null = null;
let _payment: Payment | null = null;
let _lastToken: string | null = null;

function getCleanAccessToken(): string {
  let token = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  token = token.trim().replace(/^=+/, '');
  return token;
}

function getPaymentClient(): Payment {
  const currentToken = getCleanAccessToken();
  
  if (!_client || _lastToken !== currentToken) {
    _client = new MercadoPagoConfig({
      accessToken: currentToken,
    });
    _payment = new Payment(_client);
    _lastToken = currentToken;
  }
  
  if (!_payment) {
    _payment = new Payment(_client);
  }
  return _payment;
}

export interface ThemeData {
  titulo: string;
  palavras: string[];
  autor: string;
  isPublic?: boolean;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: number;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  expirationDate?: string;
  error?: string;
}

export async function createPayment(themeData: ThemeData): Promise<PaymentResponse> {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN && !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return {
      success: false,
      error: 'Mercado Pago access token not configured'
    };
  }

  try {
    const payment = getPaymentClient();
    const idempotencyKey = `theme-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Get the webhook URL for notifications
    // Priority: APP_URL env var > RAILWAY_PUBLIC_DOMAIN > REPLIT_DEV_DOMAIN
    let webhookUrl = process.env.APP_URL || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.REPLIT_DEV_DOMAIN;
    if (webhookUrl && !webhookUrl.startsWith('http')) {
      webhookUrl = `https://${webhookUrl}`;
    }
    const notificationUrl = webhookUrl ? `${webhookUrl}/webhook` : undefined;
    
    console.log('[Payment] Creating payment with notification_url:', notificationUrl);
    
    const paymentData: any = {
      transaction_amount: 1.50, // Valor do tema personalizado
      description: `Tema Personalizado: ${themeData.titulo}`,
      payment_method_id: 'pix',
      payer: {
        email: 'cliente@impostor.tikjogos.com.br',
        first_name: themeData.autor,
        last_name: 'TikJogos'
      },
      metadata: {
        titulo: themeData.titulo,
        palavras: JSON.stringify(themeData.palavras),
        autor: themeData.autor,
        isPublic: themeData.isPublic ?? true
      }
    };
    
    // Add notification_url if available - CRITICAL for webhook to work
    if (notificationUrl) {
      paymentData.notification_url = notificationUrl;
    }

    const response = await payment.create({
      body: paymentData,
      requestOptions: {
        idempotencyKey
      }
    });

    if (response.point_of_interaction?.transaction_data) {
      const transactionData = response.point_of_interaction.transaction_data;
      
      return {
        success: true,
        paymentId: response.id,
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
        ticketUrl: transactionData.ticket_url,
        expirationDate: response.date_of_expiration || undefined
      };
    }

    return {
      success: false,
      error: 'Failed to generate PIX QR Code'
    };

  } catch (error: any) {
    console.error('[Payment] Error creating payment:', error);
    return {
      success: false,
      error: error.message || 'Unknown payment error'
    };
  }
}

export async function getPaymentStatus(paymentId: number): Promise<{
  status: string;
  metadata?: any;
}> {
  try {
    const payment = getPaymentClient();
    const response = await payment.get({ id: paymentId });
    return {
      status: response.status || 'unknown',
      metadata: response.metadata
    };
  } catch (error: any) {
    console.error('[Payment] Error getting payment status:', error);
    return {
      status: 'error'
    };
  }
}
