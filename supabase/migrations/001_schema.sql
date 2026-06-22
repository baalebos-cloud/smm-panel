-- ============================================================
-- 001_users.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'reseller', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 002_services.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  rate NUMERIC(10, 2) NOT NULL,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER NOT NULL,
  delivery TEXT NOT NULL,
  refill BOOLEAN NOT NULL DEFAULT FALSE,
  popular BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  provider_service_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 003_orders.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending','Processing','In Progress','Completed','Cancelled','Partial','Refunded')),
  start_count INTEGER,
  remains INTEGER,
  provider_order_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 004_wallet_transactions.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'pending', 'failed')),
  method TEXT CHECK (method IN ('card', 'transfer', 'opay', 'crypto')),
  reference TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 005_rls_policies.sql
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "profiles_self" ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Orders: users can only see/insert their own
CREATE POLICY "orders_select_self" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_self" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallet transactions: read-only for owner
CREATE POLICY "wallet_tx_select_self" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallet_tx_insert_self" ON wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
