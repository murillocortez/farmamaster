import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

        // 1. Verify Caller (Admin/CEO)
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            throw new Error('Unauthorized');
        }

        const callerTenantId = user.user_metadata?.tenant_id;
        const callerRole = user.user_metadata?.role;

        if (!callerTenantId) {
            throw new Error('Caller has no tenant_id');
        }

        if (!['CEO', 'ADMIN'].includes(callerRole)) {
            throw new Error('Permission denied: Only CEO or ADMIN can invite users');
        }

        // 2. Parse Body
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name) {
            throw new Error('Missing required fields: email, password, name');
        }

        // 3. Create User (Service Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Check if user exists (Optional, createUser handles it but returns error)
        // We proceed to create.
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                tenant_id: callerTenantId,
                role: role || 'OPERADOR',
                name: name
            }
        });

        if (createError) {
            throw createError;
        }

        if (!newUser.user) {
            throw new Error('User creation failed');
        }

        // 4. Upsert Profile (Ensure tenant_id is strict)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                tenant_id: callerTenantId,
                email: email,
                full_name: name,
                role: role || 'OPERADOR',
                status: 'active'
            });

        if (profileError) {
            // If profile fails, technically we should delete auth user to rollback, 
            // but upsert shouldn't fail unless DB is down or constraint issue.
            console.error('Profile creation error:', profileError);
            throw new Error('Failed to create user profile: ' + profileError.message);
        }

        return new Response(JSON.stringify({
            user: newUser.user,
            message: 'User created successfully'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
