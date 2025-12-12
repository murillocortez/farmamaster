import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Plus, Crown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { DailyOffer, Product } from '../types';
import { db } from '../services/dbService';
import { Skeleton } from '../components/UIComponents';

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [activeCategory, setActiveCategory] = useState('todos');
  const { addToCart, user } = useStore();
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (tenant) {
      fetchData();
      db.getSettings(tenant.id).then(setSettings);
    }
  }, [tenant]);

  // Carousel Auto-Rotation
  useEffect(() => {
    if (offers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [offers.length]);

  const fetchData = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const [productsResponse, offersResponse] = await Promise.all([
        supabase.from('products')
          .select('*')
          .eq('status', 'active')
          .eq('tenant_id', tenant.id),
        supabase.from('daily_offers')
          .select('*')
          .eq('active', true)
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (offersResponse.error) throw offersResponse.error;

      const mappedProducts: Product[] = productsResponse.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.price,
        promotionalPrice: p.promotional_price,
        category: (p.category || 'Outros').toLowerCase(),
        image: p.images?.[0] || 'https://via.placeholder.com/150',
        requiresPrescription: p.requires_prescription
      }));

      const mappedOffers: DailyOffer[] = offersResponse.data.map((o: any) => ({
        id: o.id,
        title: o.title,
        subtitle: o.subtitle,
        imageUrl: o.image_url,
        productId: o.product_id,
        active: o.active
      }));

      setProducts(mappedProducts);
      setOffers(mappedOffers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : activeCategory === 'todos'
      ? products
      : activeCategory === 'promocoes'
        ? products.filter(p => p.promotionalPrice && p.promotionalPrice < p.price)
        : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  const handleBannerClick = (offer: DailyOffer) => {
    if (offer.productId) {
      // Navigate to product (handled by Link if used, or programmatic navigation)
    } else {
      setActiveCategory('promocoes');
      // Scroll to products
      document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % offers.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + offers.length) % offers.length);

  const isVip = user?.tags?.includes('VIP') && settings?.vip?.enabled;
  const vipDiscount = settings?.vip?.discountPercentage || 0;

  if (loading) {
    return (
      <div className="pb-24 max-w-7xl mx-auto px-4 pt-4">
        <Skeleton className="w-full h-8 mb-4" />
        <div className="flex gap-2 overflow-hidden mb-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="w-24 h-8 rounded-full flex-shrink-0" />)}
        </div>
        <Skeleton className="w-full aspect-[16/9] md:aspect-[21/8] rounded-3xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4" />
              <Skeleton className="w-1/2 h-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Welcome Message */}
      {settings?.store?.welcomeMessage && (
        <div
          className="text-center py-2 px-4 text-sm font-medium transition-colors duration-300"
          style={{
            backgroundColor: settings.store.welcomeMessageBgColor || '#2563eb',
            color: settings.store.welcomeMessageTextColor || '#ffffff'
          }}
        >
          {settings.store.welcomeMessage}
        </div>
      )}

      {/* Categories Horizontal Scroll */}
      <div className="sticky top-[116px] z-20 bg-slate-50/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeCategory === cat.id && !searchQuery
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Offers Carousel */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-8">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/8] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 group">
            {offers.length > 0 ? (
              <>
                <div
                  className="flex transition-transform duration-700 ease-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {offers.map(offer => (
                    <div key={offer.id} className="w-full h-full flex-shrink-0 relative">
                      {offer.imageUrl ? (
                        <img src={offer.imageUrl} alt={offer.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500" />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/30" />

                      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 text-white">
                        <span className="bg-secondary w-fit text-white text-xs px-2 py-1 rounded-md uppercase tracking-wider font-bold mb-2">Oferta do dia</span>
                        <h2 className="text-2xl md:text-4xl font-bold mb-1">{offer.title}</h2>

                        {offer.subtitle && <p className="text-white/90 text-sm md:text-base mb-4">{offer.subtitle}</p>}

                        {offer.productId ? (
                          <Link
                            to={`/product/${offer.productId}`}
                            className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold w-fit hover:bg-gray-100 transition-colors shadow-md"
                          >
                            Ver Oferta
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleBannerClick(offer)}
                            className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold w-fit hover:bg-gray-100 transition-colors shadow-md"
                          >
                            Ver Promoções
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {offers.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors z-20"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors z-20"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {offers.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Fallback Banner */
              <div className="w-full h-full bg-gradient-to-r from-primary to-blue-500 flex items-center px-10 relative">
                {settings?.store?.bannerUrl && (
                  <img src={settings.store.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {settings?.store?.bannerUrl && <div className="absolute inset-0 bg-black/20" />}

                <div className="relative z-10 text-white">
                  <span className="bg-secondary text-white text-xs px-2 py-1 rounded-md uppercase tracking-wider font-bold">Oferta do dia</span>
                  <h2 className="text-3xl font-bold mt-2">Saúde em 1º Lugar</h2>
                  <p className="text-white/90 mt-1">Confira nossas promoções especiais.</p>
                  <button
                    onClick={() => setActiveCategory('promocoes')}
                    className="mt-4 bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
                  >
                    Ver Promoções
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="max-w-4xl mx-auto px-4" id="product-grid">
        <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">
          {searchQuery ? `Resultados para "${searchQuery}"` : CATEGORIES.find(c => c.id === activeCategory)?.name}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
            {searchQuery && (
              <button
                onClick={() => window.location.href = '/'}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => {
              const currentPrice = product.promotionalPrice || product.price;
              const vipPrice = isVip ? currentPrice * (1 - vipDiscount / 100) : null;

              return (
                <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group">
                  <Link to={`/product/${product.id}`} className="block relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.promotionalPrice && (
                      <span className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        {Math.round(((product.price - product.promotionalPrice) / product.price) * 100)}% OFF
                      </span>
                    )}
                    {isVip && (
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Crown size={10} />
                        VIP
                      </span>
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                    </Link>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <div className="flex flex-col">
                        {product.promotionalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                        )}

                        {isVip && vipPrice ? (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              R$ {currentPrice.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-purple-600">
                              R$ {vipPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            R$ {currentPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="p-2 rounded-lg bg-gray-100 text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended for You (AI Mock) */}
      {user && !searchQuery && (
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recomendados para você</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {products.slice(0, 4).map((product) => (
              <div key={`rec-${product.id}`} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group">
                <Link to={`/product/${product.id}`} className="block relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="flex-1 flex flex-col">
                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    <span className="text-sm font-bold text-primary">
                      R$ {(product.promotionalPrice || product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 rounded-lg bg-gray-100 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};