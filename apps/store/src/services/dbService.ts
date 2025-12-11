import { supabase } from './supabase';
import { Product, User } from '../types';

export const db = {
    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_batches(*)')
            .eq('status', 'active');

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
            stock: p.product_batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0
        }));
    },

    async getProduct(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*, product_batches(*)')
            .eq('id', id)
            .single();

        if (error) return null;

        const product = data as any;

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            promotionalPrice: product.promotional_price,
            image: product.images?.[0] || '',
            category: product.category,
            requiresPrescription: product.requires_prescription,
            stock: product.product_batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0
        };
    },

    async getDailyOffers() {
        const { data, error } = await supabase
            .from('daily_offers')
            .select('*')
            .eq('active', true);

        if (error) throw error;
        return data;
    },

    async loginOrRegister(name: string, phone: string): Promise<User> {
        const { data, error } = await supabase.rpc('login_or_register_customer', {
            p_name: name,
            p_phone: phone
        } as any);

        if (error) throw error;
        if (!data) throw new Error('Failed to login/register');

        const customer = data as any;

        return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            cpf: customer.cpf,
            birthDate: customer.birth_date,
            created_at: customer.created_at,
            tags: customer.tags || []
        };
    },

    async checkCustomerByPhone(phone: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        const customer = data as any;
        return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            cpf: customer.cpf,
            birthDate: customer.birth_date,
            created_at: customer.created_at,
            tags: customer.tags || []
        };
    },

    async updateProfile(id: string, profile: Partial<User>): Promise<void> {
        const { error } = await supabase.rpc('update_customer_profile', {
            p_id: id,
            p_name: profile.name,
            p_email: profile.email,
            p_address: profile.address,
            p_cpf: profile.cpf,
            p_birth_date: profile.birthDate || null
        } as any);

        if (error) throw error;
    },

    async getSettings() {
        const { data, error } = await supabase.from('store_settings').select('*').single();
        if (error || !data) {
            // Return default if not found
            return {
                pharmacy: { name: 'Farma Vida', cnpj: '', address: '', phone: '', email: '', openingHours: '', logoUrl: '' },
                delivery: { methods: { delivery: true, pickup: true }, feeType: 'fixed', fixedFee: 0, freeShippingThreshold: 0 },
                payment: { pixEnabled: true },
                store: { welcomeMessage: '', bannerUrl: '' }
            };
        }

        const settings = data as any;

        return {
            pharmacy: {
                name: settings.pharmacy_name,
                cnpj: settings.cnpj,
                address: settings.address,
                phone: settings.phone,
                email: settings.email,
                openingHours: settings.opening_hours,
                logoUrl: settings.logo_url,
                primaryColor: settings.primary_color,
                secondaryColor: settings.secondary_color,
                pharmacistName: settings.pharmacist_name,
                pharmacistRegister: settings.pharmacist_register,
                additionalPharmacists: settings.additional_pharmacists || []
            },
            socialMedia: {
                whatsapp: settings.social_whatsapp,
                instagram: settings.social_instagram,
                tiktok: settings.social_tiktok,
                twitter: settings.social_twitter,
                linkedin: settings.social_linkedin,
                facebook: settings.social_facebook
            },
            delivery: {
                fixedFee: settings.fixed_delivery_fee,
                freeShippingThreshold: settings.free_shipping_threshold
            },
            payment: {
                pixEnabled: settings.payment_pix_enabled,
                creditCardEnabled: settings.payment_credit_enabled,
                maxInstallments: settings.payment_credit_max_installments || 3,
            },
            store: {
                welcomeMessage: settings.welcome_message || '',
                welcomeMessageBgColor: settings.welcome_message_bg_color || '#2563eb',
                welcomeMessageTextColor: settings.welcome_message_text_color || '#ffffff',
                bannerUrl: settings.banner_url || ''
            }
        };
    },

    async getOrders(customerId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('customer_id', customerId)
            .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map((o: any) => ({
            id: o.id,
            total: o.total_amount,
            status: o.status,
            createdAt: o.created_at,
            address: o.delivery_address,
            paymentMethod: o.payment_method,
            deliveryMethod: o.delivery_method,
            items: o.order_items.map((i: any) => ({
                id: i.product_id,
                quantity: i.quantity,
                price: i.price_at_purchase,
                name: i.products?.name || 'Produto indisponível',
                image: i.products?.images?.[0] || '',
                category: i.products?.category || '',
                description: i.products?.description || ''
            }))
        }));
    },

    async getFavorites(userId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('favorites')
            .select('product_id')
            .eq('user_id', userId);

        if (error) throw error;
        return data.map((f: any) => f.product_id);
    },

    async getFavoriteProducts(userId: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('favorites')
            .select('product_id, products(*, product_batches(*))')
            .eq('user_id', userId);

        if (error) throw error;

        return data.map((item: any) => {
            const p = item.products;
            return {
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                promotionalPrice: p.promotional_price,
                image: p.images?.[0] || '',
                category: p.category,
                requiresPrescription: p.requires_prescription,
                stock: p.product_batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0
            };
        });
    },

    async toggleFavorite(userId: string, productId: string): Promise<{ favorited: boolean }> {
        const { data: exists } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (exists) {
            await supabase
                .from('favorites')
                .delete()
                .eq('id', exists.id);
            return { favorited: false };
        } else {
            await supabase
                .from('favorites')
                .insert({ user_id: userId, product_id: productId });
            return { favorited: true };
        }
    }
};
