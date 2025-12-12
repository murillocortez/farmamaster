import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // 1. Verify Caller
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        const callerTenantId = user.user_metadata?.tenant_id;
        const callerRole = user.user_metadata?.role;

        // Strict Validation
        if (!callerTenantId) throw new Error('Security Violation: Caller has no tenant_id');
        if (!['CEO', 'ADMIN'].includes(callerRole)) throw new Error('Permission denied');

        const { email, password, name, role } = await req.json();
        if (!email || !password || !name) throw new Error('Missing fields');

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        let targetUserId = '';
        let shouldUpdateAuth = false;

        // 2. Check if User Exists
        // Note: listUsers is expensive, but getUserByEmail logic is needed.
        // admin.createUser fails if exists.

        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        // This is bad for scale, but standard `getUserByEmail` isn't exposed directly in some SDK versions?
        // Actually `admin.audit` or something?
        // Let's try `createUser` first.

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                tenant_id: callerTenantId,
                role: role || 'OPERADOR',
                name: name
            }
        });

        if (createError) {
            // Logic: If user exists, check ownership
            if (createError.message?.includes('registered')) { // "User already registered" message varies
                // Need to find the user to check metadata
                // We can use listUsers with filter? 
                // Or just try to inviteUserByEmail which returns the user?
                // No, let's search.
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
                const match = users.find(u => u.email === email);

                if (!match) throw new Error('User conflict detected but could not resolve');

                const existingTenant = match.user_metadata?.tenant_id;

                if (existingTenant && existingTenant !== callerTenantId) {
                    throw new Error(`This email is already associated with another pharmacy (Tenant: ${existingTenant}). Contact support.`);
                }

                // If no tenant or same tenant, we CLAIM/UPDATE
                targetUserId = match.id;
                shouldUpdateAuth = true;
            } else {
                throw createError;
            }
        } else {
            targetUserId = newUser.user.id;
        }

        // 3. Update Auth Metadata if reclaiming
        if (shouldUpdateAuth) {
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
                user_metadata: {
                    tenant_id: callerTenantId, // Enforce current tenant
                    role: role || 'OPERADOR',
                    name: name
                },
                password: password // Reset password to what Admin provided?
                // User asked: "O Admin... cria membros". Usually this implies setting password.
                // If we reclaim, we reset password so the new Admin can give it to the user.
            });
        }

        // 4. Upsert Profile (Strict Enforcement)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: targetUserId,
                tenant_id: callerTenantId,
                email: email,
                full_name: name,
                role: role || 'OPERADOR',
                status: 'active'
            });

        if (profileError) throw new Error('Profile creation failed: ' + profileError.message);

        return new Response(JSON.stringify({ success: true, userId: targetUserId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
