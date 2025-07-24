/*
  # Consolidated Database Schema for DAMP Smart Drinkware
  
  1. New Tables
    - `profiles` - User profile information
    - `user_profiles` - Extended user profile data
    - `device_registrations` - Device registration tracking
    - `user_greetings` - Personalized user greetings
    - `device_data` - Smart drinkware device information
    - `stripe_customers` - Stripe customer mapping
    - `stripe_subscriptions` - Subscription management
    - `stripe_orders` - Order tracking
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
  
  3. Functions & Triggers
    - Automatic timestamp updates
    - User profile creation on signup
    - Login tracking
*/

-- Drop existing tables if they exist to start clean
DROP TABLE IF EXISTS device_data CASCADE;
DROP TABLE IF EXISTS user_greetings CASCADE;
DROP TABLE IF EXISTS device_registrations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS stripe_orders CASCADE;
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_last_login() CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS stripe_subscription_status CASCADE;
DROP TYPE IF EXISTS stripe_order_status CASCADE;

-- Create handle_updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table (main user profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{"theme": "system", "language": "en", "notifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_profiles table (extended user data)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{"theme": "system", "language": "en", "notifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Create device_registrations table
CREATE TABLE device_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  device_name TEXT NOT NULL,
  operating_system TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  device_metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_greetings table
CREATE TABLE user_greetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  greeting_message TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  time_context TEXT CHECK (time_context IN ('morning', 'afternoon', 'evening', 'night', 'any')),
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create device_data table
CREATE TABLE device_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cup', 'sleeve', 'bottle', 'bottom', 'damp-cup')),
  status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
  battery_level INTEGER NOT NULL CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER NOT NULL CHECK (signal_strength >= 1 AND signal_strength <= 5),
  firmware TEXT,
  bluetooth_id TEXT,
  zone_id TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Stripe related types
CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
);

CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);

-- Create stripe_customers table
CREATE TABLE stripe_customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Create stripe_subscriptions table
CREATE TABLE stripe_subscriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id TEXT UNIQUE NOT NULL,
  subscription_id TEXT DEFAULT NULL,
  price_id TEXT DEFAULT NULL,
  current_period_start BIGINT DEFAULT NULL,
  current_period_end BIGINT DEFAULT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT DEFAULT NULL,
  payment_method_last4 TEXT DEFAULT NULL,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Create stripe_orders table
CREATE TABLE stripe_orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status stripe_order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Create views for user data
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

CREATE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

-- Create indexes for faster queries
CREATE INDEX idx_device_registrations_user_id ON device_registrations(user_id);
CREATE INDEX idx_user_greetings_user_id ON user_greetings(user_id);
CREATE INDEX idx_device_registrations_status ON device_registrations(status);
CREATE INDEX idx_user_greetings_time_context ON user_greetings(time_context);
CREATE INDEX idx_device_data_user_id ON device_data(user_id);
CREATE INDEX idx_device_data_type ON device_data(type);
CREATE INDEX idx_device_data_status ON device_data(status);
CREATE INDEX idx_device_data_zone_id ON device_data(zone_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_greetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for device_registrations
CREATE POLICY "Users can view their own devices"
  ON device_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own devices"
  ON device_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own devices"
  ON device_registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own devices"
  ON device_registrations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for user_greetings
CREATE POLICY "Users can view their own greetings"
  ON user_greetings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own greetings"
  ON user_greetings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own greetings"
  ON user_greetings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own greetings"
  ON user_greetings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for device_data
CREATE POLICY "Users can view their own devices"
  ON device_data FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own devices"
  ON device_data FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own devices"
  ON device_data FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own devices"
  ON device_data FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for stripe tables
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) AND (deleted_at IS NULL));

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Grant access to views
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_user_greetings_updated_at
  BEFORE UPDATE ON user_greetings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_device_data_updated_at
  BEFORE UPDATE ON device_data
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile in profiles table
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create profile in user_profiles table
  INSERT INTO user_profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.created_at, 
    NEW.created_at
  );
  
  -- Insert default greetings for the new user
  INSERT INTO user_greetings (user_id, greeting_message, time_context, is_custom)
  VALUES 
    (NEW.id, 'Good morning', 'morning', false),
    (NEW.id, 'Good afternoon', 'afternoon', false),
    (NEW.id, 'Good evening', 'evening', false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_login = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for login
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();