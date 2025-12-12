import { Stripe } from 'https://esm.sh/stripe@14.10.0?target=deno';
import {
    PaymentProvider,
    CreateCustomerParams,
    CreateCheckoutSessionParams,
    CreatePortalSessionParams,
    SubscriptionInfo,
    WebhookEvent
} from './types.ts';

export class StripeProvider implements PaymentProvider {
    private stripe: Stripe;

    constructor(apiKey: string) {
        this.stripe = new Stripe(apiKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });
    }

    async createCustomer(params: CreateCustomerParams): Promise<string> {
        const customer = await this.stripe.customers.create({
            email: params.email,
            name: params.name,
            metadata: params.metadata,
        });
        return customer.id;
    }

    async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ url: string; sessionId: string }> {
        const session = await this.stripe.checkout.sessions.create({
            customer: params.customerId,
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            mode: params.mode || 'subscription',
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
            subscription_data: params.mode === 'subscription' && params.trialDays ? {
                trial_period_days: params.trialDays
            } : undefined,
            allow_promotion_codes: true,
        });

        if (!session.url) {
            throw new Error('Failed to create checkout session URL');
        }

        return { url: session.url, sessionId: session.id };
    }

    async createPortalSession(params: CreatePortalSessionParams): Promise<{ url: string }> {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: params.customerId,
            return_url: params.returnUrl,
        });

        return { url: session.url };
    }

    async getSubscriptionInfo(subscriptionId: string): Promise<SubscriptionInfo> {
        const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
        return {
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            priceId: sub.items.data[0].price.id,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
    }

    async constructWebhookEvent(payload: string, signature: string, secret: string): Promise<WebhookEvent> {
        try {
            const event = await this.stripe.webhooks.constructEventAsync(
                payload,
                signature,
                secret
            );
            return {
                id: event.id,
                type: event.type,
                data: event.data.object,
            };
        } catch (err) {
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }
}
