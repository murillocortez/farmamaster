import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TenantProvider, useTenant } from '../context/TenantContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { StoreProvider } from '../context/StoreContext';

import { AccessBlocker } from './AccessBlocker';
import { useTenantAccessGuard } from '../hooks/useTenantAccessGuard';

const TenantStatusGuard: React.FC = () => {
    const { tenant, loading, error, isBlocked, blockedReason } = useTenantAccessGuard();
    const { slug: slugParam } = useParams<{ slug: string }>();

    React.useEffect(() => {
        if ((tenant as any)?.fantasyName) {
            document.title = `${(tenant as any).fantasyName} - FarmaMaster Store`;
        }
    }, [tenant]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-500">Carregando loja...</p>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        // ✅ Adicionar debug info em desenvolvimento
        const isDev = import.meta.env.DEV;

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
                    <p className="text-gray-500 mb-6 text-sm">
                        Verifique o endereço digitado ou entre em contato com o suporte.
                    </p>

                    {isDev && (
                        <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200 text-left">
                            <strong className="block mb-1">🔍 Debug Info:</strong>
                            <div className="space-y-1 font-mono">
                                <div>Slug tentado: <strong>{slugParam || 'N/A'}</strong></div>
                                <div>Hostname: <strong>{window.location.hostname}</strong></div>
                                <div>Error: <strong className="text-red-600">{error || 'N/A'}</strong></div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.href = '/#/farmavida'}
                        className="mt-6 w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
                    >
                        Ir para loja padrão
                    </button>
                </div>
            </div>
        );
    }

    if (isBlocked) {
        return <AccessBlocker tenant={tenant} reason={blockedReason || undefined} />;
    }

    return (
        <StoreProvider>
            <SubscriptionProvider>
                <Outlet />
            </SubscriptionProvider>
        </StoreProvider>
    );
};

export const TenantRoot: React.FC = () => {
    return (
        <TenantProvider>
            <TenantStatusGuard />
        </TenantProvider>
    );
};
