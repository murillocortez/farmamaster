import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../services/dbService';
import { Order } from '../types';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, ChevronRight, Calendar, DollarSign, MapPin, Truck, ShoppingBag, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/UIComponents';

export const Orders: React.FC = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await db.getOrders(user.id!);
                setOrders(data as any as Order[]);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'preparing': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'delivering': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'confirmed': return 'Confirmado';
            case 'preparing': return 'Em Preparo';
            case 'delivering': return 'Saiu para Entrega';
            case 'completed': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const toggleOrder = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 pt-4 px-4">
                <div className="max-w-3xl mx-auto">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-6 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
                        <p className="text-sm text-gray-500">Histórico dos últimos 6 meses</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={48} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido recente</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Você ainda não realizou compras nos últimos 6 meses. Aproveite nossas ofertas!</p>
                        <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:scale-105">
                            Começar a Comprar
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${expandedOrderId === order.id ? 'ring-2 ring-primary/10 shadow-md' : 'hover:shadow-md'}`}
                            >
                                {/* Card Header */}
                                <div
                                    onClick={() => toggleOrder(order.id)}
                                    className="p-5 cursor-pointer"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${(order as any).deliveryMethod === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {(order as any).deliveryMethod === 'delivery' ? <Truck size={24} /> : <Store size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">
                                                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-400 uppercase tracking-wider font-medium">Total</span>
                                                <span className="block text-lg font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                                            </div>
                                            <ChevronRight
                                                size={20}
                                                className={`text-gray-400 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrderId === order.id && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 animate-in slide-in-from-top-2">
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Itens do Pedido</h4>
                                                <div className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm bg-white p-3 rounded-lg border border-gray-100">
                                                            <div className="flex items-center gap-3">
                                                                <span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">
                                                                    {item.quantity}
                                                                </span>
                                                                <span className="text-gray-700 font-medium">{item.name}</span>
                                                            </div>
                                                            <span className="font-bold text-gray-900">
                                                                R$ {(item.price * item.quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Entrega</h4>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm">
                                                        <div className="flex items-start gap-2 text-gray-600 mb-1">
                                                            <MapPin size={16} className="mt-0.5 text-primary" />
                                                            <span className="flex-1">{order.address}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                                            <span className="text-gray-500">Método</span>
                                                            <span className="font-medium text-gray-900 capitalize">
                                                                {(order as any).deliveryMethod === 'delivery' ? 'Delivery' : 'Retirada na Loja'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pagamento</h4>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-100 text-sm flex justify-between items-center">
                                                        <span className="text-gray-600 capitalize">{order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' : order.paymentMethod}</span>
                                                        <span className="font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <button className="text-primary font-bold text-sm hover:underline">
                                                Precisa de ajuda com este pedido?
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
