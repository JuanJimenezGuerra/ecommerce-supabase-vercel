-- Create ENUMs for statuses
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'shipped');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_gateway AS ENUM ('wompi', 'mercadopago');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table: profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_price numeric not null,
  currency text default 'COP',
  stock integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id), 
  guest_email text,
  customer_name text,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_department text,
  total_amount numeric not null,
  status order_status default 'pending'::order_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  unit_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  gateway payment_gateway not null,
  transaction_id text,
  amount numeric not null,
  status payment_status default 'pending'::payment_status,
  webhook_payload jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to handle new user registration triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Role/Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());

-- Policies for orders
-- Guests can't read orders via API. Authed users can read theirs.
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
-- Insert via edge functions which bypass RLS. Or we allow insert with anon role? 
-- Better to allow inserts for authenticated users if they buy inside the app natively:
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.is_admin());

-- Policies for order_items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.is_admin());

-- Initial product seeding
INSERT INTO public.products (id, name, description, base_price) VALUES 
('00000000-0000-0000-0000-000000000001', 'La Abuela Savia', 'Crema rejuvenecedora formulada a partir de savia', 80000)
ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price;
