export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            cmed_cache: {
                Row: {
                    created_at: string
                    id: string
                    query: string
                    response_json: Json
                }
                Insert: {
                    created_at?: string
                    id?: string
                    query: string
                    response_json: Json
                }
                Update: {
                    created_at?: string
                    id?: string
                    query?: string
                    response_json?: Json
                }
                Relationships: []
            }
            cmed_prices: {
                Row: {
                    active_ingredient: string | null
                    drug_name: string | null
                    id: string
                    laboratory: string | null
                    last_update: string | null
                    pf_value: number | null
                    pmc_value: number | null
                    pmvg_value: number | null
                    presentation: string | null
                    registration_number: string | null
                    therapeutic_class: string | null
                }
                Insert: {
                    active_ingredient?: string | null
                    drug_name?: string | null
                    id?: string
                    laboratory?: string | null
                    last_update?: string | null
                    pf_value?: number | null
                    pmc_value?: number | null
                    pmvg_value?: number | null
                    presentation?: string | null
                    registration_number?: string | null
                    therapeutic_class?: string | null
                }
                Update: {
                    active_ingredient?: string | null
                    drug_name?: string | null
                    id?: string
                    laboratory?: string | null
                    last_update?: string | null
                    pf_value?: number | null
                    pmc_value?: number | null
                    pmvg_value?: number | null
                    presentation?: string | null
                    registration_number?: string | null
                    therapeutic_class?: string | null
                }
                Relationships: []
            }
            customers: {
                Row: {
                    address: string | null
                    birth_date: string | null
                    cpf: string | null
                    created_at: string
                    email: string | null
                    id: string
                    insurance_plan_id: string | null
                    internal_notes: string | null
                    name: string
                    phone: string
                    referrer: string | null
                    status: string
                    tags: string[] | null
                    updated_at: string
                }
                Insert: {
                    address?: string | null
                    birth_date?: string | null
                    cpf?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    insurance_plan_id?: string | null
                    internal_notes?: string | null
                    name: string
                    phone: string
                    referrer?: string | null
                    status?: string
                    tags?: string[] | null
                    updated_at?: string
                }
                Update: {
                    address?: string | null
                    birth_date?: string | null
                    cpf?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    insurance_plan_id?: string | null
                    internal_notes?: string | null
                    name?: string
                    phone?: string
                    referrer?: string | null
                    status?: string
                    tags?: string[] | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "customers_insurance_plan_id_fkey"
                        columns: ["insurance_plan_id"]
                        isOneToOne: false
                        referencedRelation: "insurance_plans"
                        referencedColumns: ["id"]
                    },
                ]
            }
            daily_offers: {
                Row: {
                    active: boolean | null
                    created_at: string
                    id: string
                    image_url: string | null
                    product_id: string | null
                    subtitle: string | null
                    title: string
                    updated_at: string
                }
                Insert: {
                    active?: boolean | null
                    created_at?: string
                    id?: string
                    image_url?: string | null
                    product_id?: string | null
                    subtitle?: string | null
                    title: string
                    updated_at?: string
                }
                Update: {
                    active?: boolean | null
                    created_at?: string
                    id?: string
                    image_url?: string | null
                    product_id?: string | null
                    subtitle?: string | null
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_offers_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            favorites: {
                Row: {
                    created_at: string
                    id: string
                    product_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    product_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    product_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "favorites_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "favorites_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            insurance_plans: {
                Row: {
                    active: boolean | null
                    created_at: string
                    discount_percentage: number
                    id: string
                    name: string
                }
                Insert: {
                    active?: boolean | null
                    created_at?: string
                    discount_percentage: number
                    id?: string
                    name: string
                }
                Update: {
                    active?: boolean | null
                    created_at?: string
                    discount_percentage?: number
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            invoice_logs: {
                Row: {
                    action: string
                    created_at: string
                    details: Json | null
                    id: string
                    invoice_id: string | null
                    user_id: string | null
                }
                Insert: {
                    action: string
                    created_at?: string
                    details?: Json | null
                    id?: string
                    invoice_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    action?: string
                    created_at?: string
                    details?: Json | null
                    id?: string
                    invoice_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "invoice_logs_invoice_id_fkey"
                        columns: ["invoice_id"]
                        isOneToOne: false
                        referencedRelation: "invoices"
                        referencedColumns: ["id"]
                    },
                ]
            }
            invoices: {
                Row: {
                    created_at: string
                    enotas_id: string | null
                    error_message: string | null
                    id: string
                    link_pdf: string | null
                    link_xml: string | null
                    number: string | null
                    order_id: string | null
                    series: string | null
                    status: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    enotas_id?: string | null
                    error_message?: string | null
                    id?: string
                    link_pdf?: string | null
                    link_xml?: string | null
                    number?: string | null
                    order_id?: string | null
                    series?: string | null
                    status?: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    enotas_id?: string | null
                    error_message?: string | null
                    id?: string
                    link_pdf?: string | null
                    link_xml?: string | null
                    number?: string | null
                    order_id?: string | null
                    series?: string | null
                    status?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "invoices_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                ]
            }
            newsletter_subscribers: {
                Row: {
                    created_at: string
                    email: string
                    id: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    id?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    id?: string
                }
                Relationships: []
            }
            order_items: {
                Row: {
                    created_at: string
                    discount_applied: number | null
                    id: string
                    original_price: number | null
                    price_at_purchase: number
                    product_id: string | null
                    quantity: number
                }
                Insert: {
                    created_at?: string
                    discount_applied?: number | null
                    id?: string
                    original_price?: number | null
                    price_at_purchase: number
                    product_id?: string | null
                    quantity: number
                }
                Update: {
                    created_at?: string
                    discount_applied?: number | null
                    id?: string
                    original_price?: number | null
                    price_at_purchase?: number
                    product_id?: string | null
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    change_amount: number | null
                    created_at: string
                    customer_id: string | null
                    delivery_address: string | null
                    delivery_method: string
                    id: string
                    payment_method: string
                    status: string
                    total_amount: number
                    updated_at: string
                }
                Insert: {
                    change_amount?: number | null
                    created_at?: string
                    customer_id?: string | null
                    delivery_address?: string | null
                    delivery_method: string
                    id?: string
                    payment_method: string
                    status?: string
                    total_amount: number
                    updated_at?: string
                }
                Update: {
                    change_amount?: number | null
                    created_at?: string
                    customer_id?: string | null
                    delivery_address?: string | null
                    delivery_method?: string
                    id?: string
                    payment_method?: string
                    status?: string
                    total_amount?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            price_history: {
                Row: {
                    changed_by: string | null
                    created_at: string
                    field_name: string
                    id: string
                    new_value: string | null
                    old_value: string | null
                    product_id: string | null
                }
                Insert: {
                    changed_by?: string | null
                    created_at?: string
                    field_name: string
                    id?: string
                    new_value?: string | null
                    old_value?: string | null
                    product_id?: string | null
                }
                Update: {
                    changed_by?: string | null
                    created_at?: string
                    field_name?: string
                    id?: string
                    new_value?: string | null
                    old_value?: string | null
                    product_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "price_history_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_batches: {
                Row: {
                    batch_number: string
                    created_at: string
                    expiry_date: string
                    id: string
                    product_id: string | null
                    quantity: number
                }
                Insert: {
                    batch_number: string
                    created_at?: string
                    expiry_date: string
                    id?: string
                    product_id?: string | null
                    quantity: number
                }
                Update: {
                    batch_number?: string
                    created_at?: string
                    expiry_date?: string
                    id?: string
                    product_id?: string | null
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "product_batches_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    category: string
                    created_at: string
                    description: string | null
                    id: string
                    images: string[] | null
                    min_stock_level: number
                    name: string
                    price: number
                    promotional_price: number | null
                    requires_prescription: boolean
                    status: string
                    supplier: string | null
                    updated_at: string
                }
                Insert: {
                    category: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    min_stock_level?: number
                    name: string
                    price: number
                    promotional_price?: number | null
                    requires_prescription?: boolean
                    status?: string
                    supplier?: string | null
                    updated_at?: string
                }
                Update: {
                    category?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    min_stock_level?: number
                    name?: string
                    price?: number
                    promotional_price?: number | null
                    requires_prescription?: boolean
                    status?: string
                    supplier?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            store_settings: {
                Row: {
                    additional_pharmacists: Json | null
                    address: string
                    api_token: string | null
                    banner_url: string | null
                    cnae: string | null
                    cnpj: string
                    created_at: string
                    delivery_fee_type: string
                    email: string
                    enotas_enabled: boolean | null
                    estimated_delivery_time: number
                    fixed_delivery_fee: number
                    free_shipping_threshold: number
                    id: string
                    ie: string | null
                    im: string | null
                    logo_url: string | null
                    notification_email_channel: boolean
                    notification_low_stock: boolean
                    notification_new_order: boolean
                    notification_push_channel: boolean
                    opening_hours: string
                    payment_cash_enabled: boolean
                    payment_credit_enabled: boolean
                    payment_credit_max_installments: number
                    payment_debit_enabled: boolean
                    payment_pix_enabled: boolean
                    payment_pix_key: string | null
                    pharmacist_name: string | null
                    pharmacist_register: string | null
                    pharmacy_name: string
                    phone: string
                    primary_color: string
                    secondary_color: string
                    social_facebook: string | null
                    social_instagram: string | null
                    social_linkedin: string | null
                    social_tiktok: string | null
                    social_twitter: string | null
                    social_whatsapp: string | null
                    tax_regime: string | null
                    updated_at: string
                    vip_discount_percentage: number
                    vip_enabled: boolean
                    vip_inactivity_days: number
                    vip_min_order_count: number
                    vip_min_spent: number
                    welcome_message: string | null
                    welcome_message_bg_color: string | null
                    welcome_message_text_color: string | null
                }
                Insert: {
                    additional_pharmacists?: Json | null
                    address: string
                    api_token?: string | null
                    banner_url?: string | null
                    cnae?: string | null
                    cnpj: string
                    created_at?: string
                    delivery_fee_type?: string
                    email: string
                    enotas_enabled?: boolean | null
                    estimated_delivery_time?: number
                    fixed_delivery_fee?: number
                    free_shipping_threshold?: number
                    id?: string
                    ie?: string | null
                    im?: string | null
                    logo_url?: string | null
                    notification_email_channel?: boolean
                    notification_low_stock?: boolean
                    notification_new_order?: boolean
                    notification_push_channel?: boolean
                    opening_hours: string
                    payment_cash_enabled?: boolean
                    payment_credit_enabled?: boolean
                    payment_credit_max_installments?: number
                    payment_debit_enabled?: boolean
                    payment_pix_enabled?: boolean
                    payment_pix_key?: string | null
                    pharmacist_name?: string | null
                    pharmacist_register?: string | null
                    pharmacy_name: string
                    phone: string
                    primary_color?: string
                    secondary_color?: string
                    social_facebook?: string | null
                    social_instagram?: string | null
                    social_linkedin?: string | null
                    social_tiktok?: string | null
                    social_twitter?: string | null
                    social_whatsapp?: string | null
                    tax_regime?: string | null
                    updated_at?: string
                    vip_discount_percentage?: number
                    vip_enabled?: boolean
                    vip_inactivity_days?: number
                    vip_min_order_count?: number
                    vip_min_spent?: number
                    welcome_message?: string | null
                    welcome_message_bg_color?: string | null
                    welcome_message_text_color?: string | null
                }
                Update: {
                    additional_pharmacists?: Json | null
                    address?: string
                    api_token?: string | null
                    banner_url?: string | null
                    cnae?: string | null
                    cnpj?: string
                    created_at?: string
                    delivery_fee_type?: string
                    email?: string
                    enotas_enabled?: boolean | null
                    estimated_delivery_time?: number
                    fixed_delivery_fee?: number
                    free_shipping_threshold?: number
                    id?: string
                    ie?: string | null
                    im?: string | null
                    logo_url?: string | null
                    notification_email_channel?: boolean
                    notification_low_stock?: boolean
                    notification_new_order?: boolean
                    notification_push_channel?: boolean
                    opening_hours?: string
                    payment_cash_enabled?: boolean
                    payment_credit_enabled?: boolean
                    payment_credit_max_installments?: number
                    payment_debit_enabled?: boolean
                    payment_pix_enabled?: boolean
                    payment_pix_key?: string | null
                    pharmacist_name?: string | null
                    pharmacist_register?: string | null
                    pharmacy_name?: string
                    phone?: string
                    primary_color?: string
                    secondary_color?: string
                    social_facebook?: string | null
                    social_instagram?: string | null
                    social_linkedin?: string | null
                    social_tiktok?: string | null
                    social_twitter?: string | null
                    social_whatsapp?: string | null
                    tax_regime?: string | null
                    updated_at?: string
                    vip_discount_percentage?: number
                    vip_enabled?: boolean
                    vip_inactivity_days?: number
                    vip_min_order_count?: number
                    vip_min_spent?: number
                    welcome_message?: string | null
                    welcome_message_bg_color?: string | null
                    welcome_message_text_color?: string | null
                }
                Relationships: []
            }
            users: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    email: string
                    id: string
                    name: string
                    role: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    email: string
                    id?: string
                    name: string
                    role?: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    email?: string
                    id?: string
                    name?: string
                    role?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            create_pdv_sale: {
                Args: {
                    p_customer_id: string
                    p_total_amount: number
                    p_payment_method: string
                    p_amount_paid: number
                    p_change_amount: number
                    p_items: Json
                }
                Returns: {
                    success: boolean
                    order_id: string
                    error: string
                }[]
            }
            login_or_register_customer: {
                Args: {
                    p_name: string
                    p_phone: string
                }
                Returns: {
                    address: string | null
                    birth_date: string | null
                    cpf: string | null
                    created_at: string
                    email: string | null
                    id: string
                    insurance_plan_id: string | null
                    internal_notes: string | null
                    name: string
                    phone: string
                    referrer: string | null
                    status: string
                    tags: string[] | null
                    updated_at: string
                }[]
            }
            update_customer_profile: {
                Args: {
                    p_id: string
                    p_name: string
                    p_email: string
                    p_address: string
                    p_cpf: string
                    p_birth_date: string
                }
                Returns: undefined
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<T = any> = any;
export type TablesInsert<T = any> = any;
export type TablesUpdate<T = any> = any;
export type Enums<T = any> = any;
export type CompositeTypes<T = any> = any;
