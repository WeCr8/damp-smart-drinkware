/*
  # Create device_data table for DAMP smart drinkware management

  1. New Tables
    - `device_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, device display name)
      - `type` (text, device type: cup, sleeve, bottle, bottom, damp-cup)
      - `battery_level` (integer, 0-100)
      - `status` (text, connection status: connected, disconnected, connecting, error)
      - `bluetooth_id` (text, bluetooth device identifier)
      - `firmware` (text, firmware version)
      - `signal_strength` (integer, 1-5)
      - `zone_id` (text, associated zone identifier)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
      - `last_seen` (timestamptz, last activity timestamp)
      - `is_active` (boolean, device active status)
      - `metadata` (jsonb, additional device metadata)

  2. Security
    - Enable RLS on `device_data` table
    - Add policies for authenticated users to manage their own devices
    - Add unique constraint on device name per user
    - Add foreign key constraint to auth.users

  3. Indexes
    - Add indexes for common query patterns
    - Optimize for user-based queries and device lookups
*/

-- Create device_data table
CREATE TABLE IF NOT EXISTS device_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cup', 'sleeve', 'bottle', 'bottom', 'damp-cup')),
  battery_level integer NOT NULL DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error')),
  bluetooth_id text DEFAULT '',
  firmware text DEFAULT '1.0.0',
  signal_strength integer DEFAULT 3 CHECK (signal_strength >= 1 AND signal_strength <= 5),
  zone_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE device_data ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for device name per user
CREATE UNIQUE INDEX IF NOT EXISTS device_data_user_name_unique 
ON device_data (user_id, name) 
WHERE is_active = true;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS device_data_user_id_idx ON device_data (user_id);
CREATE INDEX IF NOT EXISTS device_data_type_idx ON device_data (type);
CREATE INDEX IF NOT EXISTS device_data_status_idx ON device_data (status);
CREATE INDEX IF NOT EXISTS device_data_created_at_idx ON device_data (created_at DESC);
CREATE INDEX IF NOT EXISTS device_data_last_seen_idx ON device_data (last_seen DESC);

-- RLS Policies

-- Policy: Users can view their own devices
CREATE POLICY "Users can view own devices"
  ON device_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own devices
CREATE POLICY "Users can insert own devices"
  ON device_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own devices
CREATE POLICY "Users can update own devices"
  ON device_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own devices
CREATE POLICY "Users can delete own devices"
  ON device_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_device_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_device_data_updated_at
  BEFORE UPDATE ON device_data
  FOR EACH ROW
  EXECUTE FUNCTION handle_device_data_updated_at();