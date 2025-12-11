import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button, Input } from './UIComponents';
import { db } from '../services/dbService';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';

    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 3) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Validate phone length (11 digits + formatting)
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length !== 11) {
      alert('Por favor, digite um número de celular válido com DDD.');
      return;
    }

    setLoading(true);
    try {
      if (step === 'input') {
        // Check if user exists
        const existingUser = await db.checkCustomerByPhone(phone);

        if (existingUser) {
          // User exists, login directly
          // Optionally verify name match, but for now we just login as per "no password" flow
          await login(existingUser.name, phone);
          // Login function in context usually closes modal, but let's be sure
          setIsLoginModalOpen(false);
        } else {
          // New user, go to confirmation
          setStep('confirm');
        }
      } else {
        // Confirm step: Create new user
        await login(name, phone);
        setIsLoginModalOpen(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setStep('input');
    setName('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'input' ? 'Entrar na Farma Vida' : 'Confirmar Cadastro'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Celular"
              placeholder="(00) 0 0000-0000"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              required
              maxLength={16}
            />

            <div className="pt-2">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Verificando...' : 'Continuar'}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Ao continuar, você concorda com nossos termos de uso.
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">É sua primeira vez aqui!</p>
                <p>Por favor, confira se seus dados estão corretos para finalizarmos seu cadastro.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nome</span>
                <p className="text-lg font-medium text-gray-900">{name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Celular</span>
                <p className="text-lg font-medium text-gray-900">{phone}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                disabled={loading}
                fullWidth
              >
                Corrigir
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Cadastrando...' : 'Confirmar e Entrar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};