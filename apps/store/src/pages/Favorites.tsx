import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { db } from '../services/dbService';
import { Product } from '../types';
import { ShoppingCart, Trash2, ArrowLeft, Heart } from 'lucide-react';
import { Skeleton } from '../components/UIComponents';

export const Favorites: React.FC = () => {
    const { user, addToCart } = useStore();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchFavorites();
    }, [user, navigate]);

    const fetchFavorites = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const products = await db.getFavoriteProducts(user.id!);
            setFavorites(products);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (productId: string) => {
        if (!user) return;
        try {
            await db.toggleFavorite(user.id!, productId);
            setFavorites(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 pt-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Favoritos</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100">
                                <Skeleton className="w-full aspect-square rounded-xl mb-4" />
                                <Skeleton className="w-3/4 h-6 mb-2" />
                                <Skeleton className="w-1/2 h-6" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
                </div>

                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Heart size={48} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Você ainda não favoritou nenhum produto.</h2>
                        <p className="text-gray-500 mb-8">Explore nossa loja e salve seus produtos preferidos.</p>
                        <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors">
                            Explorar Produtos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {favorites.map(product => (
                            <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
                                <button
                                    onClick={() => handleRemoveFavorite(product.id)}
                                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
                                    title="Remover dos favoritos"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 h-10">{product.name}</h3>
                                    <div className="flex items-end gap-2 mb-4">
                                        <span className="text-lg font-bold text-primary">
                                            R$ {(product.promotionalPrice || product.price).toFixed(2)}
                                        </span>
                                        {product.promotionalPrice && (
                                            <span className="text-sm text-gray-400 line-through mb-1">
                                                R$ {product.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-gray-50 hover:bg-primary hover:text-white text-gray-900 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={18} />
                                    Adicionar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
