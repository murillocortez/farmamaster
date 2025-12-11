import axios from 'axios';
import { supabase } from './supabase';

export interface LicenseStatus {
    status: 'active' | 'pending' | 'blocked';
    plan: string;
    daysRemaining: number;
    features: {
        cashback: boolean;
        api_whatsapp: boolean;
        curve_abc: boolean;
        multi_loja: boolean;
        lista_inteligente: boolean;
    };
    tenantId: string;
    tenantName: string;
}

const MASTER_API_URL = 'https://master.seusistema.app/api/license-status';

const FALLBACK_LICENSE: LicenseStatus = {
    status: 'active',
    plan: 'Fallback Basic',
    daysRemaining: 1,
    features: {
        cashback: false,
        api_whatsapp: false,
        curve_abc: false,
        multi_loja: false,
        lista_inteligente: false
    },
    tenantId: 'fallback',
    tenantName: 'Modo Offline'
};

export const licenseService = {
    async checkLicense(): Promise<LicenseStatus> {
        const CACHE_KEY = 'store_license_status';
        const tenantId = await this.getTenantId();

        try {
            const response = await axios.get(`${MASTER_API_URL}?tenant_id=${tenantId}`, {
                timeout: 5000
            });

            const status = response.data;

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: status,
                timestamp: Date.now()
            }));

            return status;

        } catch (error) {
            console.warn('Falha ao contactar MASTER. Verificando cache...', error);

            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const HOURS_72 = 72 * 60 * 60 * 1000;

                if (Date.now() - timestamp < HOURS_72) {
                    return data;
                }
            }

            return {
                ...FALLBACK_LICENSE,
                status: 'blocked',
                tenantName: 'Erro de Conexão'
            };
        }
    },

    async getTenantId(): Promise<string | null> {
        // Na loja, talvez o tenantId venha da URL ou de uma config fixa,
        // não necessariamente do user logado (pois pode ser visitante).
        // Mas vamos manter a lógica de fallback.
        return '00000000-0000-0000-0000-000000000000';
    }
};
