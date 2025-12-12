export interface CreateCustomerParams {
    email: string;
    name: string;
    metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionParams {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    mode?: 'subscription' | 'payment';
    trialDays?: number;
}

export interface CreatePortalSessionParams {
    customerId: string;
    returnUrl: string;
}

export interface SubscriptionInfo {
    id: string;
    status: string;
    currentPeriodEnd: Date;
    priceId: string;
    cancelAtPeriodEnd: boolean;
}

export interface WebhookEvent {
    id: string;
    type: string;
    data: any;
}

export interface PaymentProvider {
    createCustomer(params: CreateCustomerParams): Promise<string>; // Returns customer ID
    createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ url: string; sessionId: string }>;
    createPortalSession(params: CreatePortalSessionParams): Promise<{ url: string }>;
    getSubscriptionInfo(subscriptionId: string): Promise<SubscriptionInfo>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    // Webhook handler is usually provider specific in implementation details, 
    // but we can have a verify signature method
    constructWebhookEvent(payload: string, signature: string, secret: string): Promise<WebhookEvent>;
}
