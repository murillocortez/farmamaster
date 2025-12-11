import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Save, User as UserIcon, MapPin, CreditCard, Mail, Phone, LogOut, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cashbackService } from '../services/cashbackService';
import { CashbackWallet } from '../types';

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

export const Profile = () => {
    const { user, updateProfile, logout } = useStore();
    const [wallet, setWallet] = useState<CashbackWallet | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birthDate: '',
        address: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                cpf: user.cpf || '',
                birthDate: user.birthDate || '',
                address: user.address || ''
            });
            loadCashback();
        }
    }, [user]);

    const loadCashback = async () => {
        if (user?.id) {
            const data = await cashbackService.getWallet(user.id);
            setWallet(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(formData);
            setIsEditing(false);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Tem certeza que deseja sair?')) {
            logout();
        }
    };

    return (
        <div className="pb-24 pt-4 px-4 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold">Meu Perfil</h1>
            </div>

            {/* Card Cashback */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                    <Banknote size={150} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-1">
                        <Banknote size={16} />
                        <span>Seu Saldo Cashback</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(wallet?.saldoAtual || 0)}
                    </h2>
                    {wallet?.saldoAtual ? (
                        <p className="text-sm text-gray-400">
                            Válido até: <span className="text-white font-bold">Consulte regras</span>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400">Faça compras para ganhar de volta!</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-4 mb-6">

                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <UserIcon size={32} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">{user?.name}</h2>
                        <p className="text-sm text-gray-500">Membro desde {formatDate((user as any).created_at)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="tel"
                                value={formData.phone}
                                disabled={true} // Phone is usually the identifier, keep it disabled for now
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isEditing}
                                placeholder="seu@email.com"
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                disabled={!isEditing}
                                placeholder="000.000.000-00"
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Entrega</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                disabled={!isEditing}
                                placeholder="Rua, Número, Bairro, Complemento"
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                            />
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? 'Salvando...' : (
                                    <>
                                        <Save size={20} />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
                            >
                                Editar Perfil
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={20} />
                                Sair da Conta
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
