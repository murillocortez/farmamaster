import React, { createContext, useContext, useEffect, useState } from 'react';
import { licenseService, LicenseStatus } from '../services/licenseService';

interface SubscriptionContextType {
    license: LicenseStatus | null;
    loading: boolean;
    isFeatureEnabled: (feature: keyof LicenseStatus['features']) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({} as SubscriptionContextType);

// Tela de Bloqueio Integrada (Loja)
const BlockScreen = ({ license }: { license: LicenseStatus }) => (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center border border-gray-100">
            <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loja Indisponível</h2>
            <p className="text-gray-500 mb-6">
                No momento esta loja encontra-se indisponível para pedidos. Por favor, tente novamente mais tarde.
            </p>

            <div className="space-y-3">
                <button className="w-full bg-primary text-white font-medium py-2.5 rounded-lg transition-colors opacity-50 cursor-not-allowed">
                    Fazer Pedido
                </button>
            </div>
        </div>
    </div>
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Na Loja, não dependemos de usuario logado para validar a licença da LOJA.
    const [license, setLicense] = useState<LicenseStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            try {
                const data = await licenseService.checkLicense();
                setLicense(data);
            } catch (err) {
                console.error("Falha ao verificar licença MASTER:", err);
            } finally {
                setLoading(false);
            }
        };

        check();

        const intervalId = setInterval(check, 30 * 60 * 1000); // 30 min
        return () => clearInterval(intervalId);
    }, []);

    const isFeatureEnabled = (feature: keyof LicenseStatus['features']) => {
        if (!license) return false;
        return license.features[feature] ?? false;
    };

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-gray-50">Carregando loja...</div>;
    }

    if (license && license.status === 'blocked') {
        return <BlockScreen license={license} />;
    }

    return (
        <SubscriptionContext.Provider value={{ license, loading, isFeatureEnabled }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
