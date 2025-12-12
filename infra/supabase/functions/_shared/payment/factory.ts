import { PaymentProvider } from './types.ts';
import { StripeProvider } from './stripeProvider.ts';
import { MercadoPagoProvider } from './mercadoPagoProvider.ts';
import { PacPayProvider } from './pacPayProvider.ts';

export type ProviderType = 'stripe' | 'mercadopago' | 'pacpay';

export class PaymentFactory {
    static getProvider(type: ProviderType): PaymentProvider {
        switch (type) {
            case 'stripe':
                // Usage of non-null assertions assumed env var is present
                const apiKey = Deno.env.get('STRIPE_SECRET_KEY')!;
                if (!apiKey) throw new Error("STRIPE_SECRET_KEY not set");
                return new StripeProvider(apiKey);
            case 'mercadopago':
                return new MercadoPagoProvider();
            case 'pacpay':
                return new PacPayProvider();
            default:
                throw new Error(`Invalid payment provider: ${type}`);
        }
    }
}
