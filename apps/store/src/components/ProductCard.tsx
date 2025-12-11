import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Crown } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useTenant } from '../context/TenantContext';

interface ProductCardProps {
    product: Product;
    isVip?: boolean;
    vipDiscount?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isVip = false, vipDiscount = 0 }) => {
    const { addToCart } = useStore();
    const { tenant } = useTenant();
    const prefix = `/${tenant?.slug || 'farmavida'}`;

    const currentPrice = product.promotionalPrice || product.price;
    const vipPrice = isVip ? currentPrice * (1 - vipDiscount / 100) : null;

    return (
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group">
            <Link to={`${prefix}/product/${product.id}`} className="block relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
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
                <Link to={`${prefix}/product/${product.id}`} className="block">
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
};
