import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '../components/UIComponents';

export const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-primary" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h1>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        Seu pedido foi confirmado e em breve sairá para entrega. Você receberá atualizações pelo WhatsApp.
      </p>

      <div className="bg-gray-50 p-4 rounded-xl w-full max-w-sm mb-8 border border-gray-100">
        <p className="text-sm text-gray-600">Tempo estimado</p>
        <p className="text-xl font-bold text-gray-900">30-45 min</p>
      </div>

      <Link to="/" className="w-full max-w-sm">
        <Button fullWidth variant="outline" className="gap-2">
          <Home size={18} />
          Voltar para Home
        </Button>
      </Link>
    </div>
  );
};