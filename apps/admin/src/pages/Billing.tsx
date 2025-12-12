import React, { useEffect, useState } from 'react';
import { db } from '../services/dbService';
import { TenantSubscription } from '../types';
import { Check, CreditCard, ExternalLink, Package, Shield, Star, Zap } from 'lucide-react';

const PLANS = [
    {
        code: 'starter',
        name: 'Starter',
        price: 49,
        features: ['1 Usuário', '500 Produtos', 'Gestão de Estoque', 'PDV Básico', 'Suporte por Email'],
        color: 'blue',
        icon: Package
    },
    {
        code: 'pro',
        name: 'Pro',
        price: 99,
        features: ['3 Usuários', '2.000 Produtos', 'Gestão Completa', 'PDV Avançado', 'Relatórios Financeiros', 'Suporte Prioritário'],
        color: 'purple',
        popular: true,
        icon: Star
    },
    {
        code: 'premium',
        name: 'Premium',
        price: 199,
        features: ['Usuários Ilimitados', 'Produtos Ilimitados', 'Multi-Lojas', 'API de Integração', 'Gerente de Conta', 'Suporte 24/7'],
        color: 'orange',
        icon: Shield
    }
];

export function Billing() {
    const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const data = await db.getTenantSubscription();
            setSubscription(data);
        } catch (error) {
            console.error('Failed to load subscription', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planCode: string) => {
        try {
            setProcessing(planCode);
            const url = await db.createCheckoutSession(planCode);
            window.location.href = url;
        } catch (error: any) {
            alert('Erro ao iniciar assinatura: ' + error.message);
            setProcessing(null);
        }
    };

    const handlePortal = async () => {
        try {
            setProcessing('portal');
            const url = await db.createPortalSession();
            window.location.href = url;
        } catch (error: any) {
            alert('Erro ao abrir portal: ' + error.message);
            setProcessing(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    const currentPlanCode = subscription?.plan_code || 'free';
    const isSubscribed = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 p-6 lg:p-10">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Meu Plano</h1>
                <p className="text-gray-500 mt-2">Gerencie sua assinatura e cobranças.</p>
            </div>

            {/* Current Status */}
            <div className="max-w-6xl mx-auto mb-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Status da Assinatura</h2>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize
                                ${subscription?.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                                    subscription?.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                                        subscription?.subscription_status === 'past_due' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'}`}>
                                {subscription?.subscription_status || 'Sem Plano Ativo'}
                            </span>
                            {subscription?.current_period_end && (
                                <span className="text-sm text-gray-500">
                                    Renova em {new Date(subscription.current_period_end).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {isSubscribed ? (
                        <button
                            onClick={handlePortal}
                            disabled={!!processing}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {processing === 'portal' ? 'Carregando...' : (
                                <>
                                    <CreditCard size={18} />
                                    Gerenciar Assinatura
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-2">Escolha um plano abaixo para começar.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map(plan => {
                    const isCurrent = currentPlanCode === plan.code && isSubscribed;
                    const isPopular = plan.popular;

                    return (
                        <div key={plan.code}
                            className={`relative bg-white rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 flex flex-col
                             ${isPopular ? 'border-purple-200 shadow-purple-50 ring-1 ring-purple-100' : 'border-gray-200 shadow-sm'}
                             ${isCurrent ? 'ring-2 ring-green-500 border-green-500' : ''}
                             `}>

                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg shadow-purple-200 uppercase tracking-wide">
                                    Mais Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6
                                ${plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    plan.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                        'bg-orange-50 text-orange-600'}`}>
                                <plan.icon size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-gray-900">R$ {plan.price}</span>
                                <span className="text-gray-500 font-medium">/mês</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.code)}
                                disabled={!!processing || isCurrent}
                                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${isCurrent
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : isPopular
                                            ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-purple-200'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
                                `}
                            >
                                {processing === plan.code ? 'Processando...' :
                                    isCurrent ? 'Plano Atual' : 'Assinar Agora'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
