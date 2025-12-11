import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Detect installable prompt (Android/Desktop)
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Check if running standalone already
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

            if (!isStandalone) {
                // Show prompt after a small delay to not annoy immediately
                setTimeout(() => setShowPrompt(true), 10000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, show prompt based on localStorage logic if not standalone
        if (ios) {
            const isStandalone = (window.navigator as any).standalone;
            if (!isStandalone) {
                setTimeout(() => setShowPrompt(true), 10000);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (isIOS) {
                alert("Para instalar no iPhone/iPad:\n1. Toque no botão 'Compartilhar' (ícone quadrado com seta)\n2. Role para baixo e toque em 'Adicionar à Tela de Início'");
            }
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 border border-emerald-100 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl shrink-0">
                    {isIOS ? <Smartphone className="text-emerald-600 w-6 h-6" /> : <Download className="text-emerald-600 w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Instalar App Farmavida</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        {isIOS
                            ? "Instale nossa loja para acesso rápido e ofertas exclusivas."
                            : "Adicione nossa loja à sua tela inicial para acesso rápido e offline."}
                    </p>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Agora não
                        </button>
                        <button
                            onClick={handleInstallClick}
                            className="px-3 py-1.5 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            {isIOS ? 'Como Instalar' : 'Instalar Agora'}
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
