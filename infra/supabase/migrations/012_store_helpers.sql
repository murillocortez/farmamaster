-- MIGRATION: 012_store_helpers.sql
-- DATE: 2025-12-12
-- DESC: Adds RPC functions to allow Anonymous Customers (Lite Mode) to access their data (Orders, Favorites) without RLS issues.

-- 1. Get Customer Orders (Bypassing RLS on orders table)
CREATE OR REPLACE FUNCTION public.get_customer_orders(p_customer_id uuid)
RETURNS TABLE (
  id uuid,
  total_amount numeric,
  status text,
  created_at timestamptz,
  delivery_address text,
  payment_method text,
  delivery_method text,
  items json
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.total_amount,
    o.status,
    o.created_at,
    o.delivery_address,
    o.payment_method,
    o.delivery_method,
    (
      SELECT json_agg(
        json_build_object(
          'id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price_at_purchase, -- Ensure column name matches schema
          'name', p.name,
          'image', CASE WHEN jsonb_typeof(p.images) = 'array' THEN (p.images->>0) ELSE NULL END, -- Safe JSON extraction
          'category', p.category,
          'description', p.description
        )
      )
      FROM public.order_items oi
      LEFT JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = o.id
    ) as items
  FROM public.orders o
  WHERE o.customer_id = p_customer_id
  AND o.created_at >= (now() - interval '6 months')
  ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_orders TO anon, authenticated;

-- 2. Get Customer Favorites
CREATE OR REPLACE FUNCTION public.get_customer_favorites(p_user_id uuid)
RETURNS TABLE (
  product_id uuid,
  product json
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.product_id,
    (
      SELECT row_to_json(p_row) 
      FROM (
        SELECT p.*, 
          COALESCE((SELECT sum(quantity) FROM product_batches pb WHERE pb.product_id = p.id), 0) as stock_sum
        FROM products p 
        WHERE p.id = f.product_id
      ) p_row
    ) as product
  FROM public.favorites f
  WHERE f.user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_favorites TO anon, authenticated;

-- 3. Toggle Favorite
CREATE OR REPLACE FUNCTION public.toggle_customer_favorite(p_user_id uuid, p_product_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists uuid;
BEGIN
  SELECT id INTO v_exists FROM public.favorites WHERE user_id = p_user_id AND product_id = p_product_id;
  
  IF v_exists IS NOT NULL THEN
    DELETE FROM public.favorites WHERE id = v_exists;
    RETURN false; -- Removed
  ELSE
    INSERT INTO public.favorites (user_id, product_id) VALUES (p_user_id, p_product_id);
    RETURN true; -- Added
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_customer_favorite TO anon, authenticated;
