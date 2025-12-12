import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PaymentFactory } from "../_shared/payment/factory.ts";

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
        return new Response('Missing signature or secret', { status: 400 });
    }

    try {
        const body = await req.text();
        const provider = PaymentFactory.getProvider('stripe');
        const event = await provider.constructWebhookEvent(body, signature, webhookSecret);

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log(`Received event: ${event.type}`);

        if (event.type === 'checkout.session.completed') {
            const session = event.data;
            const tenantId = session.metadata?.tenant_id;
            const customerId = session.customer;
            const subscriptionId = session.subscription;

            if (tenantId) {
                // First time subscription, link customer ID if not already
                await supabaseAdmin
                    .from('tenants')
                    .update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        subscription_status: 'active' // approximate, usually 'active' or 'trialling'
                    })
                    .eq('id', tenantId);
            }
        } else if (event.type === 'customer.subscription.updated') {
            const sub = event.data;
            const customerId = sub.customer;

            await supabaseAdmin
                .from('tenants')
                .update({
                    stripe_subscription_id: sub.id,
                    subscription_status: sub.status,
                    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    stripe_price_id: sub.items?.data[0]?.price?.id,
                    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
                })
                .eq('stripe_customer_id', customerId);

        } else if (event.type === 'customer.subscription.deleted') {
            const sub = event.data;
            const customerId = sub.customer;

            await supabaseAdmin
                .from('tenants')
                .update({
                    subscription_status: 'canceled',
                    stripe_subscription_id: null
                })
                .eq('stripe_customer_id', customerId);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
});
