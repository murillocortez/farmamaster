/// <reference types="vite/client" />
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase'; // Assuming separate service or shared

interface Tenant {
    id: string;
    slug: string;
    display_name: string;
    logo_url: string | null;
    plan_id: string;
    plan_code: string;
    status: 'active' | 'suspended' | 'trial' | 'cancelled' | 'blocked' | 'past_due';
    admin_base_url: string | null;
    store_base_url: string | null;
    blocked_reason?: string;
}

interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
    error: string | null;
}

const TenantContext = createContext<TenantContextType>({
    tenant: null,
    loading: true,
    error: null,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const params = useParams<{ slug: string }>();

    const [searchParams] = useSearchParams();

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Determine slug: Query Param (?tenant=...) > Route Param (:slug) > Env logic
        // @ts-ignore
        const slug = searchParams.get('tenant') ||
            new URLSearchParams(window.location.search).get('tenant') ||
            params.slug ||
            import.meta.env.VITE_DEFAULT_TENANT_SLUG_STORE;

        if (!slug) {
            setLoading(false);
            return;
        }

        const fetchTenant = async () => {
            try {
                setLoading(true);
                // Use maybeSingle() to handle 0 results gracefully without throwing "coercion" error
                const { data, error } = await (supabase as any)
                    .from('tenants')
                    .select('id, slug, display_name, logo_url, plan_code, status, store_base_url, whatsapp_number, address, social_links')
                    .eq('slug', slug)
                    .maybeSingle();

                if (error) throw error;
                if (!data) throw new Error('Farmácia não encontrada ou inativa.');

                setTenant(data as unknown as Tenant);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching tenant:', err);
                setError(err.message || 'Erro ao carregar farmácia.');
                setTenant(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTenant();
    }, [params.slug, searchParams]);

    return (
        <TenantContext.Provider value={{ tenant, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
