import { useTenant } from './context/TenantContext';

export const useTenantLoader = () => {
    const { tenant, loading, error } = useTenant();

    return {
        tenant,
        loading,
        error,
        // Helper derived states for UI
        isLoading: loading,
        isError: !!error,
        isActive: tenant?.status === 'active',
        isSuspended: tenant?.status === 'suspended',
        isBlocked: tenant?.status === 'blocked',
        isNotFound: !loading && !tenant,
        // Original data
        status: tenant?.status
    };
};
