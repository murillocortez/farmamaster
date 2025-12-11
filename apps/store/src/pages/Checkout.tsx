import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, CreditCard, Bike, Store, DollarSign, Wallet, Crown,
  CheckCircle, AlertCircle, ShieldCheck, Lock, Edit2, ChevronRight, Truck, Banknote
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { db } from '../services/dbService';
import { cashbackService } from '../services/cashbackService';
import { CashbackWallet } from '../types';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, user, clearCart, updateProfile } = useStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'cash'>('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Cashback States
  const [cashbackWallet, setCashbackWallet] = useState<CashbackWallet | null>(null);
  const [useCashback, setUseCashback] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
    if (user) {
      if (user.address) {
        setAddress(user.address);
      } else {
        setIsEditingAddress(true);
      }
      // Load Cashback
      cashbackService.getWallet(user.id!).then(setCashbackWallet);
    }
    db.getSettings().then(setSettings);
  }, [cart, navigate, user]);

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      alert('Por favor, preencha o endereço.');
      return;
    }

    try {
      const fullAddress = complement ? `${address} - ${complement}` : address;

      // Update local state
      setIsEditingAddress(false);

      // Update user profile in Supabase if user exists
      if (user) {
        await updateProfile({ address: fullAddress });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Erro ao salvar endereço. Tente novamente.');
    }
  };

  const isVip = user?.tags?.includes('VIP') && settings?.vip?.enabled;
  const vipDiscountPercent = isVip ? (settings?.vip?.discountPercentage || 0) : 0;
  const discountAmount = (cartTotal * vipDiscountPercent) / 100;

  const freeShippingThreshold = settings?.delivery?.freeShippingThreshold;
  const fixedFee = settings?.delivery?.fixedFee || 5.90;

  let deliveryFee = 0;
  if (deliveryMethod === 'delivery') {
    if (!freeShippingThreshold || freeShippingThreshold === 0) {
      deliveryFee = 0;
    } else if (cartTotal >= freeShippingThreshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = fixedFee;
    }
  }

  // Cashback Logic
  const availableCashback = cashbackWallet?.saldoAtual || 0;
  // Desconto máximo é o total parcial (produtos - desconto vip + frete) ou o saldo disponível
  const partialTotal = cartTotal - discountAmount + deliveryFee;
  const cashbackDiscount = useCashback ? Math.min(availableCashback, partialTotal) : 0;

  const total = partialTotal - cashbackDiscount;

  const handleConfirmOrder = async () => {
    if (!address && deliveryMethod === 'delivery') {
      alert('Por favor, informe o endereço de entrega.');
      return;
    }

    if (!user) {
      alert('Usuário não identificado.');
      return;
    }

    setIsProcessing(true);

    try {
      const fullAddress = complement ? `${address} - ${complement}` : address;

      // Ensure address is saved to profile even if they didn't click "Save Address"
      if (user.address !== fullAddress) {
        await updateProfile({ address: fullAddress });
      }

      const { data: orderId, error } = await (supabase as any).rpc('create_order', {
        p_customer_name: user.name,
        p_customer_phone: user.phone,
        p_address: fullAddress,
        p_items: cart.map(item => {
          const originalPrice = item.promotionalPrice || item.price;
          const discountedPrice = isVip ? originalPrice * (1 - vipDiscountPercent / 100) : originalPrice;
          return {
            productId: item.id,
            quantity: item.quantity,
            price: discountedPrice
          };
        }),
        p_payment_method: paymentMethod,
        p_delivery_method: deliveryMethod,
        p_delivery_fee: deliveryFee,
        p_customer_id: user.id
      });

      if (error) throw error;

      // Process Cashback Usage if selected
      if (useCashback && cashbackDiscount > 0 && user.id) {
        await cashbackService.useCashback(orderId || null, user.id, cashbackDiscount);
      }

      clearCart();
      navigate('/success');
    } catch (err) {
      console.error('Error creating order:', err);
      alert((err as any).message || 'Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Finalizar Pedido</h1>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium">
            <Lock size={12} />
            Compra Segura
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Order Summary */}
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Resumo do Pedido</h2>
                <p className="text-sm text-gray-500 mt-1">Revise seus itens antes de finalizar</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 relative">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Store size={20} />
                          </div>
                        )}
                        <span className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          R$ {((item.promotionalPrice || item.price) * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">
                            R$ {(item.promotionalPrice || item.price).toFixed(2)} un
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>

                  {isVip && discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-purple-600 font-medium bg-purple-50 p-2 rounded-lg">
                      <span className="flex items-center gap-1"><Crown size={14} /> Desconto VIP</span>
                      <span>- R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Entrega</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Cashback Toggle */}
                  {availableCashback > 0 && (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-3 text-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-300 mb-0.5">
                          <Banknote size={12} />
                          <span>Saldo Cashback</span>
                        </div>
                        <p className="font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableCashback)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={useCashback}
                          onChange={(e) => setUseCashback(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  )}

                  {useCashback && cashbackDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-bold">
                      <span>Desconto Cashback</span>
                      <span>- R$ {cashbackDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary block leading-none">
                        R$ {total.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {settings?.payment?.maxInstallments > 1
                          ? `em até ${settings.payment.maxInstallments}x sem juros`
                          : 'à vista'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: User Data & Payment */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">

            {/* 1. User Data */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
                  Seus Dados
                </h2>
                {isVip && (
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown size={12} /> VIP
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg border-2 border-white shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                  <p className="text-gray-500 text-sm">{user?.phone}</p>
                  {user?.email && <p className="text-gray-400 text-sm">{user.email}</p>}
                </div>
                <button onClick={() => navigate('/profile')} className="text-primary text-sm font-medium hover:underline">
                  Editar
                </button>
              </div>
            </section>

            {/* 2. Delivery */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
                Entrega
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${deliveryMethod === 'delivery'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}
                >
                  <Bike size={28} />
                  <div className="text-center">
                    <span className="block font-bold text-sm">Delivery</span>
                    <span className="text-xs opacity-80">Receba em casa</span>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${deliveryMethod === 'pickup'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 text-gray-500'
                    }`}
                >
                  <Store size={28} />
                  <div className="text-center">
                    <span className="block font-bold text-sm">Retirada</span>
                    <span className="text-xs opacity-80">Busque na loja</span>
                  </div>
                </button>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <MapPin size={18} className="text-primary" />
                      Endereço de Entrega
                    </div>
                    {!isEditingAddress && (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Edit2 size={12} /> Alterar
                      </button>
                    )}
                  </div>

                  {isEditingAddress ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua, Número, Bairro"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Complemento (Apto, Bloco, Ponto de referência)"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      />
                      <button
                        onClick={handleSaveAddress}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                      >
                        Salvar Endereço
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 text-sm leading-relaxed">{address}</p>
                      {complement && <p className="text-gray-500 text-xs mt-1">{complement}</p>}
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                        <Truck size={12} />
                        <span>Previsão: 30-45 min</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 3. Payment */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
                Pagamento
              </h2>

              <div className="space-y-3">
                {[
                  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, desc: 'Pague na entrega' },
                  { id: 'pix', label: 'PIX', icon: Wallet, desc: 'Aprovação imediata', badge: 'Recomendado' },
                  { id: 'cash', label: 'Dinheiro', icon: DollarSign, desc: 'Pague na entrega' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all relative overflow-hidden group ${paymentMethod === method.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`p-3 rounded-full ${paymentMethod === method.id ? 'bg-white text-primary shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                      <method.icon size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <span className={`block font-bold text-sm ${paymentMethod === method.id ? 'text-primary' : 'text-gray-900'}`}>
                        {method.label}
                      </span>
                      <span className="text-xs text-gray-500">{method.desc}</span>
                    </div>
                    {method.badge && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {method.badge}
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-primary' : 'border-gray-300'
                      }`}>
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === 'credit' && settings?.payment?.creditCardEnabled && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Parcelamento</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white">
                    <option value={1}>1x de R$ {total.toFixed(2)} (À vista)</option>
                    {Array.from({ length: (settings.payment.maxInstallments || 1) - 1 }, (_, i) => i + 2).map(parcela => (
                      <option key={parcela} value={parcela}>
                        {parcela}x de R$ {(total / parcela).toFixed(2)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <img
                        src="https://farmavida.carrd.co/assets/images/image02.jpg?v=b9153012"
                        alt="QR Code PIX"
                        className="w-48 h-48 object-contain"
                      />
                    </div>

                    <div className="w-full">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-2 text-center">Chave PIX (Copia e Cola)</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value="36926037000192"
                          className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("36926037000192");
                            alert("Chave PIX copiada!");
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={14} /> Copiar
                        </button>
                      </div>
                    </div>

                    <div className="text-center text-xs text-blue-600 bg-blue-100/50 px-3 py-2 rounded-lg w-full">
                      <p>Após o pagamento, envie o comprovante no WhatsApp para agilizar a liberação.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Mobile Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-30 safe-area-bottom">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Total a pagar</span>
                <span className="text-xl font-bold text-primary">R$ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    Finalizar Pedido <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>

            {/* Desktop Action */}
            <div className="hidden lg:block">
              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </div>
                ) : (
                  <>
                    Finalizar Pedido <ChevronRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-6 text-gray-400 grayscale opacity-70">
                <div className="flex items-center gap-1 text-xs">
                  <ShieldCheck size={14} />
                  <span>ANVISA Autorizada</span>
                </div>
                <div className="h-3 w-px bg-gray-300" />
                <span className="text-xs">CNPJ: {settings?.pharmacy?.cnpj || '00.000.000/0001-00'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};