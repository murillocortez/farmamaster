import { supabase } from './supabase';
import { Product, User } from '../types';

export const db = {
    // Agora requer SLUG para contexto seguro
    async getProducts(slug: string): Promise<Product[]> {
        // Usando a nova RPC segura que define contexto
        const { data, error } = await supabase.rpc('get_store_products_with_batches', { p_slug: slug });

        if (error) throw error;

        return (data as any[]).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            promotionalPrice: p.promotional_price,
            image: p.images?.[0] || '',
            category: p.category,
            requiresPrescription: p.requires_prescription,
            stock: p.total_stock || 0
        }));
    },

    async getProduct(slug: string, id: string): Promise<Product | null> {
        // Usamos a lista e filtramos no cliente para simplificar? 
        // Ou criamos RPC de single product?
        // Como o RLS bloqueia leitura direta, precisamos de RPC ou garantir que set_store_context foi chamado na sessao (inviavel http).
        // Vamos usar getProducts e filtrar, ou criar RPC especifica.
        // Dado o volume, o melhor é RPC especifica ou filtrar aqui se a lista for pequena. 
        // Assumindo catalogo pequeno por enquanto.
        const products = await this.getProducts(slug);
        return products.find(p => p.id === id) || null;
    },

    async getDailyOffers(slug: string) {
        const { data, error } = await supabase.rpc('get_store_offers_rpc', { p_slug: slug });

        if (error) throw error;
        return data;
    },

    async getSettings(slug: string) {
        const { data, error } = await supabase.rpc('get_store_settings', { p_slug: slug });

        if (error || !data || data.length === 0) {
            // Default de fallback seguro
            return {
                pharmacy: { name: 'Farma Store', cnpj: '', address: '', phone: '', email: '', openingHours: '', logoUrl: '' },
                appearance: { primaryColor: '#10B981', secondaryColor: '#34D399', borderRadius: '0.5rem' },
                delivery: { methods: { delivery: true, pickup: true }, feeType: 'fixed', fixedFee: 0, freeShippingThreshold: 0 },
                payment: { pixEnabled: true },
                store: { welcomeMessage: '', bannerUrl: '' }
            };
        }

        const settings = data[0] as any;
        return {
            pharmacy: {
                name: settings.pharmacy_name,
                cnpj: settings.cnpj,
                address: settings.address,
                phone: settings.phone,
                email: settings.email,
                openingHours: settings.opening_hours,
                logoUrl: settings.logo_url
            },
            appearance: {
                primaryColor: settings.primary_color,
                secondaryColor: settings.secondary_color,
                borderRadius: settings.border_radius
            },
            delivery: {
                methods: settings.delivery_config?.methods || { delivery: true, pickup: true },
                feeType: settings.delivery_config?.feeType || 'fixed',
                fixedFee: settings.delivery_config?.fixedFee || 0,
                freeShippingThreshold: settings.delivery_config?.freeShippingThreshold || 0,
                minimumOrderValue: settings.minimum_order_value
            },
            payment: {
                pixEnabled: settings.payment_config?.pixEnabled !== false // Default true
            },
            store: {
                welcomeMessage: settings.welcome_message,
                bannerUrl: settings.banner_url
            }
        };
    },

    async loginOrRegister(slug: string, name: string, phone: string): Promise<User> {
        // Nova RPC V2 com slug e isolamento
        const { data, error } = await supabase.rpc('login_or_register_customer_v2', {
            p_slug: slug,
            p_name: name,
            p_phone: phone
        });

        if (error) throw error;
        if (!data) throw new Error('Failed to login/register');

        const customer = data as any;

        return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email || undefined,
            address: customer.address || undefined,
            cpf: customer.cpf || undefined,
            birthDate: customer.birth_date || undefined,
            created_at: new Date().toISOString(), // RPC pode não retornar created_at
            tags: customer.tags || []
        };
    },

    async checkCustomerByPhone(slug: string, phone: string): Promise<User | null> {
        const { data, error } = await supabase.rpc('check_customer_v2' as any, {
            p_slug: slug,
            p_phone: phone
        });

        if (error) throw error;

        const result = data as any;
        if (result && result.exists) {
            return {
                id: result.id,
                name: result.name,
                phone: result.phone
            } as User;
        }
        return null;
    },

    async updateProfile(id: string, profile: Partial<User>): Promise<void> {
        const { error } = await supabase.rpc('update_customer_profile', {
            p_id: id,
            p_name: (profile.name || null) as any,
            p_email: (profile.email || null) as any,
            p_address: (profile.address || null) as any,
            p_cpf: (profile.cpf || null) as any,
            p_birth_date: (profile.birthDate || null) as any
        });

        if (error) throw error;
    },

    async getOrders(customerId: string) {
        // TODO: RPC get_customer_orders DEVE ser atualizada ou validada. 
        // Assumindo que a RPC existente filtra por ID e não vaza outros tenants se o ID for UUID v4 aleatório.
        // O ideal é RPC get_my_orders(slug, phone) mas o auth atual é precário.
        const { data, error } = await supabase.rpc('get_customer_orders', { p_customer_id: customerId });

        if (error) throw error;

        return (data as any[]).map((o: any) => ({
            id: o.id,
            total: o.total_amount,
            status: o.status,
            createdAt: o.created_at,
            address: o.delivery_address,
            paymentMethod: o.payment_method,
            deliveryMethod: o.delivery_method,
            items: o.items || []
        }));
    },

    // Create Order V2
    async createOrder(slug: string, orderData: any) {
        // Mapear dados para V2
        const { data, error } = await supabase.rpc('create_complete_order_v2', {
            p_slug: slug,
            p_customer_id: orderData.customerId,
            p_items: orderData.items,
            p_total: orderData.total,
            p_payment_method: orderData.paymentMethod,
            p_delivery_method: orderData.deliveryMethod,
            p_address: orderData.address,
            p_delivery_fee: orderData.deliveryFee
        });

        if (error) throw error;
        return data;
    },

    // Favorites (Mantido simples, ideal migrar para RPC segura com slug)
    // O RLS de favorites provavelmente bloqueia anon, então precisa de RPC.
    async getFavorites(userId: string): Promise<string[]> {
        const { data, error } = await supabase.rpc('get_customer_favorites', { p_user_id: userId });
        if (error) return [];
        return (data as any[]).map(d => d.product_id);
    },

    async getFavoriteProducts(userId: string): Promise<Product[]> {
        const { data, error } = await supabase.rpc('get_customer_favorites', { p_user_id: userId });
        if (error) return [];
        return (data as any[]).map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            promotionalPrice: item.product.promotional_price,
            image: item.product.images?.[0] || '',
            category: item.product.category,
            requiresPrescription: item.product.requires_prescription,
            stock: 0
        }));
    },

    async toggleFavorite(userId: string, productId: string): Promise<{ favorited: boolean }> {
        const { data, error } = await supabase.rpc('toggle_customer_favorite', {
            p_user_id: userId,
            p_product_id: productId
        });
        if (error) throw error;
        return { favorited: data as boolean };
    }
};
