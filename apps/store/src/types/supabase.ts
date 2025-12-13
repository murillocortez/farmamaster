export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            abc_curve: {
                Row: {
                    accumulated_percentage: number | null
                    average_stock: number | null
                    classification: string | null
                    id: string
                    last_calculated: string | null
                    participation_percentage: number | null
                    product_id: string | null
                    total_sold_amount: number | null
                    total_sold_quantity: number | null
                    turnover_rate: number | null
                }
                Insert: {
                    accumulated_percentage?: number | null
                    average_stock?: number | null
                    classification?: string | null
                    id?: string
                    last_calculated?: string | null
                    participation_percentage?: number | null
                    product_id?: string | null
                    total_sold_amount?: number | null
                    total_sold_quantity?: number | null
                    turnover_rate?: number | null
                }
                Update: {
                    accumulated_percentage?: number | null
                    average_stock?: number | null
                    classification?: string | null
                    id?: string
                    last_calculated?: string | null
                    participation_percentage?: number | null
                    product_id?: string | null
                    total_sold_amount?: number | null
                    total_sold_quantity?: number | null
                    turnover_rate?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "abc_curve_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: true
                        referencedRelation: "product_stock_view"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "abc_curve_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: true
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            billing_invoices: {
                Row: {
                    amount: number
                    created_at: string | null
                    due_date: string | null
                    hosted_invoice_url: string | null
                    id: string
                    paid_at: string | null
                    pdf_url: string | null
                    reference_month: string | null
                    status: string | null
                    subscription_id: string | null
                    tenant_id: string
                    updated_at: string | null
                }
                Insert: {
                    amount: number
                    created_at?: string | null
                    due_date?: string | null
                    hosted_invoice_url?: string | null
                    id?: string
                    paid_at?: string | null
                    pdf_url?: string | null
                    reference_month?: string | null
                    status?: string | null
                    subscription_id?: string | null
                    tenant_id: string
                    updated_at?: string | null
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    due_date?: string | null
                    hosted_invoice_url?: string | null
                    id?: string
                    paid_at?: string | null
                    pdf_url?: string | null
                    reference_month?: string | null
                    status?: string | null
                    subscription_id?: string | null
                    tenant_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "billing_invoices_subscription_id_fkey"
                        columns: ["subscription_id"]
                        isOneToOne: false
                        referencedRelation: "tenant_subscriptions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "billing_invoices_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            billing_payments: {
                Row: {
                    amount: number | null
                    created_at: string | null
                    id: string
                    invoice_id: string | null
                    payload: Json | null
                    provider: string
                    provider_transaction_id: string | null
                    status: string | null
                    tenant_id: string | null
                }
                Insert: {
                    amount?: number | null
                    created_at?: string | null
                    id?: string
                    invoice_id?: string | null
                    payload?: Json | null
                    provider: string
                    provider_transaction_id?: string | null
                    status?: string | null
                    tenant_id?: string | null
                }
                Update: {
                    amount?: number | null
                    created_at?: string | null
                    id?: string
                    invoice_id?: string | null
                    payload?: Json | null
                    provider?: string
                    provider_transaction_id?: string | null
                    status?: string | null
                    tenant_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "billing_payments_invoice_id_fkey"
                        columns: ["invoice_id"]
                        isOneToOne: false
                        referencedRelation: "billing_invoices"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "billing_payments_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
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
                    loyalty_points: number | null
                    name: string
                    phone: string | null
                    status: string | null
                    tags: string[] | null
                    tenant_id: string
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
                    loyalty_points?: number | null
                    name: string
                    phone?: string | null
                    status?: string | null
                    tags?: string[] | null
                    tenant_id: string
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
                    loyalty_points?: number | null
                    name?: string
                    phone?: string | null
                    status?: string | null
                    tags?: string[] | null
                    tenant_id?: string
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
                    {
                        foreignKeyName: "customers_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            daily_offers: {
                Row: {
                    active: boolean | null
                    created_at: string | null
                    discount_percentage: number
                    end_date: string
                    id: string
                    product_id: string | null
                    start_date: string
                    tenant_id: string
                }
                Insert: {
                    active?: boolean | null
                    created_at?: string | null
                    discount_percentage: number
                    end_date: string
                    id?: string
                    product_id?: string | null
                    start_date?: string
                    tenant_id: string
                }
                Update: {
                    active?: boolean | null
                    created_at?: string | null
                    discount_percentage?: number
                    end_date?: string
                    id?: string
                    product_id?: string | null
                    start_date?: string
                    tenant_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_offers_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "product_stock_view"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "daily_offers_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "daily_offers_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            events: {
                Row: {
                    created_at: string | null
                    event_category: string
                    event_type: string
                    id: string
                    metadata: Json | null
                    tenant_id: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    event_category: string
                    event_type: string
                    id?: string
                    metadata?: Json | null
                    tenant_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    event_category?: string
                    event_type?: string
                    id?: string
                    metadata?: Json | null
                    tenant_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "events_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            favorites: {
                Row: {
                    created_at: string | null
                    id: string
                    product_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    product_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    product_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "favorites_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "product_stock_view"
                        referencedColumns: ["id"]
                    },
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
                    coverage_details: Json | null
                    created_at: string
                    id: string
                    name: string
                    tenant_id: string
                    updated_at: string
                }
                Insert: {
                    coverage_details?: Json | null
                    created_at?: string
                    id?: string
                    name: string
                    tenant_id: string
                    updated_at?: string
                }
                Update: {
                    coverage_details?: Json | null
                    created_at?: string
                    id?: string
                    name?: string
                    tenant_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "insurance_plans_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications: {
                Row: {
                    created_at: string | null
                    id: string
                    link: string | null
                    message: string
                    read: boolean | null
                    tenant_id: string | null
                    title: string
                    type: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    link?: string | null
                    message: string
                    read?: boolean | null
                    tenant_id?: string | null
                    title: string
                    type?: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    link?: string | null
                    message?: string
                    read?: boolean | null
                    tenant_id?: string | null
                    title?: string
                    type?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notifications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    created_at: string
                    id: string
                    order_id: string | null
                    price_at_purchase: number
                    product_id: string | null
                    quantity: number
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order_id?: string | null
                    price_at_purchase: number
                    product_id?: string | null
                    quantity: number
                }
                Update: {
                    created_at?: string
                    id?: string
                    order_id?: string | null
                    price_at_purchase?: number
                    product_id?: string | null
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "product_stock_view"
                        referencedColumns: ["id"]
                    },
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
                    created_at: string
                    customer_id: string | null
                    delivery_address: string | null
                    delivery_fee: number | null
                    delivery_method: string
                    id: string
                    payment_method: string
                    status: string | null
                    tenant_id: string
                    total_amount: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    customer_id?: string | null
                    delivery_address?: string | null
                    delivery_fee?: number | null
                    delivery_method: string
                    id?: string
                    payment_method: string
                    status?: string | null
                    tenant_id: string
                    total_amount: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    customer_id?: string | null
                    delivery_address?: string | null
                    delivery_fee?: number | null
                    delivery_method?: string
                    id?: string
                    payment_method?: string
                    status?: string | null
                    tenant_id?: string
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
                    {
                        foreignKeyName: "orders_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_batches: {
                Row: {
                    batch_number: string | null
                    created_at: string
                    expiry_date: string | null
                    id: string
                    product_id: string | null
                    quantity: number
                }
                Insert: {
                    batch_number?: string | null
                    created_at?: string
                    expiry_date?: string | null
                    id?: string
                    product_id?: string | null
                    quantity?: number
                }
                Update: {
                    batch_number?: string | null
                    created_at?: string
                    expiry_date?: string | null
                    id?: string
                    product_id?: string | null
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "product_batches_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "product_stock_view"
                        referencedColumns: ["id"]
                    },
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
                    name: string
                    price: number
                    promotional_price: number | null
                    requires_prescription: boolean
                    slug: string | null
                    status: string | null
                    tenant_id: string
                    updated_at: string
                }
                Insert: {
                    category: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    name: string
                    price: number
                    promotional_price?: number | null
                    requires_prescription?: boolean
                    slug?: string | null
                    status?: string | null
                    tenant_id: string
                    updated_at?: string
                }
                Update: {
                    category?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    name?: string
                    price?: number
                    promotional_price?: number | null
                    requires_prescription?: boolean
                    slug?: string | null
                    status?: string | null
                    tenant_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string | null
                    email: string | null
                    id: string
                    role: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    id: string
                    role?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    role?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            store_plans: {
                Row: {
                    code: string | null
                    created_at: string | null
                    features: Json | null
                    id: string
                    is_active: boolean | null
                    limits: Json | null
                    name: string | null
                    price_month: number | null
                    price_year: number | null
                    tenant_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    code?: string | null
                    created_at?: string | null
                    features?: Json | null
                    id?: string
                    is_active?: boolean | null
                    limits?: Json | null
                    name?: string | null
                    price_month?: number | null
                    price_year?: number | null
                    tenant_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    code?: string | null
                    created_at?: string | null
                    features?: Json | null
                    id?: string
                    is_active?: boolean | null
                    limits?: Json | null
                    name?: string | null
                    price_month?: number | null
                    price_year?: number | null
                    tenant_id?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            store_settings: {
                Row: {
                    address: string | null
                    banner_header_url: string | null
                    banner_url: string | null
                    border_radius: string | null
                    cnpj: string | null
                    created_at: string
                    delivery_config: Json | null
                    email: string | null
                    id: string
                    logo_url: string | null
                    minimum_order_value: number | null
                    opening_hours: string | null
                    payment_config: Json | null
                    pharmacy_name: string
                    phone: string | null
                    primary_color: string | null
                    secondary_color: string | null
                    tenant_id: string
                    updated_at: string
                    welcome_message: string | null
                }
                Insert: {
                    address?: string | null
                    banner_header_url?: string | null
                    banner_url?: string | null
                    border_radius?: string | null
                    cnpj?: string | null
                    created_at?: string
                    delivery_config?: Json | null
                    email?: string | null
                    id?: string
                    logo_url?: string | null
                    minimum_order_value?: number | null
                    opening_hours?: string | null
                    payment_config?: Json | null
                    pharmacy_name: string
                    phone?: string | null
                    primary_color?: string | null
                    secondary_color?: string | null
                    tenant_id: string
                    updated_at?: string
                    welcome_message?: string | null
                }
                Update: {
                    address?: string | null
                    banner_header_url?: string | null
                    banner_url?: string | null
                    border_radius?: string | null
                    cnpj?: string | null
                    created_at?: string
                    delivery_config?: Json | null
                    email?: string | null
                    id?: string
                    logo_url?: string | null
                    minimum_order_value?: number | null
                    opening_hours?: string | null
                    payment_config?: Json | null
                    pharmacy_name?: string
                    phone?: string | null
                    primary_color?: string | null
                    secondary_color?: string | null
                    tenant_id?: string
                    updated_at?: string
                    welcome_message?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "store_settings_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: true
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            support_tickets: {
                Row: {
                    category: string
                    created_at: string
                    description: string
                    id: string
                    priority: string
                    resolved_at: string | null
                    status: string
                    subject: string
                    tenant_id: string
                    user_id: string | null
                }
                Insert: {
                    category: string
                    created_at?: string
                    description: string
                    id?: string
                    priority?: string
                    resolved_at?: string | null
                    status?: string
                    subject: string
                    tenant_id: string
                    user_id?: string | null
                }
                Update: {
                    category?: string
                    created_at?: string
                    description?: string
                    id?: string
                    priority?: string
                    resolved_at?: string | null
                    status?: string
                    subject?: string
                    tenant_id?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "support_tickets_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "support_tickets_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenant_engagement: {
                Row: {
                    engagement_score: number | null
                    last_activity_at: string | null
                    risk_level: string | null
                    tenant_id: string
                    updated_at: string | null
                    usage_trends: Json | null
                }
                Insert: {
                    engagement_score?: number | null
                    last_activity_at?: string | null
                    risk_level?: string | null
                    tenant_id: string
                    updated_at?: string | null
                    usage_trends?: Json | null
                }
                Update: {
                    engagement_score?: number | null
                    last_activity_at?: string | null
                    risk_level?: string | null
                    tenant_id?: string
                    updated_at?: string | null
                    usage_trends?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_engagement_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: true
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenant_nudges: {
                Row: {
                    context: Json | null
                    created_at: string | null
                    cta_label: string | null
                    cta_link: string | null
                    id: string
                    message: string
                    nudge_type: string
                    status: string | null
                    tenant_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    context?: Json | null
                    created_at?: string | null
                    cta_label?: string | null
                    cta_link?: string | null
                    id?: string
                    message: string
                    nudge_type: string
                    status?: string | null
                    tenant_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    context?: Json | null
                    created_at?: string | null
                    cta_label?: string | null
                    cta_link?: string | null
                    id?: string
                    message?: string
                    nudge_type?: string
                    status?: string | null
                    tenant_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_nudges_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenant_subscriptions: {
                Row: {
                    cancel_at_period_end: boolean | null
                    canceled_at: string | null
                    created_at: string | null
                    current_period_end: string | null
                    current_period_start: string | null
                    downgrade_to_plan_id: string | null
                    id: string
                    plan_id: string | null
                    started_at: string | null
                    status: string | null
                    tenant_id: string
                    trial_ends_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    cancel_at_period_end?: boolean | null
                    canceled_at?: string | null
                    created_at?: string | null
                    current_period_end?: string | null
                    current_period_start?: string | null
                    downgrade_to_plan_id?: string | null
                    id?: string
                    plan_id?: string | null
                    started_at?: string | null
                    status?: string | null
                    tenant_id: string
                    trial_ends_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    cancel_at_period_end?: boolean | null
                    canceled_at?: string | null
                    created_at?: string | null
                    current_period_end?: string | null
                    current_period_start?: string | null
                    downgrade_to_plan_id?: string | null
                    id?: string
                    plan_id?: string | null
                    started_at?: string | null
                    status?: string | null
                    tenant_id?: string
                    trial_ends_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenant_subscriptions_downgrade_to_plan_id_fkey"
                        columns: ["downgrade_to_plan_id"]
                        isOneToOne: false
                        referencedRelation: "store_plans"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenant_subscriptions_plan_id_fkey"
                        columns: ["plan_id"]
                        isOneToOne: false
                        referencedRelation: "store_plans"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "tenants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenants: {
                Row: {
                    created_at: string
                    custom_domain_admin: string | null
                    custom_domain_store: string | null
                    display_name: string | null
                    domain_activated_at: string | null
                    domain_status: string | null
                    email: string | null
                    id: string
                    last_activity: string | null
                    owner_id: string | null
                    plan_code: string | null
                    plan_id: string | null
                    plan_limits: Json | null
                    slug: string
                    status: string
                    updated_at: string | null
                    verification_token: string | null
                }
                Insert: {
                    created_at?: string
                    custom_domain_admin?: string | null
                    custom_domain_store?: string | null
                    display_name?: string | null
                    domain_activated_at?: string | null
                    domain_status?: string | null
                    email?: string | null
                    id?: string
                    last_activity?: string | null
                    owner_id?: string | null
                    plan_code?: string | null
                    plan_id?: string | null
                    plan_limits?: Json | null
                    slug: string
                    status?: string
                    updated_at?: string | null
                    verification_token?: string | null
                }
                Update: {
                    created_at?: string
                    custom_domain_admin?: string | null
                    custom_domain_store?: string | null
                    display_name?: string | null
                    domain_activated_at?: string | null
                    domain_status?: string | null
                    email?: string | null
                    id?: string
                    last_activity?: string | null
                    owner_id?: string | null
                    plan_code?: string | null
                    plan_id?: string | null
                    plan_limits?: Json | null
                    slug?: string
                    status?: string
                    updated_at?: string | null
                    verification_token?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenants_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenants_plan_id_fkey"
                        columns: ["plan_id"]
                        isOneToOne: false
                        referencedRelation: "store_plans"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            master_active_tenants: {
                Row: {
                    blocked_count: number | null
                    count: number | null
                    pending_count: number | null
                }
                Relationships: []
            }
            master_churn_30d: {
                Row: {
                    canceled_tenants: number | null
                    churn_rate: number | null
                    total_tenants_30d_ago: number | null
                }
                Relationships: []
            }
            master_engagement_by_plan: {
                Row: {
                    avg_score: number | null
                    plan_name: string | null
                    tenant_count: number | null
                }
                Relationships: []
            }
            master_engagement_stats: {
                Row: {
                    avg_score: number | null
                    healthy_count: number | null
                    high_risk_count: number | null
                }
                Relationships: []
            }
            master_financial_delinquency: {
                Row: {
                    default_amount: number | null
                    default_count: number | null
                }
                Relationships: []
            }
            master_financial_mrr: {
                Row: {
                    paying_tenants: number | null
                    total_mrr: number | null
                }
                Relationships: []
            }
            master_financial_stats: {
                Row: {
                    arr_projected: number | null
                    default_amount: number | null
                    default_count: number | null
                    mrr: number | null
                    paying_customers: number | null
                }
                Relationships: []
            }
            master_mrr_summary: {
                Row: {
                    enterprise_mrr: number | null
                    pro_mrr: number | null
                    starter_mrr: number | null
                    total_mrr: number | null
                }
                Relationships: []
            }
            master_mrr_timeline: {
                Row: {
                    month: string | null
                    mrr: number | null
                    total_paid: number | null
                }
                Relationships: []
            }
            master_retention_metrics: {
                Row: {
                    active_tenants_count: number | null
                    at_risk_count: number | null
                    churn_rate_calc: number | null
                }
                Relationships: []
            }
            master_tenants_at_risk: {
                Row: {
                    count: number | null
                }
                Relationships: []
            }
            product_stock_view: {
                Row: {
                    id: string | null
                    stock_sum: number | null
                }
                Relationships: []
            }
            tenant_retention_status: {
                Row: {
                    days_without_activity: number | null
                    effective_last_activity: string | null
                    is_at_risk: boolean | null
                    risk_factor: string | null
                    tenant_id: string | null
                    tenant_name: string | null
                    tenant_status: string | null
                    total_events_last_30_days: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenants_owner_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenants_plan_id_fkey"
                        columns: ["tenant_id"]
                        isOneToOne: false
                        referencedRelation: "store_plans"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tenant_with_plan: {
                Row: {
                    created_at: string | null
                    custom_domain_admin: string | null
                    custom_domain_store: string | null
                    display_name: string | null
                    domain_activated_at: string | null
                    domain_status: string | null
                    email: string | null
                    id: string | null
                    last_activity: string | null
                    owner_id: string | null
                    plan_code: string | null
                    plan_code_real: string | null
                    plan_features: Json | null
                    plan_id: string | null
                    plan_limits: Json | null
                    plan_name: string | null
                    plan_table_id: string | null
                    slug: string | null
                    status: string | null
                    updated_at: string | null
                    verification_token: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tenants_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tenants_plan_id_fkey"
                        columns: ["plan_id"]
                        isOneToOne: false
                        referencedRelation: "store_plans"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Functions: {
            calculate_tenant_engagement: {
                Args: {
                    p_tenant_id: string
                }
                Returns: undefined
            }
            change_plan: {
                Args: {
                    p_tenant_id: string
                    p_new_plan_id: string
                }
                Returns: Json
            }
            check_feature_access: {
                Args: {
                    p_tenant_id: string
                    p_feature_code: string
                }
                Returns: Json
            }
            create_complete_order: {
                Args: {
                    p_tenant_id: string
                    p_customer_id: string
                    p_items: Json
                    p_total: number
                    p_payment_method: string
                    p_delivery_method: string
                    p_address?: Json
                    p_delivery_fee?: number
                }
                Returns: Json
            }
            create_complete_order_v2: {
                Args: {
                    p_slug: string
                    p_customer_id: string
                    p_items: Json
                    p_total: number
                    p_payment_method: string
                    p_delivery_method: string
                    p_address?: Json
                    p_delivery_fee?: number
                }
                Returns: Json
            }
            create_pdv_sale: {
                Args: {
                    p_tenant_id: string
                    p_cashier_id: string
                    p_total_amount: number
                    p_payment_method: string
                    p_items: Json
                    p_customer_cpf?: string
                    p_discount?: number
                }
                Returns: Json
            }
            generate_monthly_invoices: {
                Args: Record<PropertyKey, never>
                Returns: number
            }
            generate_nudges: {
                Args: {
                    p_tenant_id: string
                }
                Returns: undefined
            }
            get_cost: {
                Args: {
                    amount: number
                    recurrence: string
                    type: string
                }
                Returns: string
            }
            get_customer_favorites: {
                Args: {
                    p_user_id: string
                }
                Returns: {
                    created_at: string | null
                    product: Json | null
                    product_id: string | null
                }[]
            }
            get_customer_orders: {
                Args: {
                    p_customer_id: string
                }
                Returns: {
                    created_at: string
                    delivery_address: string | null
                    delivery_method: string
                    id: string
                    items: Json | null
                    payment_method: string
                    status: string | null
                    total_amount: number
                }[]
            }
            get_my_role: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_my_tenant_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_store_context_tenant: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_store_offers_rpc: {
                Args: {
                    p_slug: string
                }
                Returns: {
                    active: boolean | null
                    created_at: string | null
                    discount_percentage: number
                    end_date: string
                    id: string
                    product_id: string | null
                    start_date: string
                    tenant_id: string
                }[]
            }
            get_store_products: {
                Args: {
                    p_slug: string
                }
                Returns: {
                    category: string
                    created_at: string
                    description: string | null
                    id: string
                    images: string[] | null
                    name: string
                    price: number
                    promotional_price: number | null
                    requires_prescription: boolean
                    slug: string | null
                    status: string | null
                    tenant_id: string
                    updated_at: string
                }[]
            }
            get_store_products_with_batches: {
                Args: {
                    p_slug: string
                }
                Returns: {
                    category: string
                    description: string
                    id: string
                    images: string[]
                    name: string
                    price: number
                    promotional_price: number
                    requires_prescription: boolean
                    slug: string
                    tenant_id: string
                    total_stock: number
                }[]
            }
            get_store_settings: {
                Args: {
                    p_slug: string
                }
                Returns: {
                    address: string | null
                    banner_header_url: string | null
                    banner_url: string | null
                    border_radius: string | null
                    cnpj: string | null
                    created_at: string
                    delivery_config: Json | null
                    email: string | null
                    id: string
                    logo_url: string | null
                    minimum_order_value: number | null
                    opening_hours: string | null
                    payment_config: Json | null
                    pharmacy_name: string
                    phone: string | null
                    primary_color: string | null
                    secondary_color: string | null
                    tenant_id: string
                    updated_at: string
                    welcome_message: string | null
                }[]
            }
            handle_new_user: {
                Args: Record<PropertyKey, never>
                Returns: unknown
            }
            login_or_register_customer: {
                Args: {
                    p_name: string
                    p_phone: string
                }
                Returns: Json
            }
            login_or_register_customer_v2: {
                Args: {
                    p_slug: string
                    p_name: string
                    p_phone: string
                }
                Returns: Json
            }
            set_store_context: {
                Args: {
                    p_slug: string
                }
                Returns: Json
            }
            sync_tenant_plan_id: {
                Args: Record<PropertyKey, never>
                Returns: unknown
            }
            toggle_customer_favorite: {
                Args: {
                    p_user_id: string
                    p_product_id: string
                }
                Returns: boolean
            }
            track_event: {
                Args: {
                    p_tenant_id: string
                    p_user_id: string
                    p_event_type: string
                    p_event_category: string
                    p_metadata?: Json
                }
                Returns: boolean
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

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

