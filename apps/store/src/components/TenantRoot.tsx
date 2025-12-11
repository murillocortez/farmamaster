import React from 'react';
import { Outlet } from 'react-router-dom';
import { TenantProvider, useTenant } from '../context/TenantContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { StoreProvider } from '../context/StoreContext';

import { AccessBlocker } from './AccessBlocker';
import { useTenantAccessGuard } from '../hooks/useTenantAccessGuard';

const TenantStatusGuard: React.FC = () => {
    const { tenant, loading, error, isBlocked, blockedReason } = useTenantAccessGuard();

    React.useEffect(() => {
        if ((tenant as any)?.fantasyName) {
            document.title = `${(tenant as any).fantasyName} - App Farmavida`;
        }
    }, [tenant]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
                    <p className="text-gray-500 mb-6 text-sm">Verifique o endereço digitado.</p>
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
