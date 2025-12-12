import { PaymentProvider, CreateCustomerParams, CreateCheckoutSessionParams, CreatePortalSessionParams, SubscriptionInfo, WebhookEvent } from './types.ts';

export class PacPayProvider implements PaymentProvider {
    createCustomer(params: CreateCustomerParams): Promise<string> {
        throw new Error("Method not implemented.");
    }
    createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ url: string; sessionId: string; }> {
        throw new Error("Method not implemented.");
    }
    createPortalSession(params: CreatePortalSessionParams): Promise<{ url: string; }> {
        throw new Error("Method not implemented.");
    }
    getSubscriptionInfo(subscriptionId: string): Promise<SubscriptionInfo> {
        throw new Error("Method not implemented.");
    }
    cancelSubscription(subscriptionId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    constructWebhookEvent(payload: string, signature: string, secret: string): Promise<WebhookEvent> {
        throw new Error("Method not implemented.");
    }
}
