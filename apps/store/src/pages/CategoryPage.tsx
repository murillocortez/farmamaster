import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/dbService';
import { ProductCard } from '../components/ProductCard';

export const CategoryPage: React.FC = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                // Mock fetching products by category. 
                // In real app, db.getProducts would filter or we'd filter in memory
                const allProducts = await db.getProducts();
                // Simple client-side filter for now
                const filtered = allProducts.filter((p: any) =>
                    p.category?.toLowerCase() === categoryId?.toLowerCase() ||
                    p.tags?.includes(categoryId)
                );
                setProducts(filtered);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [categoryId]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 capitalize text-gray-800">
                {categoryId}
            </h1>

            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Nenhum produto encontrado nesta categoria.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};
