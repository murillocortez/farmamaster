import { supabase } from './supabase';
import { CashbackTransaction, CashbackWallet } from '../types';

export const cashbackService = {
    // Wallet e Transações
    getWallet: async (customerId: string): Promise<CashbackWallet | null> => {
        const { data, error } = await supabase
            .from('cashback_wallet' as any)
            .select('saldo_atual, ultimo_credito, ultimo_debito, updated_at')
            .eq('customer_id', customerId)
            .single() as any;

        if (error && error.code !== 'PGRST116') { // Ignora erro de não encontrado (wallet vazia)
            console.error('Error fetching cashback wallet:', error);
            return null;
        }

        if (!data) return { saldoAtual: 0, updatedAt: new Date().toISOString() };

        return {
            saldoAtual: data.saldo_atual,
            ultimoCredito: data.ultimo_credito,
            ultimoDebito: data.ultimo_debito,
            updatedAt: data.updated_at
        };
    },

    getTransactions: async (customerId: string): Promise<CashbackTransaction[]> => {
        const { data, error } = await supabase
            .from('cashback_transactions' as any)
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false }) as any;

        if (error) {
            console.error('Error fetching cashback transactions:', error);
            return [];
        }

        return data.map((t: any) => ({
            id: t.id,
            tipo: t.tipo,
            valor: t.valor,
            dataExpiracao: t.data_expiracao,
            createdAt: t.created_at
        }));
    },

    // Uso de Cashback no Checkout
    useCashback: async (orderId: string, customerId: string, amount: number): Promise<boolean> => {
        // Chama a função RPC criada no banco
        const { data, error } = await (supabase as any).rpc('use_cashback', {
            p_order_id: orderId,
            p_customer_id: customerId,
            p_amount_to_use: amount
        });

        if (error) {
            console.error('Error using cashback:', error);
            return false;
        }
        return data as boolean; // Retorna true se sucesso
    }
};
