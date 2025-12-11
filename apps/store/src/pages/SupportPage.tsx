import React, { useState } from 'react';
import { Search, ChevronRight, FileText, LifeBuoy } from 'lucide-react';

// Reusing same FAQ data or duplicating? Given isolation, I'll simple duplicate or create a shared constant if I could, 
// but since they are separate projects for now, I'll copy the structure.
// In a real monorepo I would import from a shared package.
const FAQ_ARTICLES = [
    {
        id: '1',
        category: 'Pedidos',
        title: 'Como rastrear meu pedido?',
        description: 'Saiba onde está sua entrega em tempo real.',
        steps: [
            'Acesse "Meus Pedidos" no menu superior.',
            'Clique no pedido desejado.',
            'O status estará visível no topo da página (Ex: Em Separação, Saiu para Entrega).'
        ]
    },
    {
        id: '2',
        category: 'Pagamentos',
        title: 'Posso pagar na entrega?',
        description: 'Opções de pagamento disponíveis para delivery.',
        steps: [
            'Sim! Aceitamos cartão e dinheiro na entrega.',
            'Selecione "Pagar na Entrega" ao finalizar o pedido.',
            'Caso precise de troco, informe no campo de observação.'
        ]
    },
    {
        id: '3',
        category: 'Conta',
        title: 'Esqueci minha senha',
        description: 'Como recuperar o acesso à sua conta.',
        steps: [
            'Clique em "Entrar" e depois "Esqueci minha senha".',
            'Digite seu email cadastrado.',
            'Você receberá um link para criar uma nova senha.'
        ]
    },
    {
        id: '4',
        category: 'Produtos',
        title: 'Preciso de receita para comprar remédios?',
        description: 'Regras para medicamentos controlados.',
        steps: [
            'Para medicamentos isentos de prescrição (MIPs), não é necessário.',
            'Para antibióticos e controlados, a receita deve ser apresentada na entrega ou enviada digitalmente (se aceito).'
        ]
    }
];

export const SupportPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<typeof FAQ_ARTICLES[0] | null>(null);

    const filteredArticles = FAQ_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Como podemos ajudar?</h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Esta seção serve como ajuda rápida para uso da plataforma.
                        Para suporte administrativo ou dúvidas sobre pedidos específicos, entre em contato direto com a farmácia.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-10 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Busque por dúvidas (ex: entrega, pagamento)..."
                        className="w-full pl-14 pr-6 py-4 rounded-full border-none shadow-lg shadow-blue-100 focus:ring-4 focus:ring-blue-100 outline-none text-lg transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories/Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredArticles.map(article => (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-blue-500" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center text-white shadow-xl shadow-blue-200">
                    <LifeBuoy className="mx-auto mb-4 opacity-80" size={48} />
                    <h2 className="text-xl font-bold mb-2">Não encontrou o que procurava?</h2>
                    <p className="opacity-90 mb-6 max-w-md mx-auto">
                        Entre em contato conosco através dos nossos canais oficiais de atendimento.
                    </p>
                    <a href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-sm">
                        Voltar para a Loja
                    </a>
                </div>
            </div>

            {/* Article Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">{selectedArticle.title}</h3>
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-red-500 shadow-sm transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-600 mb-6 text-lg">{selectedArticle.description}</p>
                            {selectedArticle.steps && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Passo a Passo</h4>
                                    <ul className="space-y-3">
                                        {selectedArticle.steps.map((step, idx) => (
                                            <li key={idx} className="flex gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <span className="font-bold text-blue-600">{idx + 1}.</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 text-center">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="text-blue-600 font-bold text-sm hover:underline"
                            >
                                Fechar Ajuda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
