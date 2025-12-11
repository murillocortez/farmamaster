import React, { useState } from 'react';
import { AlertTriangle, Lock, CreditCard, LifeBuoy, X, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase'; // Adjust based on actual path. Store usually has services/supabase.ts

interface AccessBlockerProps {
    tenant: any;
    reason?: string;
}

export const AccessBlocker: React.FC<AccessBlockerProps> = ({ tenant, reason }) => {
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    const handleRenovate = () => {
        // Redirect to Klyver Master Checkout
        const masterUrl = import.meta.env.VITE_MASTER_URL || 'http://localhost:5175'; // Fallback

        const checkoutUrl = `${masterUrl}/billing/checkout?tenantId=${tenant.id}&planId=${tenant.plan_id}&reason=block`;
        window.location.href = checkoutUrl;
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden text-center animate-in zoom-in duration-300">
                <div className="bg-red-50 p-8 flex flex-col items-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Loja Temporariamente Indisponível</h2>
                    <p className="text-slate-600 mt-2 max-w-sm mx-auto">
                        A loja <strong>{tenant.display_name}</strong> está com pendências administrativas.
                    </p>
                </div>

                <div className="p-8 space-y-4">
                    {reason && (
                        <div className="bg-orange-50 text-orange-800 text-sm p-3 rounded-lg border border-orange-100 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {reason}
                        </div>
                    )}

                    <div className="text-sm text-slate-500 mb-4">
                        Se você é o proprietário desta loja, clique abaixo para regularizar.
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            onClick={handleRenovate}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg transform active:scale-95"
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Acessar Painel de Cobrança
                        </button>

                        <button
                            onClick={() => setIsSupportOpen(true)}
                            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-medium py-3 px-6 rounded-xl border border-slate-200 flex items-center justify-center transition-colors"
                        >
                            <LifeBuoy className="w-5 h-5 mr-2 text-slate-400" />
                            Falar com Suporte Klyver
                        </button>
                    </div>
                </div>
            </div>

            {isSupportOpen && (
                <SupportModal
                    tenant={tenant}
                    onClose={() => setIsSupportOpen(false)}
                />
            )}
        </div>
    );
};

// Reuse Support Modal
const SupportModal: React.FC<{ tenant: any; onClose: () => void }> = ({ tenant, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            // Bypass TS check for support_tickets
            const { error } = await (supabase as any).from('support_tickets').insert({
                tenant_id: tenant.id,
                origin: 'store_block',
                subject: 'Bloqueio de Loja - ' + tenant.display_name,
                message: message,
                contact_name: name,
                contact_email: email,
                status: 'open',
                metadata: {
                    plan: tenant.plan_code || 'N/A',
                    status: tenant.status
                }
            });

            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            console.error(err);
            alert('Erro ao enviar ticket: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-8 text-center animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Solicitação Enviada!</h3>
                    <p className="text-slate-500 mt-2 mb-6">Nossa equipe entrará em contato em breve.</p>
                    <button onClick={onClose} className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg">
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-900">Suporte Klyver (Loja)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome</label>
                        <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Seu E-mail</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
                        <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                    </div>
                    <button disabled={sending} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors flex justify-center">
                        {sending ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                </form>
            </div>
        </div>
    );
};
