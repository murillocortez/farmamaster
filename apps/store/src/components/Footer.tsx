import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Twitter, MessageCircle, Video, ArrowRight, CreditCard, Banknote } from 'lucide-react';
import { db } from '../services/dbService';
import { supabase } from '../services/supabase';
import { useTenant } from '../context/TenantContext';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const { tenant } = useTenant();

    useEffect(() => {
        if (tenant?.slug) {
            db.getSettings(tenant.slug).then(setSettings);
        }
    }, [tenant?.slug]);

    if (!settings) return null;

    const { pharmacy, socialMedia } = settings;

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await (supabase
                .from('newsletter_subscribers' as any) as any)
                .insert({ email });

            if (error) {
                if (error.code === '23505') {
                    alert('Este email já está cadastrado!');
                } else {
                    throw error;
                }
            } else {
                alert(`Obrigado por se inscrever, ${email}!`);
                setEmail('');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Erro ao se inscrever. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Social */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            {pharmacy.logoUrl ? (
                                <img src={pharmacy.logoUrl} alt={pharmacy.name} className="h-12 w-auto object-contain bg-white rounded-lg p-1" />
                            ) : (
                                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
                                    {pharmacy.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <span className="text-xl font-bold text-white block leading-none">{pharmacy.name}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Farmácia</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sua saúde é nossa prioridade. Entregamos bem-estar e cuidado na porta da sua casa com a confiança que você merece.
                        </p>
                        <div className="flex gap-4">
                            {socialMedia?.instagram && (
                                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-pink-600 transition-all duration-300">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {socialMedia?.facebook && (
                                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {socialMedia?.whatsapp && (
                                <a href={socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-green-500 transition-all duration-300">
                                    <MessageCircle size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Categorias</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/category/medicamentos" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-600" /> Medicamentos</Link></li>
                            <li><Link to="/category/dermocosmeticos" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-600" /> Dermocosméticos</Link></li>
                            <li><Link to="/category/infantil" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-600" /> Infantil</Link></li>
                            <li><Link to="/category/suplementos" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-600" /> Suplementos</Link></li>
                            <li><Link to="/category/higiene" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={14} className="text-gray-600" /> Higiene</Link></li>
                        </ul>
                    </div>

                    {/* Help & Contact */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Ajuda & Contato</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/support" className="flex items-center gap-3 hover:text-primary transition-colors">
                                <span className="bg-gray-800 p-1.5 rounded-lg"><MessageCircle size={14} className="text-primary" /></span>
                                <span className="font-medium text-white">Central de Ajuda</span>
                            </Link></li>
                            <li className="flex items-start gap-3">
                                <Phone size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="block text-gray-400 text-xs mb-0.5">Televendas</span>
                                    <span className="text-white font-medium">{pharmacy.phone}</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="block text-gray-400 text-xs mb-0.5">Email</span>
                                    <span className="text-white font-medium">{pharmacy.email}</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock size={18} className="text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="block text-gray-400 text-xs mb-0.5">Horário</span>
                                    <span className="text-white font-medium">{pharmacy.openingHours}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Novidades</h3>
                        <p className="text-sm text-gray-400 mb-4">Receba ofertas exclusivas e dicas de saúde diretamente no seu email.</p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu melhor email"
                                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Inscrevendo...' : 'Inscrever-se'}
                            </button>
                        </form>
                        <div className="mt-6">
                            <span className="text-xs text-gray-500 block mb-3">Formas de Pagamento</span>
                            <div className="flex gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-800">PIX</span>
                                </div>
                                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                                    <CreditCard size={20} className="text-gray-800" />
                                </div>
                                <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                                    <Banknote size={20} className="text-gray-800" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-500">
                        <div className="space-y-2">
                            <p><span className="font-semibold text-gray-400">Razão Social:</span> {pharmacy.name}</p>
                            <p><span className="font-semibold text-gray-400">CNPJ:</span> {pharmacy.cnpj}</p>
                            <p><span className="font-semibold text-gray-400">Endereço:</span> {pharmacy.address}</p>
                            {pharmacy.pharmacistName && (
                                <p>
                                    <span className="font-semibold text-gray-400">Farmacêutico Resp:</span> {pharmacy.pharmacistName}
                                    {pharmacy.pharmacistRegister && ` | CRF: ${pharmacy.pharmacistRegister}`}
                                </p>
                            )}
                            {pharmacy.additionalPharmacists?.map((pharm: any, index: number) => (
                                <p key={index}>
                                    <span className="font-semibold text-gray-400">Farmacêutico(a):</span> {pharm.name}
                                    {pharm.register && ` | CRF: ${pharm.register}`}
                                </p>
                            ))}
                        </div>
                        <div className="md:text-right">
                            <p className="mb-2">
                                As informações contidas neste site não devem ser usadas para automedicação e não substituem, em hipótese alguma, as orientações dadas pelo profissional da área médica.
                            </p>
                            <p>
                                © {new Date().getFullYear()} {pharmacy.name}. Todos os direitos reservados.
                            </p>
                            <p className="mt-4 flex items-center justify-center md:justify-end gap-1 text-gray-600">
                                Feito com ❤️ por <a href="https://murillocortez.carrd.co/" target="_blank" rel="noopener noreferrer" className="text-gray-400 font-medium hover:text-primary transition-colors">Murillo Cortez</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
