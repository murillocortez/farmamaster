import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTenant } from '../context/TenantContext'; // Import useTenant
import { db } from '../services/dbService';
import { Product } from '../types';
import {
  Minus, Plus, ShoppingCart, ChevronRight, Star, Truck, ShieldCheck,
  ArrowLeft, Heart, Share2, CreditCard, AlertTriangle
} from 'lucide-react';

import { Skeleton } from '../components/UIComponents';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, user, setIsLoginModalOpen } = useStore();
  const { tenant } = useTenant(); // Get Tenant
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (product && user && user.id) {
      db.getFavorites(user.id).then(favs => setIsFavorite(favs.includes(product.id)));
    }
  }, [product, user]);

  const toggleFavorite = async () => {
    if (!product) return;

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      if (user.id) {
        const result = await db.toggleFavorite(user.id, product.id);
        setIsFavorite(result.favorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erro ao atualizar favoritos.');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira ${product.name} na Farma Vida!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  useEffect(() => {
    if (id && tenant) {
      fetchProduct(id);
      db.getSettings(tenant.id).then(setSettings);
      window.scrollTo(0, 0);
    }
  }, [id, tenant]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const data = await db.getProduct(productId);
      setProduct(data);

      // Fetch related products (mock logic: fetch all and slice for now, ideally filter by category)
      if (tenant) {
        const allProducts = await db.getProducts(tenant.id);
        setRelatedProducts(allProducts.filter(p => p.id !== productId).slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Add quantity times
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Optional: Open cart or show toast
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 pt-4">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="w-64 h-6 mb-6" />
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
              <div className="p-6 lg:p-12 bg-gray-50 flex items-center justify-center">
                <Skeleton className="w-full max-w-md aspect-square rounded-xl" />
              </div>
              <div className="p-6 lg:p-12 flex flex-col">
                <Skeleton className="w-24 h-6 rounded-full mb-4" />
                <Skeleton className="w-3/4 h-10 mb-4" />
                <Skeleton className="w-48 h-6 mb-6" />
                <Skeleton className="w-full h-24 mb-6" />
                <Skeleton className="w-full h-32 mb-8" />
                <div className="flex gap-4 mt-auto">
                  <Skeleton className="w-32 h-12 rounded-xl" />
                  <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Produto não encontrado</h2>
        <Link to="/" className="text-primary hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  const currentPrice = product.promotionalPrice || product.price;
  const discount = product.promotionalPrice
    ? Math.round(((product.price - product.promotionalPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <ChevronRight size={14} />
          <span className="capitalize">{product.category}</span>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
            {/* Image Section */}
            <div className="p-6 lg:p-12 bg-gray-50 flex items-center justify-center relative group">
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 lg:hidden"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="relative w-full max-w-md aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
                {discount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 lg:p-12 flex flex-col">
              <div className="mb-auto">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    >
                      <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">(128 avaliações)</span>
                </div>

                {(product as any).stock < 10 && (product as any).stock > 0 && (
                  <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Restam apenas {(product as any).stock} unidades em estoque!
                  </div>
                )}

                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {product.promotionalPrice && (
                    <span className="text-gray-400 line-through text-lg block mb-1">
                      R$ {product.price.toFixed(2)}
                    </span>
                  )}
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                      R$ {currentPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 mb-1.5">/ unidade</span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                    <CreditCard size={14} />
                    Até {settings?.payment?.maxInstallments || 3}x de R$ {(currentPrice / (settings?.payment?.maxInstallments || 3)).toFixed(2)} sem juros
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck size={18} className="text-green-600" />
                    <span>Frete grátis para compras acima de R$ {settings?.delivery?.freeShippingThreshold?.toFixed(2).replace('.', ',') || '100,00'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheck size={18} className="text-blue-600" />
                    <span>Garantia de qualidade e procedência</span>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center bg-gray-100 rounded-xl p-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-white rounded-lg text-gray-600 transition-all shadow-sm hover:shadow"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-white rounded-lg text-primary transition-all shadow-sm hover:shadow"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:-translate-y-1"
                >
                  <ShoppingCart size={20} />
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quem viu, comprou também</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => (
              <Link key={related.id} to={`/product/${related.id}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                  <img
                    src={related.image}
                    alt={related.name}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{related.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{related.category}</p>
                <span className="font-bold text-primary">
                  R$ {(related.promotionalPrice || related.price).toFixed(2)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};