/// <reference types="vite/client" />
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

// Interface baseada na view tenant_with_plan e colunas da tabela tenants
export interface Tenant {
    id: string;
    slug: string;
    display_name: string;
    logo_url: string | null;
    status: 'active' | 'suspended' | 'blocked' | 'past_due' | 'cancelled';
    blocked_reason?: string;

    // Contato / Endereço
    whatsapp_number?: string;
    address?: any; // jsonb
    social_links?: any; // jsonb

    // Configurações
    store_base_url?: string;
    admin_base_url?: string;

    // Plano (Vindo do Join)
    plan_name?: string;
    plan_code_real?: string;
    plan_limits?: any;
    plan_features?: {
        cashback?: boolean;
        api_whatsapp?: boolean;
        multi_store?: boolean;
        // ...
    };

    // Legacy fields still present in table
    plan_code?: string;
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
        const resolveSlug = () => {
            const querySlug = searchParams.get('tenant') || new URLSearchParams(window.location.search).get('tenant');
            if (querySlug) return querySlug;
            if (params.slug) return params.slug;

            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            if (parts.length >= 2) {
                const sub = parts[0];
                const isIgnored = ['www', 'app', 'admin', 'store', 'market'].includes(sub);
                const isIp = /^[0-9]+$/.test(sub);
                if (!isIgnored && !isIp) return sub;
            }
            return import.meta.env.VITE_DEFAULT_TENANT_SLUG_STORE;
        };

        const slug = resolveSlug();

        if (!slug) {
            setLoading(false);
            return;
        }

        const fetchTenant = async () => {
            try {
                setLoading(true);

                // ✅ HOTFIX: Corrigindo colunas da view tenant_with_plan
                // A view usa tenant_slug e tenant_status (não slug/status)
                const { data, error } = await (supabase as any)
                    .from('tenant_with_plan')
                    .select('*')
                    .eq('tenant_slug', slug)       // ✅ Coluna correta da view
                    .eq('tenant_status', 'active') // ✅ Coluna correta da view
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    throw new Error('Loja não encontrada ou inativa.');
                }

                // ✅ Mapear colunas da view para interface Tenant (retrocompatibilidade)
                const mappedTenant: Tenant = {
                    id: data.tenant_id,
                    slug: data.tenant_slug,
                    display_name: data.tenant_name,
                    status: data.tenant_status,
                    logo_url: data.logo_url,
                    whatsapp_number: data.whatsapp_number,
                    address: data.address,
                    social_links: data.social_links,
                    store_base_url: data.store_base_url,
                    admin_base_url: data.admin_base_url,
                    plan_name: data.plan_name,
                    plan_code_real: data.plan_code,
                    plan_limits: data.plan_limits,
                    plan_features: data.plan_features,
                    plan_code: data.plan_code // Legacy
                };

                setTenant(mappedTenant);
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
