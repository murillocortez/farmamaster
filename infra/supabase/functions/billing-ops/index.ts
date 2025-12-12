import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PaymentFactory } from "../_shared/payment/factory.ts";

const PLANS = {
    starter: 'price_starter_placeholder', // REPLACE WITH REAL STRIPE PRICE ID
    pro: 'price_pro_placeholder',         // REPLACE WITH REAL STRIPE PRICE ID
    premium: 'price_premium_placeholder'  // REPLACE WITH REAL STRIPE PRICE ID
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        const tenantId = user.user_metadata?.tenant_id;
        if (!tenantId) {
            return new Response(JSON.stringify({ error: 'Tenant ID not found in user metadata' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Get Tenant Data securely
        // Create admin client to bypass RLS for reading tenant-specific billing keys if needed, 
        // BUT strictly filter by the ID we found in metadata.
        // Actually, we should use the user's client if possible, but reading 'stripe_customer_id' might be restricted?
        // Let's assume the user has read access to their own tenant row via RLS.
        // However, writing the `stripe_customer_id` back requires permissions.
        // Safer to use Service Role for the 'infra' operations, verifying the tenantId match.

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single();

        if (tenantError || !tenant) {
            throw new Error('Tenant not found');
        }

        const providerName = tenant.payment_provider || 'stripe';
        const provider = PaymentFactory.getProvider(providerName as any);

        // Initialize Stripe Customer if missing
        let stripeCustomerId = tenant.stripe_customer_id;
        if (providerName === 'stripe' && !stripeCustomerId) {
            console.log(`Creating Stripe customer for tenant ${tenantId}`);
            stripeCustomerId = await provider.createCustomer({
                email: tenant.email || user.email || 'billing@example.com',
                name: tenant.legal_name || tenant.display_name || 'Tenant',
                metadata: {
                    tenant_id: tenantId,
                    supabase_uid: user.id
                }
            });

            // Save back to DB
            await supabaseAdmin
                .from('tenants')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('id', tenantId);
        }

        const { action, plan } = await req.json();

        if (action === 'create_checkout') {
            if (!plan || !PLANS[plan]) {
                throw new Error('Invalid plan selected');
            }

            const priceId = PLANS[plan];
            // Note: In production, pass URLs from env vars
            const origin = req.headers.get('origin') || 'http://localhost:3000';

            const { url } = await provider.createCheckoutSession({
                customerId: stripeCustomerId,
                priceId: priceId,
                successUrl: `${origin}/admin/billing?success=true`,
                cancelUrl: `${origin}/admin/billing?canceled=true`,
                mode: 'subscription',
                metadata: {
                    tenant_id: tenantId,
                    plan_code: plan
                }
            });

            return new Response(JSON.stringify({ url }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (action === 'create_portal') {
            const origin = req.headers.get('origin') || 'http://localhost:3000';
            const { url } = await provider.createPortalSession({
                customerId: stripeCustomerId,
                returnUrl: `${origin}/admin/billing`
            });

            return new Response(JSON.stringify({ url }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        throw new Error('Invalid action');

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
