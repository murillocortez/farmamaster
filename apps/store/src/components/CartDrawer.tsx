import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, Ticket, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from './UIComponents';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    user,
    setIsLoginModalOpen
  } = useStore();

  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const deliveryFee = 5.00;
  const freeDeliveryThreshold = 100.00;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary" />
            <h2 className="text-lg font-bold">Sua Cesta</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag size={48} className="text-gray-300" />
              <p>Sua cesta está vazia</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                Começar a comprar
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">
                      R$ {(item.promotionalPrice || item.price).toFixed(2)}
                    </span>

                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) removeFromCart(item.id);
                          else updateQuantity(item.id, -1);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-l-lg text-gray-600"
                      >
                        {item.quantity === 1 ? <Trash2 size={14} className="text-secondary" /> : <Minus size={14} />}
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-r-lg text-primary"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 bg-white border-t space-y-4 safe-area-bottom">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <Button fullWidth onClick={handleCheckout}>
              Finalizar Pedido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};