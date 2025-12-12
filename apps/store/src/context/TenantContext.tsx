/// <reference types="vite/client" />
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

interface Tenant {
    id: string;
    slug: string;
    display_name: string;
    logo_url: string | null;
    plan_code: string;
    status: 'active' | 'suspended' | 'trial' | 'cancelled' | 'blocked' | 'past_due';
    admin_base_url: string | null;
    store_base_url: string | null;
    whatsapp_number: string | null;
    address: any;
    social_links: any;
    store_background_url?: string; // Optional visual
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
            // 1. Query Param (?tenant=slug) - Priority for Testing
            const querySlug = searchParams.get('tenant') || new URLSearchParams(window.location.search).get('tenant');
            if (querySlug) return querySlug;

            // 2. Route Param (/loja/:slug)
            if (params.slug) return params.slug;

            // 3. Subdomain (slug.domain.com)
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            // Localhost support: slug.localhost (length 2 usually? or slug.localhost.com)
            // Production: slug.farmamaster.com
            // Exclude: www, app, admin, store (if main domain)

            if (parts.length >= 2) {
                const sub = parts[0];
                const isIgnored = ['www', 'app', 'admin', 'store', 'market'].includes(sub);
                // If localhost, parts[1] is 'localhost'. slug.localhost works.
                // If IP, usually 4 parts numeric.
                const isIp = /^[0-9]+$/.test(sub);

                if (!isIgnored && !isIp) {
                    return sub;
                }
            }

            // 4. Env Fallback (Dev Only)
            return import.meta.env.VITE_DEFAULT_TENANT_SLUG_STORE;
        };

        const slug = resolveSlug();

        console.group('Store Tenant Resolution');
        console.log('Hostname:', window.location.hostname);
        console.log('Resolved Slug:', slug);
        console.groupEnd();

        if (!slug) {
            console.warn('No slug resolved. Store cannot load.');
            setError('Loja não especificada.');
            setLoading(false);
            return;
        }

        const fetchTenant = async () => {
            try {
                setLoading(true);
                // Now works because of "Public Active Tenants" policy
                const { data, error } = await (supabase as any)
                    .from('tenants')
                    .select('id, slug, display_name, logo_url, plan_code, status, store_base_url, whatsapp_number, address, social_links')
                    .eq('slug', slug)
                    // Ensure we only get ACTIVE stores (Policy enforces this, but explicit filter is good)
                    .eq('status', 'active')
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    throw new Error('Loja não encontrada ou inativa.');
                }

                console.log('Tenant Loaded:', data.display_name);
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
