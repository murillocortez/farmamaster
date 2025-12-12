-- 006_fix_auth_trigger.sql

-- Update the handle_new_user trigger function to support tenant_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'OPERADOR'),
    (new.raw_user_meta_data->>'tenant_id')::uuid
  );
  RETURN new;
END;
$$;
